# Hướng dẫn cho Claude khi làm việc với repo này

Dự án ws-studio: app soạn phiếu bài tập. Chỉ soạn, kiểm tra tiêu chuẩn, duyệt, xuất file; không giao bài, không chấm điểm (riêng Làm bài trên lớp D-129 chấm trên máy chủ máy giáo viên).
Ưu tiên: thao tác soạn mạnh, bài bám tiêu chuẩn. UI tiếng Việt, nội dung phiếu tiếng Anh. Trả lời người dùng bằng tiếng Việt.

## Đọc trước khi làm

1. `docs/ws-studio-mvp-spec.md`: đặc tả. Mục 19A là bảng quyết định D-xx, mục 21 là nhật ký thay đổi.
2. `README.md`: cách chạy, kiểm thử, cấu trúc mã, lộ trình sang React.
3. `docs/chuyen-tai-khoan.md`: cách tiếp tục dự án từ tài khoản khác.
4. `docs/html-phieu/dac-ta-html-phieu.md`: đặc tả tệp HTML phiếu xuất ra (D-139). Đổi `src/viewer/` hoặc `src/domain/export.js` thì sửa tài liệu này và chạy `python tools/tao_mau_html.py` để tạo lại tệp mẫu. Bản trung lập `docs/dac-ta-tinh-nang-trinh-xem-phieu.md` (D-140): khi đổi hành vi viewer thì cập nhật cả bản này, nhưng giữ nó không nhắc tên app, mã D-xx, tên tệp hay hàm.
5. `docs/tham-khao/`: tài liệu thảo luận, ảnh đánh giá giao diện, skill giao diện, mã bản cũ v1 (`ws-studio-v1.zip`, chỉ để đối chiếu).

## Hiện trạng

Mã nguồn chính là v2 (Node + Vite, chia lớp domain / state / services / viewer / ui), nhánh `main`. AI sinh bài chọn ở Cấu hình hệ thống > API (AI giả lập, Claude, OpenAI, Gemini, DeepSeek; D-137), khóa ở máy chủ, lỗi thì quay về AI giả lập. Mục tiêu tiếp theo: chuyển giao diện sang React, chỉ viết lại `src/ui/`.

## Quy tắc làm việc

- Mỗi quyết định mới ghi mã D-xx, tiếp từ số lớn nhất trong mục 19A của đặc tả. Cuối việc, ghi quyết định vào mục 19A, thêm dòng nhật ký ở mục 21 và tăng phiên bản đặc tả.
- Mỗi lần cập nhật app: tăng `VERSION` trong `src/version.js` và ghi `NOTE`; chạy `npm run build` để cập nhật `dist/` (dist có trên git).
- Giữ toàn bộ kiểm tra đạt trước khi đẩy: `npm test` (t1–t9, tổng ghi ở `EXPECTED` trong `tests/run_all.py`) và `npm run test:server`. Trên máy không có Chromium của Playwright, đặt `WS_CHROME` trỏ tới Chromium có sẵn.
- Sau mỗi lần cập nhật, tự commit và đẩy các tệp liên quan lên git.
- Không bao giờ đưa `.env` hoặc `data/` (khóa API) lên git.
- `chay.bat` ở gốc repo tải bản mới nhất và mở app trên Windows; chỉ dùng ký tự ASCII trong tệp này.
