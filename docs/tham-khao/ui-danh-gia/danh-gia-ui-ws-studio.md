# Đánh giá UI ws-studio (bản dựng theo đặc tả v3.5)

**Cách chấm.** Dựng `dist/ws-studio.html`, mở bằng Chromium 1440×900, chụp 5 màn hình chính (Dashboard, Soạn phiếu, Trình soạn, Viewer, Duyệt Phiếu; ảnh cùng thư mục). Chấm theo 10 nguyên tắc dùng được của Nielsen và WCAG 2.2 AA, so với các giao diện chuẩn mực cùng loại: Notion và Google Docs (soạn), Canva (dàn trang và preview), Linear và GitHub (trạng thái, duyệt).

**Giới hạn.** Chỉ xem ảnh chụp ở một cỡ màn hình, chưa đo độ tương phản, chưa thử bàn phím, chưa thử màn hẹp, chưa dùng thử thao tác soạn thật. Điểm về khả năng tiếp cận là ước lượng.

## Bảng điểm (thang 10)

| Tiêu chí | Điểm | Chuẩn so sánh | Nhận xét ngắn |
|---|---|---|---|
| Thẩm mỹ và nhất quán thị giác | 8 | Linear, Notion ≈ 9 | Sáng, gọn, nhiều khoảng trắng, token màu nhất quán, chip trạng thái rõ. Trừ điểm vì bộ biểu tượng lẫn ký tự (⌂ ▤ ❖ ≡) với emoji (🧪 🎯 🚀). |
| Phân cấp thông tin | 7.5 | Notion ≈ 9 | Dashboard và Duyệt Phiếu rõ việc chính. Thanh trên của trình soạn quá tải: tên phiếu, chip, mã, "Cấu hình phiếu", cảnh báo cam xuống hai dòng và nút Duyệt cấp 1 xếp sát nhau. |
| Thấy trạng thái hệ thống (Nielsen 1) | 8.5 | GitHub PR ≈ 9 | Mỗi phiếu và bài có chip trạng thái, "Cần làm ngay", lý do khóa nút hiện cạnh nút, "Đã lưu lúc". Điểm mạnh nhất của app. |
| Thao tác soạn (ưu tiên số 1 của dự án) | 7 | Canva, Google Docs ≈ 9 | Hai nửa Mục lục và Preview cả phiếu là đúng hướng. Mục lục chỉ có nút ↑ ↓ ✕, không thấy kéo thả hay sửa ngay tại thẻ. Preview chữ nhỏ, cần phóng to mới đọc được. |
| Nhãn và ngôn ngữ giao diện | 6.5 | Chuẩn: không lộ nội dung nội bộ | Lỗi rõ nhất: mô tả màn hình còn mã quyết định của đặc tả, như "(D-46)", "(D-42)", "(D-47)", "(D-33)". Màn Soạn phiếu ghi "Hai bước đầu" nhưng thanh bước có 6 bước (đặc tả D-93 nói 4). Lẫn Done, note, Preview, Level với tiếng Việt. |
| Mật độ và quá tải điều khiển | 6.5 | Canva ≈ 8 | Viewer có thanh công cụ hai hàng với khoảng 25 điều khiển (Trang, Cuộn, Trình chiếu, màu, cỡ bút, Quiz, Làm trên phiếu, Bảng nhanh...). Người mới khó biết đâu là việc chính. |
| Khả năng tiếp cận (ước lượng) | 6 | WCAG 2.2 AA | Nhiều chữ phụ nhỏ và xám nhạt (mô tả dưới tiêu đề, siêu dữ liệu trong preview). Một số nút chỉ là biểu tượng. Cần đo tương phản và thử bàn phím trước khi chấm chính thức. |
| Trạng thái trống và độ hoàn thiện | 7 | Linear ≈ 8.5 | Dashboard để trống nửa trái dưới "Cần làm ngay"; Duyệt Phiếu gần như trống khi chỉ có một phiếu. Không có lỗi hiển thị trong các màn đã chụp. |

**Điểm tổng hợp: khoảng 7.2/10.** Hơn mức prototype thông thường, còn cách giao diện chuẩn mực khoảng 1.5 đến 2 điểm, chủ yếu ở độ gọn của trình soạn và độ sạch của nhãn.

## Việc nên sửa trước (theo mức lợi ích)

1. **Gỡ mã D-xx khỏi chữ hiển thị** trong mọi màn hình (sửa nhanh, tăng điểm nhãn lên khoảng 8).
2. **Sửa mô tả màn Soạn phiếu** cho khớp số bước thực tế, và chốt 4 hay 6 bước (đặc tả D-93 và giao diện đang lệch nhau).
3. **Gọn thanh trên của trình soạn:** đưa chip, mã và "Cấu hình phiếu" vào menu "⋯" hoặc một dòng phụ; cảnh báo "Bài 2 chưa Done" chuyển xuống dưới nút hoặc thành tooltip, để nút Duyệt cấp 1 là điểm nhấn duy nhất.
4. **Mục lục bài: kéo thả để đổi thứ tự** và sửa nhanh tiêu đề ngay tại thẻ (đúng ưu tiên "thao tác soạn mạnh").
5. **Viewer: gom thanh công cụ** thành nhóm thu gọn (Xem, Vẽ, Trình bày), mặc định chỉ hiện nhóm Xem.
6. **Thống nhất bộ biểu tượng** (một bộ nét, bỏ emoji trong thanh điều hướng và nút).
7. **Đo tương phản và thử bàn phím** (WCAG AA) rồi mới chốt điểm tiếp cận.
