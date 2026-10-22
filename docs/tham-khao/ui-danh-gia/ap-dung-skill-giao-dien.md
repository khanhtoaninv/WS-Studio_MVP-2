# Áp dụng skill "giao-dien-content-matrix" cho ws-studio

## 1. Có cải thiện được UI không?
Có, nhưng một phần. Skill là hệ thiết kế (token, nút, thẻ, dark mode, khóa), không phải bộ sửa luồng.
App đã gần với skill: token ở `:root`, `:focus-visible`, `prefers-reduced-motion`, chip trạng thái, ngăn kéo, toast.

Skill giúp (so với bảng chấm trước):
- Khả năng tiếp cận 6 → khoảng 7.5: bậc chữ ≥12px, màu chữ phụ đậm hơn, nút ≥36px, quy tắc aria-label cho nút chỉ có icon, dark mode.
- Nhất quán thị giác 8 → khoảng 8.5: SVG nét thay ký tự và emoji, bộ nút và nhãn `.st` thống nhất.
- Phân cấp: ba tầng Tập trung / Vùng làm việc / Phần phụ trùng hướng D-106; mỗi màn một vùng nổi.
- Trạng thái khóa: quy tắc "mờ, vẫn hiện, có title" khớp BR-17 và khóa mềm.

Skill KHÔNG giải quyết (vẫn phải làm riêng): mã D-xx lộ trong chữ giao diện, số bước wizard lệch, thanh trên trình soạn quá tải, thanh công cụ viewer ~25 nút, kéo thả mục lục. Ước tính tổng thể 7.2 → khoảng 7.7.

## 2. Cần điều chỉnh gì cho ws-studio
1. **Không nạp Google Fonts.** Bản dựng là một tệp HTML chạy offline, không CDN (README, đặc tả mục 4). Dùng font hệ thống, hoặc nhúng bản con Be Vietnam Pro dạng base64 (khoảng 60–120 KB, cần chốt).
2. **Tờ phiếu không đổi theo dark mode và không dùng một font.** Phiếu và tệp xuất giữ nền sáng, chữ serif như bản in (D-14, BR-15). Skill chỉ áp cho "vỏ" app (thanh bên, khung soạn, màn duyệt) và thanh viewer.
3. **Giữ tên lớp hiện có, chỉ đổi giá trị token.** Ánh xạ: `--desk→--bg`, `--line-2→--line-strong`, `--ok→--good`, `--err→--bad`, `--hl→--mark`. Đổi tên lớp sẽ làm vỡ t1–t6 (236 kiểm tra) dùng selector.
4. **Thêm token cho khái niệm riêng của app**: `--orange` (bị trả lại), `--purple` (mở khóa sửa) cần bản tối; skill cho phép thêm token kèm bản tối.
5. **Màu vàng `--mark` = "việc cần làm tiếp"**, một vùng mỗi màn. Trên Dashboard là khối Cần làm ngay; không dùng vàng cho bút đánh dấu trong viewer (đó là màu nội dung, giữ riêng).
6. **Responsive:** skill có tab bar đáy 56px ở ≤760px. Đặc tả cho phép trình soạn chỉ desktop, viewer cả hai. Áp tab bar cho Dashboard, danh sách, viewer; trình soạn giữ thông báo "dùng màn rộng hơn".
7. **Tên và thương hiệu:** chỉ lấy token và quy tắc, không dùng tên "Content Matrix"; giữ nhận diện ws-studio (đặc tả mục 19 câu 9). Accent đổi từ #2D5BD0 sang #2741B0 là chọn lựa riêng, cần bạn chốt (tương phản tốt hơn trên nền sáng).
8. **Nhãn "Done", "note", "Preview"** giữ như đã chốt trong đặc tả; quy tắc "nhãn ngắn, phần phụ trong ngoặc" áp thêm.

## 3. Triển khai
Mỗi đợt kết thúc bằng chạy lại t1–t6 và chụp lại 5 màn hình để so với bản chấm đầu.
- **Đợt 1 (nhỏ, an toàn):** thay giá trị token bằng token của skill; thay mã màu viết thẳng ngoài `:root` (viewer.css có 107 dòng chứa mã màu, phần giao diện app cần dọn); dọn chữ giao diện (gỡ D-xx, sửa "Hai bước đầu").
- **Đợt 2:** bộ icon SVG nét thay ký tự và emoji trong thanh điều hướng, nút, chip (một hàm `icon(name)` trong `ui.js`); thêm `aria-label`.
- **Đợt 3:** dark mode cho vỏ app (khối DARK của skill, theo hệ thống và ép bằng `data-theme`, công tắc ở Cài đặt); tờ phiếu giữ sáng.
- **Đợt 4:** ba tầng thị giác cho Dashboard và Duyệt; gọn thanh trên trình soạn; gom thanh công cụ viewer thành nhóm.
- **Đợt 5:** tab bar điện thoại cho Dashboard, danh sách, viewer; kiểm tra sáng và tối, 375px và 1280px, không cuộn ngang.
Mỗi đợt ghi một mã D-xx, cập nhật mục 14 của đặc tả.
