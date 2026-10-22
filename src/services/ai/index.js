/* Dịch vụ AI: giao diện bất đồng bộ dùng chung cho bản giả lập và bản gọi Claude API.
   Mọi hàm trả Promise để màn hình không phụ thuộc vào việc AI chạy tại chỗ hay qua mạng.
     generate(lessonId, type, opts)          → {draft, log}
     autofix(ex, lesson)                     → [mô tả sửa]   (sửa trực tiếp ex.draft)
     questionVariants(ex, qid, chips, n, salt) → [question]
     exerciseVariants(ex, n, salt)           → [draft]
   WS.AI (mock.js) vẫn giữ các hàm tại chỗ không phải AI: ước tính chiều cao, dàn khối, gợi ý bố cục, media giả lập. */
import { WS } from '../../ws.js';

export const mockAIService = {
  kind: 'mock',
  label: 'AI giả lập',
  generate: async (...a) => WS.AI.generate(...a),
  autofix: async (...a) => WS.AI.autofix(...a),
  questionVariants: async (...a) => WS.AI.questionVariants(...a),
  exerciseVariants: async (...a) => WS.AI.exerciseVariants(...a),
};
