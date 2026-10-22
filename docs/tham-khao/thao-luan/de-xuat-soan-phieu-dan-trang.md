# Đề xuất cải thiện Soạn phiếu và Dàn trang

Bản đề xuất, chưa sửa mã. Mã quyết định tạm D-133…D-136, chốt khi bạn đồng ý. Dựa trên mã nhánh main, phiên bản 10.

## 1. Số trang ở wizard lệch với Preview (D-133)

**Hiện trạng.** Bước Khối bài và Bố cục ước tính bằng công thức (`AI.estimateHeight`: mỗi loại bài một chiều cao câu cố định, trang = 980px). Preview đo DOM thật (`WSV.paginate`: trang 1123px trừ lề, có đầu phiếu). Hai cách tính khác nhau nên wizard báo "Vừa số trang" mà mở biên tập lại thấy dư trang, hoặc ngược lại.

**Phương án.** Dùng một thước đo duy nhất là đo thật của viewer.
- Ở bước Bố cục, dựng **phiếu nháp giả** từ khối bài (câu mẫu độ dài trung bình theo loại bài, đoạn văn thật của lesson), cho chạy qua `WSV.paginate` để ra số trang. Thêm một **ảnh thu nhỏ các trang** để thấy bài nào rơi sang trang nào.
- `AI.estimateHeight` chỉ còn dùng trong `planBlocks` để dàn nhanh, nhưng **hiệu chỉnh hệ số** theo số đo thật (chạy một lần với dữ liệu mẫu, ghi lại hệ số mỗi loại bài).
- Sau khi sinh xong, nếu số trang thật khác mục tiêu thì màn tiến trình báo ngay kèm nút "Mở gợi ý vừa số trang" (dùng lại D-97).

**Kiểm chứng.** Thêm kiểm tra: với dữ liệu mẫu, số trang ở bước Bố cục bằng số trang Preview sau khi sinh (sai lệch không quá 0,3 trang).

## 2. Ngắt trang thủ công và giữ bài trọn trang (D-134)

**Hiện trạng.** Viewer tự chia trang theo từng câu; bài dài bị tách sang trang sau với dòng "(tiếp)". Bài L2, L3 và bài nối là một khối liền, dài hơn một trang thì thành "trang cao" vượt khổ A4. Không có cách chủ động ngắt trang.

**Phương án.** Thêm hai thuộc tính cho mỗi bài trong phiếu (`ws.items[i]`, không đổi nội dung bài):
- **Bắt đầu trang mới** (`breakBefore`): bài luôn đứng đầu trang.
- **Giữ trọn trang** (`keepTogether`): không tách bài; nếu không vừa phần còn lại thì đẩy cả bài sang trang mới. Bài dài hơn một trang thì bỏ qua và báo.
- Mặc định tự động: bài có đoạn văn (tfng, cloze_mcq, short_answer) và bài nối bật "Giữ trọn trang"; tiêu đề và hướng dẫn **không bao giờ đứng một mình cuối trang** (luôn kéo theo ít nhất 2 câu).
- Trong Preview, giữa hai bài có nút nhỏ **"⤓ Ngắt trang ở đây"**; ở mục lục có biểu tượng tương ứng.
- Bài L3 dài hơn một trang: cho tách phần câu hỏi sang trang sau, đoạn văn lặp lại dạng thu gọn "Xem đoạn văn trang trước" thay cho trang cao.
- Áp dụng giống nhau cho Preview, viewer, tệp xuất và bản in.

## 3. Thư viện bố cục mỏng, chưa có mẫu bố cục (D-135)

**Hiện trạng.** 4 kiểu L1–L4, Admin chỉ bật tắt và đặt mặc định theo loại bài. "Lưu làm mẫu bố cục" (P1) chưa làm.

**Phương án.**
- **Thêm 2 bố cục** thường cần cho phiếu tiểu học: **L5 Ảnh trên, câu dưới** (tranh lớn đầu bài, hợp bài nhìn tranh) và **L6 Lưới thẻ** (2–3 cột ô vuông, hợp nối tranh với từ, khoanh chọn). Mỗi bố cục khai báo thêm loại bài phù hợp, để chỉ hiện những kiểu hợp lệ cho từng bài.
- **Mẫu phiếu** (gộp "mẫu bố cục" thành mẫu cả phiếu): lưu danh sách khối (loại, số câu, độ khó, bố cục, ngắt trang, ghi chú cho AI) cùng số trang. Ở bước Khối bài có ô **"Dùng mẫu"**; mẫu không gắn lesson nên dùng lại cho lesson khác, hệ thống chỉ điều chỉnh khi lesson thiếu dữ liệu cho loại bài nào đó. Mẫu của người soạn là riêng; Admin đưa được mẫu thành mẫu chung.
- Giữ nguyên nguyên tắc: đổi bố cục không đổi nội dung bài.

## 4. Dàn khối chỉ dựa vào số trang (D-136)

**Hiện trạng.** `AI.planBlocks` chọn loại bài ngẫu nhiên có hạt giống, ưu tiên nối từ khi có từ 6 từ vựng, rồi lấp cho đủ trang. Chưa dùng `objectives` và `skills` của lesson, chưa có trình tự sư phạm.

**Phương án.**
- **Gắn mỗi khối với một mục tiêu của lesson.** Mỗi loại bài khai báo nó luyện được loại mục tiêu nào (từ vựng, ngữ pháp, đọc hiểu, viết). Dàn khối thì phủ đủ các mục tiêu trước, rồi mới lấp trang. Lý do mỗi khối nêu mục tiêu: "Luyện mục tiêu 2: Use there is / there are".
- **Trình tự từ dễ đến khó:** nhận biết (nối, trắc nghiệm) → luyện có hỗ trợ (điền từ có khung từ, sắp xếp) → vận dụng (đọc hiểu, viết lại, trả lời ngắn). Độ khó tăng dần thay vì chọn ngẫu nhiên.
- **Bảng phủ mục tiêu** ở bước Khối bài: mỗi mục tiêu có bao nhiêu câu luyện, mục tiêu nào chưa có khối thì tô cam kèm nút "Thêm khối cho mục tiêu này".
- Không lặp một loại bài hai lần liền nhau; giữ bám tiêu chuẩn số câu như hiện nay.
- Khi có Claude: gửi danh sách mục tiêu và gán khối vào lời nhắc sinh bài để nội dung câu bám đúng mục tiêu đã gán.

## Thứ tự làm đề xuất

1. **Điểm 1** trước, vì các điểm còn lại đều cần số trang đúng. Nhỏ, ít rủi ro.
2. **Điểm 4**, vì nó làm bài bám tiêu chuẩn và mục tiêu, đúng ưu tiên của dự án.
3. **Điểm 2**, sửa `WSV.paginate` dùng chung cho Preview, viewer và xuất, cần kiểm tra kỹ t5.
4. **Điểm 3**, mở rộng sau cùng; mẫu phiếu dựa trên cấu trúc khối của điểm 4.

Mỗi điểm là một lần cập nhật riêng, tăng phiên bản, giữ 259 kiểm tra t1–t8 và kiểm thử máy chủ đạt, thêm kiểm tra mới cho phần đã làm.
