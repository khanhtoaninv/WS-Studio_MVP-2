/* Điểm vào. Thứ tự import là thứ tự lớp (đặc tả mục 4):
   viewer → dữ liệu → lõi → miền → dịch vụ → giao diện → màn hình → khởi động. */
import './ui/styles/fonts.css';
import './ui/styles/app.css';
import { installViewer } from './viewer/assets.js';
import './services/index.js';

import './domain/data.js';
import './state/store.js';
import './domain/validator.js';
import './services/ai/mock.js';
import './domain/rules.js';
import './domain/importers.js';
import './domain/seed.js';
import './domain/export.js';

import './ui/ui.js';
import './state/actions.js';
import './ui/views/home.js';
import './ui/views/wizard.js';
import './ui/views/editor.js';
import './ui/views/library.js';
import './ui/views/review.js';
import './ui/views/admin.js';
import './ui/views/classroom.js';
import { WS } from './ws.js';
import './ui/app.js';

installViewer();
// Hỏi máy chủ (nếu có) trước khi vẽ để biết AI chạy Claude hay giả lập.
WS.services.detect().finally(() => WS.App.boot());
