/* Chọn bản cài đặt cho từng dịch vụ.
   - Mở dist/ws-studio.html bằng file:// (hoặc không có máy chủ): mọi dịch vụ chạy giả lập, như prototype một tệp.
   - Chạy qua máy chủ (npm run dev / npm start) và máy chủ có ANTHROPIC_API_KEY: AI dùng Claude.
   - VITE_AI_MODE=mock trong .env ép dùng AI giả lập dù máy chủ có khóa.
   Khi Claude lỗi, từng lệnh tự quay về bản giả lập và báo qua config.onFallback (app.js hiện thông báo). */
import { WS } from '../ws.js';
import { mockAIService } from './ai/index.js';
import { createClaudeAIService } from './ai/claude.js';
import { localStorageService } from './storage/local.js';
import { mockPublishService } from './publish/mock.js';
import { httpClassroomService } from './classroom/http.js';

const env = (import.meta.env || {});
export const config = {
  forceMockAI: env.VITE_AI_MODE === 'mock',
  server: null,                    // thông tin /api/health khi có máy chủ
  onFallback: (err) => console.warn('AI fallback:', err),
};

function withFallback(primary, fallback){
  const wrap = (name) => async (...args) => {
    try { return await primary[name](...args); }
    catch(err){ config.onFallback(err, name); return fallback[name](...args); }
  };
  return { kind: primary.kind, label: primary.label, generate: wrap('generate'), autofix: wrap('autofix'),
    questionVariants: wrap('questionVariants'), exerciseVariants: wrap('exerciseVariants') };
}

export const services = WS.services = {
  ai: mockAIService,
  storage: localStorageService,
  publish: mockPublishService,
  classroom: null,                 // có khi chạy qua máy chủ (làm bài trên lớp)
  config,
  /* Hỏi máy chủ đang có gì. Không có máy chủ thì giữ nguyên giả lập. */
  async detect(){
    if(!/^https?:$/.test(location.protocol)) return;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2000);
      const res = await fetch('/api/health', { signal: ctl.signal, cache: 'no-store' }); clearTimeout(t);
      if(!res.ok) return;
      const info = config.server = await res.json();
      if(info.classroom) services.classroom = httpClassroomService;
      if(info.ai === 'claude' && !config.forceMockAI) services.ai = withFallback(createClaudeAIService(info), mockAIService);
    } catch(e){ /* không có máy chủ: chạy giả lập */ }
  },
};
