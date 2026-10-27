# ĐẶC TẢ TÍNH NĂNG: TRÌNH XEM VÀ LÀM VIỆC VỚI PHIẾU BÀI TẬP

> Phiên bản **1.0** · Ngày **27/10/2026** · Tài liệu **trung lập về sản phẩm**: không gắn với một ứng dụng, khung giao diện hay ngôn ngữ lập trình cụ thể.
> Mục đích: đưa cho một AI (hoặc lập trình viên) đọc rồi **bổ sung các tính năng dưới đây vào một ứng dụng có sẵn** đang quản lý phiếu bài tập tiếng Anh.
> Ngôn ngữ tài liệu: tiếng Việt. Nội dung phiếu: tiếng Anh. Nhãn giao diện: theo ngôn ngữ của ứng dụng chủ (mục 2.4).

---

## Mục lục

0. Cách dùng tài liệu (dành cho AI thực hiện)
1. Tổng quan và danh sách module
2. Nguyên tắc tích hợp vào ứng dụng có sẵn
3. Mô hình dữ liệu trung lập
4. Module M1. Hiển thị chín dạng câu
5. Module M2. Bố cục bài
6. Module M3. Phân trang A4
7. Module M4. Chế độ xem, điều hướng, thu phóng
8. Module M5. Đáp án và giải thích
9. Module M6. Media: ảnh, audio, video
10. Module M7. Bút vẽ chú thích
11. Module M8. Công cụ trình bày
12. Module M9. Ghim bài, ghi chú, phóng to một bài
13. Module M10. Bảng nhanh và bảng trắng
14. Module M11. Luyện tập tự chấm, Quiz, phản hồi đúng/sai
15. Module M12. Lưu trạng thái cục bộ
16. Module M13. Xuất tệp HTML độc lập (tùy chọn)
17. Module M14. Tiếp cận, cảm ứng, in
18. Yêu cầu phi chức năng
19. Kiểm thử và nghiệm thu
20. Câu lệnh mẫu giao cho AI
21. Module M15. Làm bài trên lớp
22. Các giai đoạn thực hiện
- Phụ lục A. Bảng giá trị tham chiếu
- Phụ lục B. Ví dụ dữ liệu
- Phụ lục C. Bảng âm thanh phản hồi

---

## 0. Cách dùng tài liệu (dành cho AI thực hiện)

### 0.1. Quy ước mức yêu cầu

| Từ khóa | Nghĩa |
|---|---|
| **PHẢI** | Bắt buộc. Thiếu thì tính năng không đạt |
| **NÊN** | Mặc định có; chỉ bỏ khi ứng dụng chủ có lý do rõ ràng, và phải ghi lại lý do |
| **CÓ THỂ** | Tùy chọn hoặc chi tiết trình bày; được làm khác miễn giữ ý |

Giá trị số (kích thước, màu, thời gian) ở Phụ lục A là **giá trị tham chiếu**: dùng làm mặc định, được đổi cho khớp thiết kế của ứng dụng chủ.

### 0.2. Quy trình đề xuất

1. **Khảo sát ứng dụng chủ** trước khi viết mã: công nghệ giao diện, cách lưu dữ liệu, mô hình phiếu bài hiện có, hệ thống phân quyền (có phân biệt giáo viên và học sinh không), cách xuất tệp (nếu có), ngôn ngữ giao diện, bộ kiểm thử.
2. **Lập bảng đối chiếu**: với mỗi module M1–M15, ghi ứng dụng chủ đã có gì, thiếu gì, và sẽ làm theo cách nào. Gửi bảng này cho người phụ trách duyệt khi còn nghi ngờ.
3. **Chọn module và giai đoạn cần làm** (mục 1 và 22). Không bắt buộc làm hết; làm theo thứ tự phụ thuộc, từng giai đoạn một.
4. **Viết bộ chuyển đổi dữ liệu** (adapter) từ mô hình của ứng dụng chủ sang mô hình trung lập ở mục 3, thay vì ép ứng dụng chủ đổi mô hình của nó.
5. **Làm từng module, kiểm thử từng module** theo tiêu chí ở cuối mỗi mục; không làm một lần cả mười bốn module.
6. **Không phá hành vi hiện có.** Chạy lại bộ kiểm thử có sẵn của ứng dụng chủ trước và sau khi thêm.
7. **Báo cáo** cuối việc: module đã làm, module bỏ và lý do, điểm lệch so với tài liệu, cách chạy kiểm thử.

### 0.3. Những điều AI không tự quyết

Hỏi người phụ trách khi gặp một trong các trường hợp sau, thay vì đoán:
- Ứng dụng chủ đã có tính năng trùng nhưng hành vi khác (ví dụ đã có phân trang riêng).
- Việc thêm tính năng đòi đổi cấu trúc dữ liệu đang lưu hoặc API đang dùng.
- Cần thêm thư viện bên thứ ba ngoài những gì ứng dụng chủ đã dùng.
- Một yêu cầu PHẢI xung đột với ràng buộc của ứng dụng chủ.

## 1. Tổng quan và danh sách module

**Bài toán.** Giáo viên soạn phiếu bài tập tiếng Anh gồm nhiều bài, mỗi bài thuộc một trong chín dạng câu. Phiếu được dùng ở hai tình huống: **in hoặc phát cho học sinh** (khổ A4, không có đáp án) và **trình chiếu trên lớp** (có đáp án, vẽ chú thích, các công cụ trình bày). Tài liệu này đặc tả **trình xem** phục vụ cả hai tình huống, và tùy chọn xuất nó thành tệp độc lập.

**Hai vai trò xem**: *giáo viên* (thấy đáp án, ghi chú, công cụ luyện tập) và *học sinh* (không có bất kỳ dữ liệu đáp án nào). Cách ứng dụng chủ xác định vai trò do ứng dụng chủ quyết định; trình xem chỉ nhận một cờ `role`.

| Mã | Module | Tóm tắt | Phụ thuộc | Mức |
|---|---|---|---|---|
| M1 | Hiển thị chín dạng câu | Mỗi dạng câu hiện đúng trên giấy | Mô hình dữ liệu | PHẢI |
| M2 | Bố cục bài | Sáu kiểu bố cục L1–L6, tự lùi khi không hợp | M1 | PHẢI |
| M3 | Phân trang A4 | Chia nội dung thành các trang A4, giữ trọn bài, ngắt trang | M1, M2 | PHẢI |
| M4 | Chế độ xem, điều hướng, thu phóng | Trang, cuộn, 2 trang, trình chiếu, đi tới, zoom | M3 | PHẢI |
| M5 | Đáp án và giải thích | Xem/ẩn theo câu, bài, toàn phiếu | M1 | PHẢI (vai trò giáo viên) |
| M6 | Media | Ảnh (xem phóng), audio (trình phát), video | M1 | PHẢI |
| M7 | Bút vẽ chú thích | Bút, đánh dấu, đường thẳng, khung, tẩy, hoàn tác | M4 | PHẢI |
| M8 | Công cụ trình bày | Che câu, rèm, tối màn, đèn rọi, đồng hồ… | M4 | NÊN |
| M9 | Ghim, ghi chú, phóng một bài | Thao tác theo từng bài | M4 | NÊN |
| M10 | Bảng nhanh, bảng trắng | Vẽ ra ngoài trang phiếu | — | NÊN |
| M11 | Luyện tập tự chấm | Làm trên phiếu, Quiz, phản hồi đúng/sai | M1, M5 | NÊN |
| M12 | Lưu trạng thái cục bộ | Nét vẽ, ghi chú, ghim, bố cục | M7, M9 | PHẢI |
| M13 | Xuất tệp HTML độc lập | Một tệp, chạy ngoại tuyến | tất cả module đã chọn | CÓ THỂ |
| M14 | Tiếp cận, cảm ứng, in | Nhãn, bàn phím, màn cảm ứng, in A4 | tất cả | PHẢI |
| M15 | Làm bài trên lớp | Cả lớp làm trên thiết bị riêng, máy chủ chấm, xếp hạng, báo cáo (mục 21) | M1–M4, M11, máy chủ | CÓ THỂ |

Gói tối thiểu có giá trị: **M1 + M2 + M3 + M4 + M5 + M12 + M14**. Thứ tự làm theo **bốn giai đoạn** ở mục 22: Nền tảng xem phiếu → Trình chiếu → Tương tác → Làm bài.

## 2. Nguyên tắc tích hợp vào ứng dụng có sẵn

### 2.1. Ranh giới giữa trình xem và ứng dụng chủ

| Do trình xem làm | Do ứng dụng chủ quyết định |
|---|---|
| Hiển thị, dàn trang, tương tác với phiếu | Đăng nhập, phân quyền, xác định vai trò giáo viên/học sinh |
| Lưu trạng thái người dùng tạo ra khi xem (mục 15) | Lưu và quản lý nội dung phiếu gốc |
| Chấm tại chỗ khi luyện tập (không lưu điểm) | Giao bài về nhà, chấm điểm chính thức, lưu kết quả lâu dài (riêng M15 chấm và xếp hạng tạm trong buổi học) |
| Nhận dữ liệu qua giao diện (mục 3) | Nguồn dữ liệu, API, cơ sở dữ liệu |

Trình xem **không** sửa nội dung phiếu gốc. Mọi thao tác của người dùng trong trình xem là lớp phủ.

### 2.2. Hình thức tích hợp

Chọn một trong các cách, theo ứng dụng chủ:

- **Thành phần giao diện** (component) nhận dữ liệu và cấu hình, đặt vào trang hoặc cửa sổ của ứng dụng chủ.
- **Trang riêng** mở từ ứng dụng chủ.
- **Tệp xuất độc lập** (M13), mở không cần ứng dụng chủ.

Giao diện tối thiểu của thành phần:

```
mount(container, data: ViewerData, options?)  → controller
options: {
  role:        "teacher" | "student",       // mặc định theo data.meta.kind
  storageKey:  string,                       // khóa lưu trạng thái (mục 15)
  labels:      Record<string,string>,        // nhãn giao diện (mục 2.4)
  onEvent?:    (name, payload) => void,      // tùy chọn: báo sự kiện ra ngoài
  features:    { quiz, practice, ink, tools, quickBoard, … } // bật/tắt từng nhóm
}
controller: { render(), goToPage(i), goToExercise(id), setAnswersVisible(b), destroy() }
```

Tên hàm và tham số là gợi ý; giữ **ý nghĩa**, đặt tên theo quy ước của ứng dụng chủ.

### 2.3. Kiểu dáng

- Trình xem **không được làm vỡ kiểu dáng** của ứng dụng chủ: đóng gói CSS trong một phạm vi riêng (tiền tố, shadow DOM, CSS modules hoặc tương đương); không đặt luật toàn cục lên `body`, `button`, `input`.
- Màu và cỡ chữ của *khung công cụ* nên đọc từ các biến (token) của ứng dụng chủ nếu có; **tờ phiếu** (trang A4) giữ kiểu in riêng ở Phụ lục A vì phải giống bản in.
- Tờ phiếu và các cửa sổ nổi luôn nền sáng; chỉ khung công cụ theo chế độ sáng/tối của ứng dụng chủ.

### 2.4. Ngôn ngữ giao diện

Mọi chuỗi giao diện (nhãn nút, gợi ý, thông báo) lấy từ bảng `labels` theo khóa, có giá trị mặc định tiếng Việt như trong tài liệu. Ứng dụng chủ dùng ngôn ngữ khác thì cung cấp bảng của mình. **Nội dung phiếu** (tiêu đề bài, câu, phương án, lời phản hồi tiếng Anh) là dữ liệu hoặc hằng tiếng Anh, không dịch.

### 2.5. Hiệu năng và độ ổn định

- Phiếu thường 1–10 trang, 3–15 bài, dưới 200 câu; phải mở và đổi chế độ mượt ở mức đó trên máy tính xách tay và máy tính bảng phổ thông.
- Dựng lại (render) khi đổi cỡ cửa sổ hoặc chế độ phải **giữ vị trí cuộn, nét vẽ, trạng thái đáp án**.
- Không có lỗi trong console khi dùng bình thường.

## 3. Mô hình dữ liệu trung lập

Đây là hợp đồng giữa ứng dụng chủ và trình xem. Ứng dụng chủ viết bộ chuyển đổi sang mô hình này.

```
ViewerData {
  meta:      Meta
  items:     Item[]                // các bài, theo thứ tự in
  feedback?: FeedbackConfig|null   // cấu hình phản hồi đúng/sai (chỉ vai trò giáo viên)
}
```

### 3.1. Meta

| Trường | Kiểu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `code` | string | có | Mã phiếu. Hiện ở đầu phiếu và chân trang; thành phần của khóa lưu |
| `version` | number | có | Số phiên bản phiếu (hiện dạng `v1`) |
| `kind` | `"teacher"`\|`"student"` | có | Loại bản dữ liệu |
| `title` | string | có | Tên phiếu |
| `lesson` | string | không | Nhãn bài học/đơn vị ngắn, hiện ở dòng meta đầu phiếu |
| `theme` | `{name, emoji}` \| null | không | Chủ đề; có thì hiện một nhãn nhỏ ở đầu phiếu |
| `pagesTarget` | number \| null | không | Số trang mục tiêu; dùng cho tự thu gọn (6.7) |

Ứng dụng chủ có thể thêm trường riêng (người tạo, thời điểm, chương trình…); trình xem bỏ qua trường lạ.

### 3.2. Item (một bài)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | string | Duy nhất trong phiếu; khóa của ghim, ghi chú |
| `type` | string | Một trong chín dạng ở mục 4 |
| `title` | string | Tiêu đề bài |
| `instruction` | string | Hướng dẫn làm bài; rỗng thì bỏ |
| `layout` | `"L1"`…`"L6"` | Bố cục (mục 5); thiếu thì `L1` |
| `passage` | string | Đoạn văn; rỗng nếu không có. Dạng `cloze_mcq` chứa chỗ trống `{1}`, `{2}`… Giữ nguyên xuống dòng |
| `wordBank` | string[] | Hộp từ; rỗng thì không hiện |
| `media` | Media[] | Ảnh, audio, video của bài (3.4) |
| `questions` | Question[] | Câu hỏi (3.3) |
| `rightList` | string[] | Chỉ dạng `matching`: cột phải **đã xáo**, gồm đáp án các câu và có thể thêm mục gây nhiễu |
| `breakBefore` | boolean | Bắt đầu bài ở trang mới |
| `keep` | boolean | Tùy chọn. Ghi đè mặc định "giữ trọn bài trên một trang" (6.5) |

### 3.3. Question theo dạng

Mọi câu có `id` (string, duy nhất trong phiếu). Cột "Khóa đáp án" **chỉ có trong dữ liệu vai trò giáo viên** và phải bị loại hẳn khỏi dữ liệu học sinh.

| Dạng `type` | Trường hiển thị | Khóa đáp án |
|---|---|---|
| `mcq` | `stem` (có thể chứa `___`), `options: [{id, text}]` | `correctId`, `explanation?` |
| `fill_blank` | `text` (chứa `___`) | `accepted: string[]`, `explanation?` |
| `word_form` | `text` (chứa `___`), `baseWord` (chữ in hoa) | `accepted`, `explanation?` |
| `matching` | `left` | `right` (chuỗi đúng, có trong `rightList`), `explanation?` |
| `ordering` | `words: string[]` (đã xáo), `punct` (dấu câu cuối, mặc định `.`) | `answerText` (câu đúng có dấu), `explanation?` |
| `tfng` | `statement` | `answer: "T"\|"F"\|"NG"`, `explanation?` |
| `cloze_mcq` | `n` (số chỗ trống trong `passage`), `options: string[]` | `correctIdx` (chỉ số từ 0), `explanation?` |
| `rewrite` | `original`, `lead` (từ mở đầu câu viết lại) | `accepted`, `explanation?` |
| `short_answer` | `question`, `maxWords` | `accepted`, `explanation?` |

Chỗ trống `___` là **hai dấu gạch dưới liền nhau trở lên**.

Danh sách khóa đáp án cần loại khỏi dữ liệu học sinh: `correctId`, `accepted`, `answer`, `correctIdx`, `explanation`, `answerText`, `right`. (`rightList` là đề, không phải đáp án; giữ lại.)

### 3.4. Media

```
Ảnh   { id, kind:"image", alt, keyword?, emoji?, hue?, style?, src? }
Audio { id, kind:"audio", title, transcript, voice?, rate?, speakers?, duration?, src? }
Video { id, kind:"video", title, caption?, duration, hue?, src? }
```

- `alt` của ảnh là bắt buộc về nội dung (dùng cho trình đọc màn hình).
- Nếu có `src` (đường dẫn hoặc data URI) thì dùng tệp thật; nếu không thì dùng **cách mô phỏng** ở mục 9 (ảnh minh họa sinh bằng mã, audio đọc bằng giọng trình duyệt, video hoạt họa mô phỏng). Hỗ trợ `src` là **NÊN** khi ứng dụng chủ có media thật.
- `transcript` audio: các lượt ngắt bằng `\n`; dòng dạng `Tên: lời` là lời của người nói `Tên`.

### 3.5. FeedbackConfig

```
{ correct: { img: {star:true, check:true, …}, snd: {chime:true, …} },
  wrong:   { img: {arrow:true, …},            snd: {soft:true, …} },
  volume: 0.6, showText: true }
```

Bật/tắt từng hình và âm. Thiếu thì dùng mặc định ở mục 14.4. Mã hình và âm xem Phụ lục C và mục 14.4.

## 4. Module M1. Hiển thị chín dạng câu

### 4.1. Khung chung của một câu (PHẢI)

Mỗi câu là một hàng: **số câu** (chữ phụ, đậm, xám đậm) bên trái, **thân câu** bên phải. Số câu đánh từ 1 trong mỗi bài (`cloze_mcq` dùng `n`). Vai trò giáo viên có thêm: dòng đáp án (ẩn mặc định), dòng giải thích (ẩn mặc định, chỉ khi có `explanation`), nút nhỏ "?" ở lề phải để xem/ẩn đáp án riêng câu đó.

**Chỗ trống**: đoạn gạch chân đậm trong dòng, rộng tối thiểu 84px. Khi hiện đáp án, đáp án nằm **ngay trong chỗ trống**.

### 4.2. Từng dạng

| Dạng | Trên giấy | Khi hiện đáp án (giáo viên) |
|---|---|---|
| `mcq` | Câu dẫn; dưới là các phương án nằm ngang "**A** …", "**B** …" (chữ cái đậm), xuống dòng khi hết chỗ | Phương án đúng tô nền xanh nhạt; dòng `Answer: C · evening` |
| `fill_blank` | Câu có chỗ trống | `accepted[0]` trong chỗ trống; dòng `Accept: a / b` |
| `word_form` | Câu có chỗ trống; cuối câu là **từ gốc in hoa** (chữ phụ đậm, giãn chữ, xám) | Như `fill_blank` |
| `ordering` | Các từ đã xáo, mỗi từ trong một ô viền bo góc, nằm ngang; dưới là dòng kẻ để viết | `answerText` hiện trên dòng kẻ |
| `tfng` | Nhận định; cùng dòng, bên phải là ba ô nhỏ `T` `F` `NG` | Ô đúng tô đặc xanh chữ trắng; dòng `Answer: T` |
| `cloze_mcq` | Trong `passage`, mỗi `{n}` thành **ô số n** + chỗ trống; mỗi câu là một hàng: số `n` rồi các phương án A, B, C | Đáp án nằm trong chỗ trống của đoạn văn; phương án đúng tô xanh; dòng `Answer: A · lunch` |
| `rewrite` | Câu gốc; dòng dưới: **từ mở đầu** (đậm) + dòng kẻ dài khoảng 72% | Dòng `Accept: …` |
| `short_answer` | Câu hỏi; dưới là một dòng kẻ | Dòng `Accept: …` |
| `matching` | Hai cột: trái là các vế `left` có số và một chỗ trống ngắn (khoảng 34px) để ghi chữ cái; phải là `rightList` đánh **A, B, C…**. Mục bên phải là emoji hoặc tối đa 3 ký tự thì hiện chữ lớn | Chữ cái đúng (vị trí của `right` trong `rightList`) hiện trong chỗ trống |

### 4.3. Đầu bài, đoạn văn, hộp từ

- **Đầu bài**: ô số bài (nền tối, chữ trắng, bo góc) + tiêu đề (chữ có chân, khoảng 18px, đậm) + nhóm nút công cụ bài ở bên phải (M9). Dưới là hướng dẫn in nghiêng, màu xám.
- **Đoạn văn**: khung nền nhạt, viền mảnh, bo góc, giữ xuống dòng.
- **Hộp từ**: khung viền đứt, các từ ngăn bằng dấu "·" nhạt.
- Thứ tự trong bài (bố cục một cột): đầu bài → media → đoạn văn → hộp từ → các câu.

### 4.4. Nghiệm thu M1

- [ ] Chín dạng cùng hiện đúng với dữ liệu mẫu (Phụ lục B).
- [ ] Chuỗi dữ liệu chứa `<b>x</b>` hiện thành chữ, không thành thẻ (mục 18.1).
- [ ] Dữ liệu học sinh không có khóa đáp án vẫn hiển thị trọn vẹn, không lỗi.

## 5. Module M2. Bố cục bài

Mỗi bài có `layout`. Trình xem tính **bố cục hiệu lực** theo thứ tự:

1. `L2` hoặc `L5` mà bài **không có ảnh** → `L1`.
2. `L6` mà dạng bài không thuộc `mcq, matching, fill_blank, word_form, tfng` → `L1`.
3. `L3` mà bài **không có đoạn văn** → `L4` nếu có từ 6 câu trở lên, ngược lại `L1`.

| Mã | Tên | Cách dựng |
|---|---|---|
| L1 | Một cột | Chạy một mạch từ trên xuống; media thành một hàng ngang dưới đầu bài |
| L2 | Ảnh bên phải | Lưới hai cột `1fr` và `210px`, cách 16px: trái là đoạn văn, hộp từ, câu; phải là media xếp dọc, ảnh rộng hết cột. Cả bài là một khối không tách trang |
| L3 | Đoạn văn trái, câu phải | Lưới hai cột bằng nhau, cách 18px: trái là đoạn văn và media; phải là hộp từ và câu. Có luật tách riêng khi dài (6.6) |
| L4 | Câu hai cột | Câu xếp thành cặp trong lưới hai cột |
| L5 | Ảnh trên, câu dưới | Ảnh lớn (khoảng 400×264) căn giữa ngay dưới đầu bài; câu một cột bên dưới |
| L6 | Lưới thẻ | Mỗi câu là một thẻ viền bo, lưới 3 cột. Bài nối: vế trái thành thẻ 3 cột, cột phải thành thẻ 4 cột |

Bài **nối** luôn là một khối (không tách trang giữa chừng).

**Nghiệm thu M2**: dữ liệu cùng một bài đổi `layout` L1→L6 cho ra sáu hình dạng khác nhau; bài thiếu ảnh/đoạn văn tự lùi đúng như quy tắc, không báo lỗi.

## 6. Module M3. Phân trang A4

PHẢI về kết quả: phiếu hiện thành các **trang A4 dọc** giống bản in; nội dung không tràn khỏi trang (trừ trang quá khổ, 6.5); giữ trọn bài, ngắt trang, không để tiêu đề mồ côi được tôn trọng. Thuật toán dưới đây NÊN theo để số trang khớp giữa các hệ thống.

### 6.1. Kích thước

Trang dựng ở kích thước thật **794 × 1123 px** (A4 ở 96 dpi) rồi **thu phóng bằng phép biến đổi tỉ lệ** (`scale`), để nội dung trong trang không đổi khi zoom. Lề trong trang: trên 56, phải 64, dưới 60, trái 64. Chiều cao nội dung dùng được = 1123 − 56 − 60 − 26 = **981** (26 cho chân trang). Khoảng cách giữa hai bài: 20.

### 6.2. Đầu phiếu (chỉ trang 1)

Tiêu đề phiếu (chữ có chân, khoảng 26px, đậm); dòng meta (chữ phụ nhỏ, xám): `lesson` · nhãn chủ đề · `code · v{version}`; ba ô viết tay `Name:` `Class:` `Date:` (ô Date ngắn hơn); kẻ đậm dưới đầu phiếu.

### 6.3. Chân trang (mọi trang)

Cách đáy khoảng 22px, chữ phụ rất nhỏ, xám nhạt. Trái: `{code} · v{version} · Bản giáo viên` hoặc `Bản học sinh`. Phải: `{trang} / {tổng}`.

### 6.4. Đơn vị đo

Cắt mỗi bài thành các **đơn vị** và **đo chiều cao thật** bằng cách dựng thử trong một khung ẩn rộng 794px (không ước lượng bằng số ký tự):

- L1, L4, L5, L6 (trừ bài nối): đơn vị **đầu** = đầu bài + hướng dẫn + media + đoạn văn + hộp từ; sau đó mỗi **câu** là một đơn vị (L4: mỗi cặp câu; L6: mỗi hàng 3 thẻ).
- L2, L3 và mọi bài nối: cả bài là **một đơn vị**.

**Giữ trọn bài** (`keep`): mặc định bật với `tfng`, `cloze_mcq`, `short_answer`, `matching`; trường `keep` của bài ghi đè.

### 6.5. Thuật toán xếp trang

Đi lần lượt các đơn vị. `chỗ còn = 981 − đã dùng − 20`.

1. Ở **đơn vị đầu của một bài**, nếu trang đã có nội dung:
   - `breakBefore` bật → sang trang mới.
   - `keep` bật, tổng chiều cao bài ≤ 961 và lớn hơn chỗ còn → sang trang mới (đẩy cả bài).
   - Ngược lại, cộng chiều cao đầu bài với tối đa **2 câu kế tiếp**; vượt chỗ còn → sang trang mới (tiêu đề không đứng một mình cuối trang).
2. **Bài L3 quá dài** (cả bài không vừa chỗ còn): trừ khi bài giữ trọn và vừa một trang, tách bài: bỏ dần câu cuối khỏi khối hai cột đến khi khối (đoạn văn + các câu đầu) vừa chỗ; các câu còn lại thành từng đơn vị câu riêng sang trang sau, kèm dòng tiếp có thêm "· đoạn văn ở trang trước". Không tách được thì sang trang mới rồi thử lại.
3. Cộng đơn vị vào trang: thêm 20 nếu là bài mới trên trang này, thêm 18 nếu là phần tiếp của bài từ trang trước. Vượt 981 và trang đã có nội dung → sang trang mới.
4. Một đơn vị cao hơn cả trang trống → đặt vào trang đó và đánh dấu **trang quá khổ**: trang cao `max(1123, chiều cao + 150)`, lớp vẽ cao theo.

Phần bài tiếp sang trang sau có dòng nhỏ ở đầu: `Bài 5 (tiếp) · {tiêu đề bài}`.

### 6.6. Tự thu gọn theo số trang mục tiêu

Nếu `pagesTarget` có giá trị và số trang vượt mục tiêu: mọi bài `mcq`, `fill_blank`, `word_form`, `tfng` có từ 4 câu và bố cục hiệu lực L1 được **hiển thị** như L4 (không đổi dữ liệu), rồi xếp trang lại.

### 6.7. Vẽ lại khi đổi cỡ

Đổi cỡ cửa sổ làm tỉ lệ thay đổi hơn 1% thì vẽ lại, giữ vị trí cuộn tương đối.

**Nghiệm thu M3**: [ ] số trang ổn định giữa các lần dựng; [ ] bài giữ trọn không bị cắt ngang; [ ] bài `breakBefore` đầu trang mới; [ ] tiêu đề bài không nằm một mình cuối trang; [ ] bài L3 dài tách đúng và có dòng "(tiếp)"; [ ] chân trang đánh số `i / n`.

## 7. Module M4. Chế độ xem, điều hướng, thu phóng

### 7.1. Thanh công cụ

Một hàng nút trên cùng, tự xuống dòng khi hẹp. Nhóm và nút:

| Nhóm | Nút |
|---|---|
| Nhận diện | Tên phiếu (cắt bớt); nhãn "Bản giáo viên" / "Bản học sinh" |
| Xem | Trang · Cuộn · Trình chiếu · 2 trang |
| Đi tới | Trang trước · hộp chọn "Đi tới…" · Trang sau |
| Thu phóng | Thu nhỏ · hiển thị tỉ lệ (bấm để về mặc định) · Phóng to · Vừa ngang · Vừa cao · Phóng vùng |
| Đáp án (giáo viên) | Đáp án toàn phiếu · Giải thích · Quiz · Làm trên phiếu |
| Bút | Con trỏ · Bút · Tẩy · tùy chọn bút (màu, độ dày, hoàn tác, làm lại, xóa tất cả, ẩn lớp vẽ) |
| Trình bày | Menu công cụ trình bày · Bảng nhanh |

Nút đang bật có nền đậm. Nhóm tùy chọn bút chỉ hiện khi đang vẽ, khi bấm mở, hoặc khi đã có nét. Nút chỉ có biểu tượng PHẢI có nhãn truy cập (mục 17).

### 7.2. Chế độ xem (PHẢI)

| Chế độ | Hành vi |
|---|---|
| **Trang** (mặc định) | Các trang xếp dọc, cách nhau khoảng 22px, có bóng, căn giữa trên nền xám nhạt |
| **Cuộn** | Các trang nối liền, ngăn bằng gạch đứt |
| **Trình chiếu** | Toàn màn hình, **chỉ hiện trang đang xem** (hoặc cặp trang), thanh công cụ **tự ẩn**. Thoát toàn màn hình thì về chế độ Trang |
| **2 trang** | Hai trang cạnh nhau, lật theo cặp (1-2, 3-4…). Dùng với Trang và Trình chiếu; ở Cuộn thì bỏ qua. Lựa chọn được lưu (M12) |

### 7.3. Tỉ lệ và zoom (PHẢI)

- **Vừa ngang** (mặc định): tỉ lệ = (rộng khung − 48) / 794, tối đa 1.15 khi không trình chiếu. Chế độ 2 trang: (rộng − 48 − 30) / (2 × 794).
- **Vừa cao**: (cao khung − 48) / 1123.
- Phóng to/thu nhỏ: nhân/chia 1.15; giới hạn 0.3 đến 4 lần so với tỉ lệ vừa; tỉ lệ cuối không nhỏ hơn 0.2.
- **Phóng vùng**: bấm nút rồi kéo chọn một hình chữ nhật (rộng tối thiểu 20px) → phóng sao cho vùng vừa chiều ngang (tối đa 6 lần) và cuộn tới vùng đó. Nút trên trang vẫn bấm được; nét vẽ phóng theo.
- Thoát (Esc) khi đang zoom → về 100%.
- Hỗ trợ cử chỉ chụm hai ngón trên cảm ứng (NÊN).

### 7.4. Đi tới (PHẢI)

Hộp "Đi tới…" liệt kê theo thứ tự: các bài **đã ghim** (có dấu ★), các **trang** (`Trang 1`…), các bài còn lại (`Bài 1: …`). Chọn xong, hộp trở về trạng thái "Đi tới…".

- Tới trang: cuộn mượt (trình chiếu: chuyển trang hiện).
- Tới bài: cuộn tới đầu bài.
- Nút trước/sau, ←/→, PageUp/PageDown: lùi/tiến 1 trang (2 trang ở chế độ 2 trang). "Trang hiện tại" là trang cuối cùng có mép trên nằm trong 40% đầu khung nhìn.
- Phím số `1`…`9`: nhảy tới bài 1…9.

### 7.5. Thông báo nhanh

Hộp tối nhỏ giữa phía trên, tự tắt sau khoảng 2.2 giây, dùng cho các thông báo trong tài liệu này.

**Nghiệm thu M4**: [ ] bốn chế độ chạy đúng; [ ] lật trang bằng phím và nút; [ ] đi tới trang và bài; [ ] zoom, vừa ngang, vừa cao, phóng vùng; [ ] đổi chế độ giữ nguyên nét vẽ và đáp án đang bật.

## 8. Module M5. Đáp án và giải thích (vai trò giáo viên)

Bốn cấp xem/ẩn, độc lập nhau:

| Cấp | Cách bật |
|---|---|
| Toàn phiếu | Nút "Đáp án" hoặc phím `A` |
| Một bài | Nút ✓ ở đầu bài; áp cho mọi phần của bài, kể cả phần sang trang sau |
| Một câu | Nút "?" ở lề phải câu |
| Lần lượt | `Space` hiện đáp án câu kế tiếp **trong phần đang nhìn thấy** (hoặc trong bài đang phóng); `Shift+Space` ẩn câu vừa hiện; hết thì báo "Đã hiện hết đáp án trong phần đang xem." |

Nút "Giải thích" bật/tắt riêng; chỉ hiện ở câu có `explanation`.

Đáp án hiện bằng **đổi lớp hiển thị**, không dựng lại trang, nên nét vẽ và vị trí cuộn giữ nguyên. Khi buộc phải dựng lại (đổi zoom, chế độ), trạng thái đáp án toàn phiếu được giữ.

Vai trò học sinh: **không có** các nút, phím, công cụ, dòng chữ liên quan đến đáp án (kể cả trong DOM ẩn).

**Nghiệm thu M5**: [ ] bốn cấp hoạt động; [ ] đáp án nằm trong chỗ trống đúng chỗ; [ ] vai trò học sinh không có phần tử đáp án nào trong trang và trong dữ liệu.

## 9. Module M6. Media: ảnh, audio, video

### 9.1. Ảnh (PHẢI)

- Có `src` → dùng. Không có → **sinh ảnh minh họa SVG** (viewBox 300×200): nền gradient chéo từ `hsl(hue,70%,92%)` sang `hsl(hue+40,75%,84%)`; họa tiết theo `style` (0 vòng tròn mờ, 1 sọc chéo, 2 lưới chấm); `emoji` cỡ lớn ở giữa; `keyword` ở dưới. `role="img"` và nhãn = `alt`.
- Trên trang, ảnh là **nút** (nhãn "Phóng to ảnh: {alt}"), khung khoảng 200×132, viền bo.
- Bấm mở **lớp xem ảnh**: nền tối 82%, ảnh rộng tới 86% (tối đa 900px) tỉ lệ 3:2; nút `+`, `−` (bước 0.25, giới hạn 0.5 đến 4), lăn chuột để zoom, kéo để di chuyển; đóng bằng nút Đóng, bấm nền, hoặc Esc.

### 9.2. Audio (PHẢI phát được; NÊN đủ điều khiển)

Trên trang: nút dạng viên thuốc "▶ {title}". Bấm mở **trình phát** nổi giữa đáy (nền tối, rộng tối đa 560px) và tự phát; chỉ một trình phát tại một lúc.

- Hàng điều khiển: phát/tạm dừng, phát lại, thanh tua, thời gian `m:ss / m:ss`, tốc độ `0.75×` `1×` `1.25×`, âm lượng, đóng.
- Dưới là **transcript** cuộn được (cao tối đa khoảng 96px); dòng đang đọc được tô sáng và tự cuộn tới; tên người nói in đậm.
- Có `src` → phát tệp. Không có → đọc bằng giọng trình duyệt (`speechSynthesis`), giọng tiếng Anh `en-GB`, từng dòng; người nói thứ 1, 2, 3 dùng giọng tiếng Anh khác nhau (nếu có) và cao độ 1, 1.35, 0.8.
- Thời lượng mỗi dòng ước tính = max(1.2, số từ / 2.6) giây; tổng dùng cho thanh tua.
- Không có giọng đọc: thanh tiến độ chạy theo thời lượng ước tính, hiện dòng vàng "Chế độ mô phỏng audio: trình duyệt không có giọng đọc, thanh tiến độ chạy theo thời lượng ước tính."

### 9.3. Video (PHẢI)

Trên trang: nút "▶ Video · {title}". Bấm mở lớp tối, khung 16:9 rộng tối đa 800px.

- Có `src` → phát tệp với điều khiển cơ bản.
- Không có → chạy **cảnh hoạt họa mô phỏng** SVG trong `duration` giây (ví dụ nền màu theo `hue`, hai hình emoji trượt ngang), kèm góc ghi "{title} · mô phỏng" và phụ đề `caption` ở đáy khung. Có nút phát/tạm dừng, thanh tiến độ, thời gian, đóng (nút, bấm nền, Esc).

### 9.4. Lỗi media (NÊN)

Khi tải media thất bại: khung báo "Không tải được ảnh." (hoặc video) kèm nút **Thử lại**; phần khác của phiếu vẫn chạy.

**Nghiệm thu M6**: [ ] bấm ảnh mở lớp xem phóng/thu/kéo, Esc đóng; [ ] audio có tua, tốc độ, transcript tô sáng; [ ] video phát kèm phụ đề; [ ] media lỗi không làm hỏng trang.

## 10. Module M7. Bút vẽ chú thích

Mỗi trang có một **canvas phủ** đúng kích thước trang (794 × 1123, hoặc cao hơn với trang quá khổ). Tọa độ nét lưu theo hệ tọa độ trang nên đúng vị trí ở mọi mức zoom.

- Trình xem **luôn mở ở Con trỏ**: lớp vẽ không nhận chuột, mọi nút, ảnh, đáp án trên trang bấm được.
- **Bút (khóa)**: nút Bút hoặc phím `P` (bấm lại để tắt); Esc về Con trỏ.
- **Vẽ theo phím giữ** (không cần bật Bút); thả phím là về Con trỏ, nét dở được hoàn tất; mất focus cửa sổ cũng về Con trỏ:

| Giữ phím + kéo | Kết quả | Màu |
|---|---|---|
| `Shift` | Đường thẳng, tự khóa ngang hoặc dọc theo hướng kéo lệch nhiều hơn | Đỏ |
| `Ctrl` (Mac: `Cmd`) | Bút đánh dấu tự do: nét dày gấp 4, trong suốt 35% | Vàng |
| `Ctrl` + `Shift` | Hình chữ nhật chỉ viền | Đỏ |
| Không giữ, đang ở Bút | Vẽ tự do | Màu đang chọn |

- 5 màu chọn, độ dày Mảnh/Vừa/Dày (Phụ lục A). Chọn màu tự bật Bút.
- **Tẩy** (phím `E`): kéo qua nét nào thì xóa cả nét đó (bán kính chạm khoảng 12px; đường thẳng và khung khoảng 10px quanh cạnh).
- **Hoàn tác / Làm lại** (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y): ngăn xếp gồm thêm nét, tẩy nét, xóa tất cả.
- **Xóa tất cả**: xóa mọi nét mọi trang, báo "Đã xóa nét vẽ. Bấm ↶ để hoàn tác." và hoàn tác được.
- **Ẩn lớp vẽ**: ẩn/hiện mọi nét, không xóa.
- Dùng Pointer Events cho chuột, cảm ứng, bút cảm ứng; canvas đặt `touch-action: none` để vẽ bằng bút không cuộn trang.

Cấu trúc một nét: `{t: "pen"|"line"|"hl"|"rect", c: "#màu", w: độ dày, pts: [[x,y], …]}`; lưu theo chỉ số trang.

**Nghiệm thu M7**: [ ] vẽ được và nét đúng vị trí sau khi đổi zoom; [ ] Esc về Con trỏ; [ ] Shift vẽ đường ngang; [ ] Ctrl+Shift vẽ khung; [ ] tẩy, hoàn tác, làm lại, xóa tất cả và hoàn tác việc xóa; [ ] nét còn sau khi tải lại (M12).

## 11. Module M8. Công cụ trình bày (NÊN)

Menu "Trình bày" liệt kê công cụ kèm phím tắt; mục đang bật được tô. Mặc định tất cả tắt.

| Công cụ | Phím | Hành vi |
|---|---|---|
| Thanh công cụ tự ẩn | `H` | Thanh trượt lên khuất; rê chuột vào khoảng 16px mép trên thì hiện, rời xuống quá 70px thì ẩn. Trình chiếu tự bật |
| Che câu | `C` | Phủ họa tiết sọc xám lên **thân mọi câu và đoạn văn**, chữ "Bấm để hé"; bấm một câu để hé hoặc che lại; tắt công cụ là hé hết |
| Rèm kéo | `R` | Tấm rèm tối từ mép trên, ban đầu cao 40%; kéo tay nắm ở mép dưới để hạ/nâng |
| Tối màn / Trắng màn | `B` / `W` | Phủ kín màu đen hoặc trắng; bấm chuột hoặc phím bất kỳ để quay lại |
| Đèn rọi | `L` | Làm tối 78% toàn khung trừ vòng tròn theo con trỏ (bán kính khoảng 140px); `Alt` + lăn chuột đổi cỡ 50–400px |
| Hiện đáp án lần lượt | `Space` | Như mục 8; chỉ vai trò giáo viên |
| Đồng hồ đếm giờ | `T` | Hộp nổi góc trên phải: số lớn `3:00` (mặc định); nút `1′ 3′ 5′ 10′`, `−1′ +1′`, Bắt đầu/Tạm dừng, đặt lại, đóng. Hết giờ: số đỏ nhấp nháy, chuông kêu hai lần |
| Bảng trắng | `K` | Mục 13.2 |

**Nghiệm thu M8**: mỗi công cụ bật/tắt đúng bằng cả menu và phím; phím bất kỳ thoát Tối/Trắng màn; đồng hồ hết giờ có tiếng và nhấp nháy.

## 12. Module M9. Ghim bài, ghi chú, phóng to một bài (NÊN)

Đầu mỗi bài có nhóm nút nhỏ (hiện khi rê chuột; luôn hiện trên cảm ứng và khi trình chiếu):

| Nút | Vai trò | Hành vi |
|---|---|---|
| ☆ / ★ Ghim | cả hai | Ghim hoặc bỏ ghim; bài ghim lên đầu hộp "Đi tới" với dấu ★; lưu cục bộ |
| ⤢ Phóng to bài | cả hai | Mở lớp phủ chỉ chứa bài đó trên tờ giấy rộng 794px, thu phóng vừa ngang (hoặc vừa cao), cuộn dọc nếu dài. Thanh trên: Bài trước, Bài sau, "Bài i / n", Đáp án bài (giáo viên), vừa ngang, vừa cao, Về tổng (Esc). ←/→ chuyển bài; `Space` hiện đáp án lần lượt trong bài. Nét vẽ gắn với trang nên còn nguyên khi quay về |
| ✓ Đáp án bài | giáo viên | Mục 8 |
| 📝 Ghi chú | giáo viên | Hộp nổi nhỏ "Ghi chú giáo viên · chỉ bản giáo viên, lưu trên trình duyệt này", ô nhập khoảng 260×120, tự lưu khi gõ; chỉ mở khi bấm để không lộ lên màn chiếu |

**Nghiệm thu M9**: ghim đưa bài lên đầu danh sách Đi tới; phóng bài và chuyển bài được; ghi chú còn sau khi tải lại; học sinh không thấy nút ghi chú.

## 13. Module M10. Bảng nhanh và bảng trắng (NÊN)

### 13.1. Bảng nhanh (cả hai vai trò)

- Mở bằng nút "Bảng nhanh" hoặc **nháy đúp vào vùng trống** (không phải nút, ô nhập, lựa chọn, phương án, ô T/F/NG, ô từ sắp xếp, ảnh, hàng nối, thanh công cụ).
- Cửa sổ nổi khoảng 560 × 400, tối thiểu 360 × 260; kéo thanh trên để di chuyển, kéo góc để đổi cỡ.
- Công cụ: Bút, Tẩy nét, Chữ (bấm chỗ cần gõ, Enter để đặt, Esc bỏ), Đường thẳng, Mũi tên, Khung, Elip (giữ Shift: vuông/tròn).
- 5 màu, cỡ Nhỏ/Vừa/Lớn, nền Trắng / Kẻ ô (24px) / Kẻ dòng (28px).
- Hoàn tác, làm lại, xóa hết (hoàn tác được), **Lưu PNG** (nền trắng), đóng (nút hoặc Esc). Đóng chỉ ẩn: mở lại còn nội dung trong phiên. Không lưu cục bộ.

### 13.2. Bảng trắng (phím `K`)

Một trang trắng phủ toàn khung (không tính vào số trang), vẽ tự do bằng màu và độ dày đang chọn. Nút: hoàn tác, Xóa, Về phiếu (Esc). Nội dung giữ trong phiên, không lưu cục bộ.

**Nghiệm thu M10**: nháy đúp vùng trống mở bảng nhanh; công cụ Chữ đặt được chữ; Lưu PNG tải được ảnh; Esc đóng.

## 14. Module M11. Luyện tập tự chấm, Quiz, phản hồi đúng/sai (NÊN, vai trò giáo viên)

Không lưu điểm; không gửi dữ liệu ra ngoài (trừ khi ứng dụng chủ tự gắn qua `onEvent`).

### 14.1. So khớp đáp án

- `mcq`: phương án chọn có `id === correctId`.
- `cloze_mcq`: chỉ số chọn `=== correctIdx`.
- `tfng`: `"T"|"F"|"NG"` `=== answer`.
- `matching`: `rightList[chọn] === right`.
- `fill_blank`, `word_form`: chuẩn hóa rồi so với từng mục `accepted`.
- `ordering`: chuẩn hóa câu ghép (các từ cách một dấu cách + `punct`) rồi so với `answerText`.
- `rewrite`, `short_answer`: **không tự chấm**; chỉ có "Xem đáp án mẫu".

**Chuẩn hóa**: chữ thường; `’` thành `'`; bỏ mọi ký tự ngoài `a-z 0-9 ' dấu cách`; gộp khoảng trắng; cắt hai đầu.

### 14.2. Làm trên phiếu

Bật/tắt chế độ làm bài ngay trên trang. Bật thì tắt đáp án và báo "Làm trên phiếu: bấm chọn đáp án, bấm ô trống để điền. Tắt chế độ để xóa sạch."; cạnh nút hiện bộ đếm `Đúng x/y` (tính theo lần làm đầu của mỗi câu).

| Dạng | Thao tác | Chấm khi |
|---|---|---|
| `mcq`, `cloze_mcq` | Bấm một phương án | Bấm |
| `tfng` | Bấm T, F hoặc NG | Bấm |
| `fill_blank`, `word_form` | Bấm chỗ trống → hiện ô nhập | Enter |
| `matching` | Bấm hàng → hiện hộp chọn chữ cái | Chọn |
| `ordering` | Bấm lần lượt các từ (từ đã dùng mờ đi), câu ghép hiện dưới | Dùng hết từ; sau khoảng 1.2 giây tự xếp lại |
| `rewrite`, `short_answer` | Không tương tác | |

Kết quả: cả câu tô nền xanh nhạt (đúng) hoặc đỏ nhạt (sai) kèm phản hồi cỡ nhỏ. Tắt chế độ: dựng lại trang, phiếu về nguyên bản. Không lưu.

### 14.3. Quiz

Lớp phủ toàn khung, **một câu mỗi lần**, chữ lớn (câu khoảng 28px, phương án khoảng 22px), dùng tốt trên máy chiếu.

1. **Màn tùy chọn**: "{n} câu từ {m} bài. Kết quả không được lưu." Tùy chọn: Xáo thứ tự câu (tắt), Cho thử lại khi sai (bật), Hiện đáp án đúng sau khi sai (bật), Hẹn giờ mỗi câu (Không/15/30/60 giây), Tắt tiếng (tắt). Nút Bắt đầu.
2. **Màn câu hỏi**: thanh trên `Câu i/n`, thanh tiến độ, đồng hồ (nếu hẹn giờ), nút Thoát. Thẻ ghi "Bài k · tên bài", rồi:
   - `mcq`, `cloze_mcq`, `tfng`, `matching`: lưới 2 cột nút phương án (T/F/NG hiện "True", "False", "Not given"; nối hiện cả `rightList`). `cloze_mcq` hiện đoạn văn, ô số đang hỏi tô vàng. `tfng` có mục gập "Xem đoạn văn".
   - `fill_blank`, `word_form`: ô nhập "Gõ đáp án rồi Enter".
   - `ordering`: "Put the words in order", các ô từ to, câu ghép hiện dưới.
   - `rewrite`, `short_answer`: hiện đề; ghi "Câu mở: không tự chấm. Bấm "Xem đáp án mẫu" để so sánh." và nút Xem đáp án mẫu.
   - Thanh dưới: Câu trước, Kiểm tra (bật khi đã chọn hoặc gõ), Câu tiếp.
3. **Kiểm tra**: tô phương án chọn xanh hoặc đỏ, phản hồi cỡ lớn. **Lần trả lời đầu** được ghi điểm. Sai và còn được thử lại (tối đa 2 lần) → sau khoảng 0.9 giây bỏ chọn để thử lại; hết lượt → hiện đáp án đúng (nếu bật). Hết giờ → tính sai, hiện đáp án, báo "Hết giờ: câu này tính sai."
4. **Tổng kết**: số lớn `x/y` (không tính câu mở), "câu đúng ở lần trả lời đầu tiên · không lưu kết quả", danh sách "Câu cần làm lại" (`Bài k · câu j`) hoặc 🏆 nếu đúng hết; nút Làm lại câu sai, Làm lại từ đầu.

Phím trong Quiz: `1`–`4` hoặc `A`–`D` chọn phương án; `Enter` kiểm tra rồi sang câu; `←`/`→` câu trước/sau; `Esc` thoát.

### 14.4. Phản hồi đúng/sai

Hình nổi giữa khung (cao khoảng 42%), phóng nhẹ khi hiện, tự tắt sau khoảng 1.2 giây (0.9 giây và hình nhỏ hơn ở Làm trên phiếu); có thể kèm lời và âm thanh.

- **Hình** chọn ngẫu nhiên trong các hình đang bật của nhóm, **không lặp lại hình vừa dùng**. Nhóm đúng: `star` (sao vàng), `check` (dấu tích trên nền tròn xanh), `confetti` (giấy màu + 🎉), `thumbs` (👍), `trophy` (🏆), `smile` (mặt cười). Nhóm sai: `arrow` (mũi tên vòng màu cam), `cloud` (mây 💭), `sprout` (🌱), `puzzle` (🧩). Tất cả là SVG hoặc emoji nhúng sẵn.
- **Lời** (tiếng Anh, khi `showText`): đúng ngẫu nhiên một trong "Great job!", "Well done!", "Excellent!", "You got it!", "Super!"; sai: "Nice try!", "Almost! Try again.", "Keep going!", "Not quite. You can do it!".
- **Âm**: tổng hợp bằng Web Audio, âm lượng `volume × 0.35`, các nốt nối tiếp; bảng nốt ở Phụ lục C.
- Mặc định (khi thiếu cấu hình): đúng dùng `star`, `check` + `chime`; sai dùng `arrow` + `soft`; âm lượng 0.6; hiện lời.
- Người dùng đặt giảm chuyển động thì không có hiệu ứng phóng.

**Nghiệm thu M11**: [ ] chọn đúng tô xanh, sai tô đỏ, bộ đếm đúng; [ ] tắt chế độ thì phiếu sạch; [ ] Quiz có màn tùy chọn, tiến độ, phản hồi, tổng kết `x/y`; [ ] không hình nào lặp liền kề; [ ] vai trò học sinh không có M11.

## 15. Module M12. Lưu trạng thái cục bộ (PHẢI)

Lưu những gì **người dùng tạo ra khi xem**, trên trình duyệt đang dùng, không đồng bộ giữa các máy.

- Khóa `localStorage` (hoặc cơ chế tương đương của ứng dụng chủ): `{tiền tố}:{code}:v{version}:{kind}`. Mỗi phiếu, mỗi phiên bản, mỗi loại bản lưu riêng; phiên bản mới bắt đầu trắng. `storageKey` cho phép ứng dụng chủ đặt khóa riêng.
- Giá trị JSON:

```json
{"strokes": {"0": [ {"t":"pen","c":"#E8483B","w":3,"pts":[[120,300],[140,310]]} ]},
 "notes":   {"item-id": "Hỏi lại câu 3"},
 "pins":    ["item-id"],
 "layout":  {"two": true}}
```

  `strokes` theo chỉ số trang (0 là trang 1); `notes` và `pins` theo `id` bài; `layout.two` là chế độ 2 trang.
- Ghi sau mỗi thay đổi. Không ghi được (chế độ riêng tư, bị chặn) → báo một lần "Trình duyệt không cho lưu: nét vẽ sẽ mất khi đóng trang." và vẫn chạy bình thường.
- **Không lưu**: bảng nhanh, bảng trắng, Quiz, Làm trên phiếu, trạng thái đáp án đang bật.
- Bọc mọi thao tác đọc/ghi trong xử lý lỗi; thiếu dữ liệu hoặc sai khuôn thì bỏ qua, không làm hỏng trình xem.

**Nghiệm thu M12**: vẽ, ghi chú, ghim, bật 2 trang → tải lại trang → còn nguyên; đổi `version` → trắng; chặn lưu trữ → có thông báo, không lỗi.

## 16. Module M13. Xuất tệp HTML độc lập (CÓ THỂ)

Dùng khi ứng dụng chủ muốn cho tải về phiếu để mở không cần ứng dụng (gửi học sinh, chiếu ở phòng không mạng). Chỉ làm khi người phụ trách yêu cầu.

### 16.1. Ràng buộc

1. **Một tệp `.html` tự đủ**: CSS và JS viết thẳng trong tệp; không CDN, không font web, không ảnh ngoài, không gọi API. Mở bằng bấm đúp (`file://`) phải chạy đủ chức năng khi **không có mạng**.
2. Media nhúng trong tệp (SVG sinh bằng mã hoặc data URI); âm phản hồi tổng hợp bằng Web Audio.
3. Dữ liệu nằm trong thẻ `<script type="application/json">`, đọc bằng `JSON.parse(textContent)`; **không** dựng dữ liệu bằng chuỗi JS thực thi.
4. Chạy trên Chrome, Edge, Firefox, Safari bản hiện hành; laptop, máy chiếu, bảng tương tác, máy tính bảng có bút.
5. Không lỗi console; không gửi dữ liệu đi đâu.

### 16.2. Hai tệp

Mỗi lần xuất tạo hai tệp từ cùng phiếu: **bản giáo viên** (có đáp án, ghi chú, M5, M11) và **bản học sinh** (không có bất kỳ dữ liệu đáp án nào, không có M5, M11, nút ghi chú). Cùng một mã trình xem; khác nhau chỉ ở dữ liệu nhúng và cờ `role`.

Tên tệp: `{code}_v{version}_giao-vien.html` và `{code}_v{version}_hoc-sinh.html`.

### 16.3. Khung tệp

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{tên phiếu} · Bản giáo viên</title>
<meta name="worksheet-id" content="{code}"><meta name="worksheet-version" content="{version}"><meta name="worksheet-kind" content="teacher">
<script type="application/json" id="worksheet-meta">{meta}</script>
<style>…CSS trình xem…</style></head>
<body><div id="app"></div>
<script type="application/json" id="worksheet-data">{ViewerData}</script>
<script>…mã trình xem…</script>
<script>/* đọc #worksheet-data rồi gắn trình xem vào #app, bắt phím toàn trang */</script>
</body></html>
```

Tên các thẻ `meta` và id khối JSON là gợi ý nhưng NÊN giữ để hệ thống khác đọc được mã phiếu, phiên bản, loại bản mà không chạy JS. `#worksheet-meta` chứa đúng `meta` của ViewerData và **không chứa đáp án**.

### 16.4. Mã hóa JSON trong thẻ script (PHẢI)

Trước khi chèn vào `<script type="application/json">`, thay `<` bằng `<`, U+2028 bằng ` `, U+2029 bằng ` `. Kết quả: phần dữ liệu nhúng **không chứa ký tự `<` thô**.

### 16.5. Kiểm tra trước khi cho tải

| Mục | Đạt khi |
|---|---|
| Tài nguyên đủ | Mọi media tham chiếu đều có và đã nhúng |
| Cấu trúc hợp lệ | Có ít nhất một bài; mọi bài có `type` và ít nhất một câu |
| Bản học sinh không chứa đáp án | Quét dữ liệu nhúng và metadata không thấy khóa đáp án (3.3) |
| Chuỗi người dùng đã escape | Phần dữ liệu nhúng không có `<` thô |
| Có mã phiếu và phiên bản | Thẻ `meta` đúng mã; có khối metadata; tên tệp đúng mẫu |

## 17. Module M14. Tiếp cận, cảm ứng, in (PHẢI)

- Nút chỉ có biểu tượng có `aria-label` (lấy từ gợi ý nếu thiếu). Thanh công cụ có `role="toolbar"` và nhãn. Trình phát audio có `role="region"`. Ô nhập khi làm bài có `aria-label`. Ảnh có nhãn từ `alt`. Biểu tượng trang trí đặt `aria-hidden="true"`.
- Điều khiển được toàn bộ bằng bàn phím (mục 17.1); thứ tự Tab hợp lý; vòng focus rõ.
- Thiết bị cảm ứng (`pointer: coarse`): luôn hiện nút công cụ bài và nút "?" (không dựa vào rê chuột); nút công cụ tối thiểu 44 × 44px.
- Màn hẹp (dưới 768px): thanh công cụ một hàng cuộn ngang; lề trong trang giảm còn khoảng 40px 28px.
- Tương phản chữ ≥ 4.5:1 (chữ lớn ≥ 3:1).
- **In** (`@media print`): ẩn thanh công cụ, nút công cụ bài, nút "?"; bỏ nền và bóng; mỗi trang A4 một trang in.
- Tôn trọng `prefers-reduced-motion`.

### 17.1. Phím tắt

Phím chỉ có hiệu lực khi không gõ trong ô nhập. Ở tệp độc lập (M13) bắt phím toàn trang; khi nhúng vào ứng dụng chủ chỉ bắt phím khi trình xem có focus hoặc đang toàn màn hình, để không tranh phím với ứng dụng.

| Phím | Việc |
|---|---|
| `←` `→` / `PageUp` `PageDown` | Trang trước, sau (khi phóng một bài: bài trước, sau) |
| `+` `=` / `-` | Phóng to, thu nhỏ |
| `1`…`9` | Tới bài 1…9 |
| `A` | Đáp án toàn phiếu (giáo viên) |
| `Space` / `Shift+Space` | Hiện đáp án câu kế, lùi lại (giáo viên) |
| `P` / `E` | Bút khóa bật/tắt; Tẩy bật/tắt |
| Giữ `Shift` / `Ctrl` / `Ctrl+Shift` | Đường thẳng / đánh dấu / khung |
| `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y` | Hoàn tác, làm lại nét vẽ |
| `H` `C` `R` `B` `W` `L` `T` `K` | Tự ẩn thanh, che câu, rèm, tối màn, trắng màn, đèn rọi, đồng hồ, bảng trắng |
| `Esc` | Đóng theo ưu tiên: bảng nhanh → lớp phủ đang mở (ảnh, video, Quiz, phóng bài, bảng trắng) → menu nổi → chế độ phóng vùng → zoom về 100% → về Con trỏ → thoát Trình chiếu |
| Phím bất kỳ | Khi đang Tối/Trắng màn: quay lại |

## 18. Yêu cầu phi chức năng

### 18.1. An toàn dữ liệu (PHẢI)

1. **Escape mọi chuỗi** lấy từ dữ liệu khi chèn vào HTML: `&` `<` `>` `"` `'` thành thực thể. Áp cho tiêu đề, hướng dẫn, đoạn văn, câu, phương án, `alt`, transcript, tên chủ đề, mã phiếu… Nếu dùng khung giao diện tự escape (React, Vue…) thì để khung làm việc đó, **không** dùng đường chèn HTML thô.
2. **Dữ liệu học sinh không chứa đáp án**: bỏ hẳn khóa đáp án khỏi dữ liệu ở phía tạo dữ liệu (máy chủ hoặc bước xuất), không giấu bằng CSS hoặc mã hóa phía trình duyệt. Chuỗi đáp án không xuất hiện ở bất kỳ đâu trong tải về của học sinh (kể cả xem nguồn trang).
3. Trình xem không gửi dữ liệu ra ngoài và không đọc tệp khác.

### 18.2. Tương thích

Chrome, Edge, Firefox, Safari bản hiện hành (Safari từ 16.4 nếu dùng regex lookbehind); chuột, cảm ứng, bút cảm ứng dùng chung Pointer Events.

### 18.3. Độc lập với khung giao diện

Lõi tính toán (chuẩn hóa, so khớp, xếp trang, tính bố cục hiệu lực, hình học nét vẽ) NÊN viết thành các hàm thuần, không đụng DOM, để kiểm thử đơn vị được và dùng lại khi ứng dụng chủ đổi khung giao diện.

## 19. Kiểm thử và nghiệm thu

### 19.1. Cách kiểm thử

- Dùng bộ dữ liệu ở Phụ lục B (hoặc phiếu mẫu có đủ chín dạng, các bố cục, ảnh, audio, video) cho cả hai vai trò.
- Kiểm thử đơn vị cho hàm thuần (chuẩn hóa, so khớp, bố cục hiệu lực, xếp trang với chiều cao giả định).
- Kiểm thử trình duyệt tự động cho tương tác chính; chụp ảnh màn hình để so mắt với yêu cầu.
- Chạy lại bộ kiểm thử sẵn có của ứng dụng chủ.

### 19.2. Danh sách nghiệm thu tổng

**Dữ liệu và an toàn**
- [ ] Dữ liệu chứa `<b>x</b>` hiện thành chữ.
- [ ] Dữ liệu học sinh không có khóa đáp án; trang học sinh không có phần tử đáp án, nút ✓, "?", ghi chú, Quiz, Làm trên phiếu.

**Hiển thị**
- [ ] Đủ chín dạng câu đúng như mục 4; đủ L1–L6 và các quy tắc lùi bố cục.
- [ ] Phiếu mẫu ra số trang A4 ổn định; chân trang `i / n`; bài giữ trọn, `breakBefore`, tiêu đề không mồ côi, tách L3 dài đúng.

**Tương tác**
- [ ] Bốn chế độ xem; lật trang; đi tới trang/bài; zoom các kiểu; phóng vùng.
- [ ] Đáp án bốn cấp; giải thích.
- [ ] Ảnh phóng; audio có tua, tốc độ, transcript; video phát; media lỗi có Thử lại.
- [ ] Bút, phím giữ Shift/Ctrl, tẩy, hoàn tác, làm lại, xóa tất cả, ẩn lớp vẽ.
- [ ] Che câu, rèm, tối/trắng màn, đèn rọi, đồng hồ, bảng trắng.
- [ ] Ghim, phóng một bài, ghi chú.
- [ ] Bảng nhanh (nháy đúp), công cụ Chữ, Lưu PNG.
- [ ] Làm trên phiếu đúng/sai và bộ đếm; Quiz đủ màn; phản hồi không lặp hình liền kề.
- [ ] Lưu cục bộ: tải lại vẫn còn; đổi phiên bản thì trắng; chặn lưu có thông báo.

**Chất lượng**
- [ ] Không lỗi console; điều khiển được bằng bàn phím; nhãn truy cập đủ; in ra A4 đúng.
- [ ] Kiểu dáng ứng dụng chủ không bị ảnh hưởng.
- [ ] (Nếu làm M13) hai tệp mở được khi tắt mạng; qua đủ 5 mục kiểm tra ở 16.5.

## 20. Câu lệnh mẫu giao cho AI

Dán nguyên văn (sửa phần trong ngoặc) cùng tài liệu này:

> Bạn sẽ bổ sung các tính năng ở tài liệu đính kèm vào ứng dụng hiện có trong thư mục này. Làm theo mục 0 của tài liệu.
> 1. Đọc mã ứng dụng, xác định công nghệ giao diện, nơi lưu dữ liệu phiếu, cách phân quyền giáo viên/học sinh, bộ kiểm thử.
> 2. Lập bảng đối chiếu M1–M15: đã có, thiếu, cách làm. Đưa tôi xem trước khi viết mã.
> 3. Chỉ làm các module: **[liệt kê, ví dụ M1–M5, M12, M14]**. Bỏ: **[liệt kê]**.
> 4. Viết bộ chuyển đổi từ mô hình phiếu của ứng dụng sang ViewerData (mục 3), không đổi mô hình hiện có.
> 5. Đóng gói CSS để không ảnh hưởng giao diện sẵn có; dùng token màu của ứng dụng cho khung công cụ.
> 6. Nhãn giao diện theo ngôn ngữ ứng dụng; nội dung phiếu giữ tiếng Anh.
> 7. Làm và kiểm thử từng module; chạy bộ kiểm thử sẵn có trước và sau.
> 8. Báo cáo cuối: module đã làm, đã bỏ (lý do), điểm lệch tài liệu, cách chạy kiểm thử, rủi ro còn lại.
> Hỏi tôi khi gặp trường hợp ở mục 0.3 thay vì tự quyết.

## 21. Module M15. Làm bài trên lớp (CÓ THỂ, cần máy chủ)

Cho cả lớp làm phiếu **trên thiết bị của từng học sinh** trong buổi học, giáo viên theo dõi và xem kết quả ngay. Khác M11: M11 là tự kiểm tức thời trên một màn hình, không lưu; M15 có nhiều học sinh, **có chấm và có xếp hạng**, nhưng chỉ trong phạm vi một buổi (không giao bài về nhà, không lưu điểm lâu dài trừ khi ứng dụng chủ tự làm).

### 21.1. Nguyên tắc

1. **Máy chủ giữ đáp án và chấm.** Đề gửi cho học sinh **không có khóa đáp án** (3.3); trình duyệt học sinh không bao giờ nhận đáp án, kể cả sau khi nộp (chỉ nhận kết quả đúng/sai từng câu và điểm).
2. Máy chủ có thể là máy của giáo viên trong mạng cục bộ (Wi‑Fi lớp) hoặc dịch vụ của ứng dụng chủ. Tính năng **không chạy được khi mở tệp bằng `file://`** (M13): ghi rõ trong giao diện.
3. Kết quả **lưu tạm trong bộ nhớ máy chủ**; tắt máy chủ là mất. Vì vậy giáo viên cần xuất báo cáo (21.6) trước khi tắt. Ứng dụng chủ muốn lưu lâu dài thì tự gắn qua lớp dịch vụ (21.8).
4. Dùng lại trình xem M1–M4, M7, M8 cho giao diện học sinh dạng Phiếu; không viết lại phần hiển thị.

### 21.2. Luồng chính

1. **Giáo viên mở phiên** từ một phiếu đã sẵn sàng (vai trò giáo viên): chọn giao diện cho học sinh, **Phiếu** (mặc định) hoặc **Quiz**; nhận **mã phiên 4 ký tự** và địa chỉ vào lớp (với máy chủ trong mạng cục bộ: liệt kê các địa chỉ IP của máy, ví dụ `http://192.168.1.5:5173/lop?ma=XXXX`). Máy chủ nhận dữ liệu phiếu bản giáo viên, tách **đề** (không đáp án) và **khóa** (đáp án).
2. **Học sinh vào**: mở địa chỉ (hoặc nhập mã phiên), nhập **tên** (tối đa 40 ký tự, gộp khoảng trắng; bắt buộc), nhận **mã cá nhân 4 ký tự** để vào lại nếu lỡ thoát. Nhập mã cá nhân sai thì báo lỗi, không tạo người mới. Phiên đã kết thúc thì người mới không vào được; người cũ vào lại để xem kết quả.
3. **Học sinh làm bài**: mọi thay đổi tự gửi lên máy chủ (đáp án mỗi câu tối đa 300 ký tự; chỉ nhận mã câu có trong phiếu). Thoát ra vào lại bằng mã cá nhân thì **phục hồi đúng bài đã làm**.
4. **Nộp bài**: bấm Nộp; từ đó không sửa được. Nộp rồi, hoặc khi phiên kết thúc, học sinh nhận kết quả (21.5).
5. **Giáo viên kết thúc phiên**: sau đó không nhận bài nữa; có thể **mở lại** phiên.

Đặt giới hạn số học sinh mỗi phiên (cấu hình được; gợi ý vài chục) và báo "Phiên đã đủ người." khi vượt.

Mã phiên và mã cá nhân dùng bảng chữ **không dễ nhầm**: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (bỏ 0, 1, I, O); không trùng trong cùng phạm vi; so khớp không phân biệt hoa thường.

### 21.3. Giao diện học sinh

**Dạng Phiếu**: học sinh thấy nguyên phiếu như bản giáo viên chiếu (cùng trình xem, có bút và công cụ trình bày, **không có đáp án, Quiz, Làm trên phiếu của M11**), và làm ngay trên phiếu:

| Dạng | Cách làm | Giá trị gửi lên |
|---|---|---|
| `mcq`, `cloze_mcq` | Bấm một phương án (bấm lại để bỏ chọn) | chỉ số phương án, dạng chuỗi |
| `tfng` | Bấm T, F hoặc NG | `"T"`, `"F"`, `"NG"` |
| `fill_blank`, `word_form` | Gõ vào chỗ trống | chuỗi |
| `rewrite`, `short_answer` | Gõ vào ô (gợi ý tối đa `maxWords` từ) | chuỗi |
| `matching` | Chọn chữ cái trong hộp chọn ở từng hàng | chỉ số trong `rightList`, dạng chuỗi |
| `ordering` | Bấm lần lượt các từ (từ đã dùng mờ đi); nút "Xếp lại từ đầu" | câu ghép (các từ cách nhau một dấu cách, thêm `punct` khi dùng hết từ) |

Sau khi nộp (hoặc phiên kết thúc): phiếu **khóa**; câu đúng tô xanh, câu sai tô đỏ, câu bỏ trống tô đỏ kèm "Bỏ trống"; hiện số câu đúng và phần trăm.

**Dạng Quiz**: mỗi lần một câu, nút lớn (như 14.3 nhưng không có Kiểm tra tức thời của giáo viên: học sinh chọn xong chuyển câu, đáp án chỉ chấm ở máy chủ), hợp điện thoại. Cuối là màn nộp và kết quả.

**Bảng xếp hạng** (cả hai dạng): học sinh **đã nộp** (hoặc khi phiên kết thúc) bấm xem bảng xếp hạng cả lớp; dòng của mình được tô; **không lộ mã cá nhân người khác**. Chưa nộp mà đòi xem thì báo "Nộp bài rồi mới xem được bảng xếp hạng."

### 21.4. Xáo đáp án theo từng học sinh

Để giảm chép bài, hệ thống tự xáo, không hỏi giáo viên:

- **Có xáo**: thứ tự phương án của `mcq` và `cloze_mcq`; thứ tự cột phải `rightList` của `matching`.
- **Không xáo**: `tfng`, `ordering`, các dạng tự điền, và câu có phương án kiểu "All of the above", "None of the above", "A and B", "Both A and B" (nhận diện bằng biểu thức chính quy; câu nào có phương án như vậy thì giữ nguyên thứ tự).
- Hoán vị **cố định theo mã phiên + mã cá nhân + mã câu** (cùng người vào lại thấy cùng thứ tự); tránh hoán vị trùng thứ tự gốc.
- Máy chủ **đổi đáp án về thứ tự gốc trước khi lưu và chấm**; khi gửi lại cho học sinh thì đổi sang thứ tự riêng. Giáo viên luôn xem theo thứ tự gốc.

### 21.5. Chấm

Chuẩn hóa như 14.1. Câu chưa trả lời (rỗng) là "bỏ trống", không tính đúng cũng không tính sai nhưng vẫn nằm trong tổng.

| Dạng | Đúng khi |
|---|---|
| `mcq` | Phương án chọn có `id === correctId` |
| `cloze_mcq` | Chỉ số `=== correctIdx` |
| `tfng` | Bằng `answer` |
| `matching` | `rightList[chọn] === right` |
| `ordering` | Chuẩn hóa bằng `answerText` đã chuẩn hóa |
| `fill_blank`, `word_form`, `rewrite` | Chuẩn hóa trùng một mục của `accepted` |
| `short_answer` | Trùng một mục của `accepted`, hoặc câu trả lời **chứa** một mục của `accepted` dài hơn 2 ký tự |

(Khác M11: ở M15, `rewrite` và `short_answer` **được chấm tự động** theo `accepted`; giáo viên xem lại bài từng em nếu cần chấm tay.)

Kết quả một học sinh: `{correct, answered, total, pct, perQ: {mãCâu: true|false|null}}`.

### 21.6. Màn giáo viên

- **Danh sách học sinh** tự cập nhật (hỏi máy chủ định kỳ, khoảng vài giây, hoặc đẩy sự kiện): tên, mã cá nhân, đã nộp hay chưa, số câu đã làm, điểm.
- **Mở bài từng học sinh**: dạng Phiếu mở đúng phiếu có bài làm của em (câu đúng xanh, sai đỏ, theo thứ tự gốc), vẫn dùng được bút, công cụ trình bày, bật đáp án của M5, nút chuyển em trước/em sau; dạng Quiz hiện bảng từng câu (câu, đáp án em chọn, đáp án đúng).
- **Tổng hợp cả phiên**: số học sinh, số đã nộp, điểm trung bình (%); **bảng xếp hạng** (sắp theo số câu đúng giảm dần, đồng điểm thì ai nộp sớm hơn, rồi theo tên; đồng số câu đúng chung hạng); **biểu đồ tỉ lệ đúng theo từng bài** (đúng/sai/bỏ trống); **5 câu sai nhiều nhất** (kèm đáp án đúng).
- **Kết thúc phiên / Mở lại phiên.**
- **Xuất ảnh báo cáo PNG** (xếp hạng, biểu đồ, câu sai nhiều) để giáo viên giữ trước khi tắt máy chủ.

### 21.7. Giao diện lập trình (gợi ý, đặt tên theo ứng dụng chủ)

Tất cả là yêu cầu gửi dữ liệu JSON, trả về JSON; lỗi trả mã trạng thái HTTP và thông điệp ngắn.

| Việc | Gửi | Trả về |
|---|---|---|
| Mở phiên | `data` (ViewerData bản giáo viên), `mode` (`sheet`\|`quiz`) | `code`, `token` (chỉ giáo viên giữ), địa chỉ vào lớp |
| Trạng thái (giáo viên) | `code`, `token` | Danh sách học sinh, tổng hợp (21.6), `mode`, `ended` |
| Kết thúc / Mở lại | `code`, `token` | Trạng thái như trên |
| Học sinh vào | `code`, `name` (lần đầu) hoặc `studentCode` (vào lại) | `studentCode`, `name`, **đề riêng của em** (không đáp án, đã xáo), `answers` đã làm, `submittedAt`, `ended`, `result` (chỉ khi đã nộp hoặc phiên kết thúc) |
| Gửi bài | `code`, `studentCode`, `answers: {mãCâu: giáTrị}`, `submit` (bool) | `saved`, `submittedAt`, `result` khi nộp |
| Bảng xếp hạng (học sinh) | `code`, `studentCode` | Danh sách `{rank, name, correct, total, pct, submitted, me}`, hạng của em, số học sinh, số đã nộp, điểm trung bình |

Mã lỗi gợi ý: 400 thiếu tên hoặc phiếu rỗng; 404 mã phiên hoặc mã cá nhân sai; 409 phiên đã kết thúc, đã nộp rồi, phiên đầy, hoặc xem xếp hạng khi chưa nộp.

Mọi thao tác của giáo viên cần `token` do máy chủ cấp khi mở phiên; thao tác của học sinh cần mã phiên và mã cá nhân.

### 21.8. Ranh giới với ứng dụng chủ

Tách phần này thành **một lớp dịch vụ thay được** (giao diện như bảng 21.7): bản đơn giản là máy chủ nhỏ trong bộ nhớ; ứng dụng chủ có backend thì cài lớp thật (phiên gắn tài khoản giáo viên, học sinh gắn danh sách lớp, lưu lâu dài). Phần chấm, xáo, tổng hợp là **hàm thuần dùng chung** giữa máy chủ và các kiểm thử (mục 18.3).

### 21.9. Nghiệm thu M15

- [ ] Đề gửi học sinh **không có khóa đáp án** (kiểm bằng cách quét phản hồi `join`).
- [ ] Hai học sinh cùng phiên thấy thứ tự phương án khác nhau; vào lại cùng mã thì thứ tự giữ nguyên; giáo viên thấy theo thứ tự gốc; câu có "All of the above" không bị xáo.
- [ ] Thoát giữa chừng rồi vào lại bằng mã cá nhân: bài đã làm được phục hồi.
- [ ] Nộp rồi: phiếu khóa, gửi thêm đáp án bị từ chối (409); câu đúng xanh, sai/bỏ trống đỏ, có điểm.
- [ ] Chưa nộp thì không xem được bảng xếp hạng; sau khi nộp xem được, dòng mình được tô, không lộ mã người khác.
- [ ] Màn giáo viên: danh sách học sinh tự cập nhật; mở bài từng em đúng; bảng xếp hạng, biểu đồ theo bài, câu sai nhiều nhất đúng; kết thúc và mở lại; xuất được ảnh PNG.
- [ ] Chạy với tối thiểu 20 học sinh giả lập không lỗi; mã lỗi đúng ở các trường hợp 21.7.

## 22. Các giai đoạn thực hiện

Chia việc thành bốn giai đoạn, **mỗi giai đoạn chạy được và nghiệm thu được trước khi sang giai đoạn sau**. Thứ tự này theo đúng cách sản phẩm gốc được xây dựng: có khả năng **xem phiếu** → **trình chiếu** → **tương tác** → **làm bài thật trên lớp**.

| Giai đoạn | Tên | Module | Phụ thuộc |
|---|---|---|---|
| GĐ0 | Nền tảng xem phiếu | M1, M2 (L1–L4), M3 cơ bản, M4 cơ bản, M5, M6, M12, M14; M13 nếu cần | Mô hình dữ liệu (mục 3) |
| GĐ1 | **Trình chiếu** | M4 đầy đủ, M7, M8, M9, M10; hoàn thiện M2 (L5, L6) và M3 (giữ trọn, ngắt trang) | GĐ0 |
| GĐ2 | **Tương tác** | M11 | GĐ0 (đáp án), GĐ1 (phản hồi nổi trên trình xem) |
| GĐ3 | **Làm bài** | M15 | GĐ0, GĐ1 (trình xem), GĐ2 (so khớp, phản hồi) |

Một ứng dụng chủ đã có sẵn một số phần thì **bỏ qua phần đã có** nhưng vẫn chạy phần nghiệm thu của giai đoạn đó.

### 22.1. GĐ0. Nền tảng xem phiếu

- **Mục tiêu**: mở được một phiếu, thấy đúng như bản in, đọc đáp án, dùng được media. Giáo viên chiếu hoặc in được.
- **Làm**: bộ chuyển đổi dữ liệu (mục 3); hiển thị chín dạng câu (M1); bố cục L1–L4 và quy tắc lùi (M2); phân trang A4 với đo thật (M3: 6.1–6.5, chưa cần giữ trọn nâng cao nếu ứng dụng chủ chưa cần); chế độ Trang và Cuộn, thanh công cụ, đi tới, zoom cơ bản (M4: 7.1–7.4 trừ Trình chiếu, 2 trang, phóng vùng); đáp án bốn cấp trừ "lần lượt" (M5); ảnh phóng, trình phát audio, video mô phỏng (M6); lưu cục bộ ghim, bố cục (M12 cơ bản); nhãn truy cập, cảm ứng, in (M14).
- **Thứ tự gợi ý**: dữ liệu và adapter → M1 → M2 → M3 → M4 cơ bản → M5 → M6 → M14.
- **Nghiệm thu**: mục 4.4, 5, 6 (M3), 8 (M5, bốn cấp), 9.4 (M6) đạt; vai trò học sinh không có phần tử đáp án; số trang ổn định.
- **Không làm**: bút vẽ, trình chiếu, quiz.

### 22.2. GĐ1. Trình chiếu

- **Mục tiêu**: giáo viên dùng phiếu để **dạy trên lớp qua máy chiếu hoặc bảng tương tác**: chiếu toàn màn hình, viết lên phiếu, che hé nội dung, điều khiển nhịp buổi học.
- **Làm**, theo thứ tự:
  1. **Chế độ nâng cao** (M4): Trình chiếu toàn màn hình với thanh tự ẩn, 2 trang cạnh nhau lật theo cặp, phóng vùng, vừa ngang/vừa cao.
  2. **Bút vẽ chú thích** (M7) và **lưu nét vẽ** (M12): Con trỏ mặc định, Bút khóa cho cảm ứng, vẽ theo phím giữ, tẩy, hoàn tác.
  3. **Thao tác theo bài** (M9): phóng to một bài và chuyển bài, ghim, ghi chú giáo viên.
  4. **Công cụ trình bày** (M8): che câu, rèm, tối/trắng màn, đèn rọi, hiện đáp án lần lượt, đồng hồ, bảng trắng.
  5. **Bảng nhanh** (M10) nháy đúp.
  6. **Hoàn thiện dàn trang** cho phiếu chiếu và in: L5, L6; giữ trọn bài, ngắt trang, tách bài đoạn văn dài (M2, M3).
- **Nghiệm thu**: mục 7 (trình chiếu, 2 trang, phóng vùng), 10 (M7), 11 (M8), 12 (M9), 13 (M10), 15 (M12) đạt; trên máy tính bảng có bút vẽ được, không cuộn trang khi vẽ; đổi chế độ không mất nét vẽ.
- **Không làm**: chấm đúng/sai, quiz.

### 22.3. GĐ2. Tương tác

- **Mục tiêu**: **học sinh (hoặc giáo viên cùng lớp) trả lời ngay trên màn hình chiếu** và thấy đúng/sai tức thì, **không lưu**, không cần máy chủ.
- **Làm**, theo thứ tự:
  1. **Thư viện phản hồi đúng/sai** (14.4): hình, lời, âm tổng hợp, chọn ngẫu nhiên không lặp liền kề; cấu hình bật/tắt từng mục (`feedback`).
  2. **Quiz** (14.3): một câu mỗi lần, kiểm tra, tổng kết `x/y` không lưu.
  3. **Tùy chọn Quiz**: xáo câu, thử lại, hiện đáp án sau khi sai, hẹn giờ, tắt tiếng.
  4. **Làm trên phiếu** (14.2): chọn, điền, nối, sắp xếp ngay trên trang, tô xanh/đỏ, bộ đếm.
  5. Lối vào Quiz và Làm trên phiếu ở nơi giáo viên thường mở phiếu (ví dụ từ trình soạn hoặc màn xem trước của ứng dụng chủ).
- **Nghiệm thu**: mục 14 (M11) đạt; vai trò học sinh không thấy M11; tắt "Làm trên phiếu" đưa phiếu về nguyên bản.
- **Không làm**: lưu điểm, nhiều học sinh, máy chủ chấm. (Phạm vi cố ý hẹp: chỉ tự kiểm tức thời.)

### 22.4. GĐ3. Làm bài

- **Mục tiêu**: **cả lớp làm phiếu trên thiết bị của mình**, máy chủ chấm, giáo viên thấy kết quả cả lớp ngay trong buổi học.
- **Làm**, theo thứ tự:
  1. **Máy chủ và vòng đời phiên** (21.1, 21.2, 21.7): mở phiên, mã phiên, vào lớp bằng tên và mã cá nhân, tự lưu, nộp, kết thúc/mở lại. Tách đề và khóa; lớp dịch vụ thay được (21.8).
  2. **Chấm phía máy chủ** (21.5) và **kết quả sau nộp** (tô xanh/đỏ, điểm).
  3. **Giao diện học sinh dạng Phiếu** (21.3): dùng lại trình xem vai trò học sinh, thêm ô làm bài thật.
  4. **Giao diện học sinh dạng Quiz** cho điện thoại nhỏ.
  5. **Xáo đáp án theo từng em** (21.4).
  6. **Bảng xếp hạng** cho học sinh đã nộp.
  7. **Màn giáo viên** (21.6): danh sách tự cập nhật, mở bài từng em, tổng hợp, biểu đồ, câu sai nhiều, **xuất ảnh báo cáo PNG**.
- **Nghiệm thu**: mục 21.9 đạt; kiểm thử máy chủ tự động (chấm, xáo, tổng hợp, mã lỗi) chạy được không cần trình duyệt.
- **Không làm**: giao bài về nhà, lưu điểm lâu dài, quản lý lớp theo năm học (thuộc ứng dụng chủ).
- **Lưu ý triển khai**: máy chủ trong mạng cục bộ cần được tường lửa cho phép; một số Wi‑Fi trường chặn các máy nói chuyện với nhau, khi đó dùng điểm phát Wi‑Fi của máy giáo viên.

### 22.5. Điều kiện chuyển giai đoạn

Chỉ sang giai đoạn kế khi: (a) toàn bộ nghiệm thu giai đoạn hiện tại đạt; (b) bộ kiểm thử sẵn có của ứng dụng chủ vẫn đạt; (c) người phụ trách đã xem thử trên thiết bị thật (máy chiếu hoặc máy tính bảng ở GĐ1, điện thoại ở GĐ3); (d) báo cáo cuối giai đoạn nêu module đã làm, đã bỏ và điểm lệch tài liệu.


---

## Phụ lục A. Bảng giá trị tham chiếu

| Nhóm | Giá trị |
|---|---|
| Trang A4 | 794 × 1123 px; lề trên 56, phải 64, dưới 60, trái 64; chiều cao nội dung 981; chân trang cách đáy 22 |
| Khoảng cách | Giữa hai bài 20; dòng "(tiếp)" 18; giữa các trang khi xem 22 |
| Chữ nội dung | Họ chữ có chân: `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif`; 15.5px; giãn dòng 1.5; màu `#1A2233` |
| Chữ phụ (số câu, nhãn, đáp án, chân trang) | Họ không chân của hệ thống: `system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif` |
| Màu | Chữ phụ `#4A5466`, `#7A8496`, `#9AA3B2`; kẻ `#D5DBE4`, `#9AA3B2`; nền quanh trang `#E9EDF2`; nhấn `#2741B0`; đúng `#1E8A4C` (chữ đáp án `#0F6B37`); sai `#C23A2B`; tô bài đang chọn `#FFE36E` |
| Cỡ chữ | Tiêu đề phiếu 26; tiêu đề bài 18; hướng dẫn 15; phương án 15; chữ phụ 11–13 |
| Thu phóng | Vừa ngang tối đa 1.15; bước 1.15; giới hạn 0.3–4; phóng vùng tối đa 6 |
| Bút | Màu `#E8483B` (mặc định), `#2D5BD0`, `#1E8A4C`, `#1A2233`, `#F2B705`; đánh dấu `#F2C200`; dày Mảnh 2, Vừa 3 (mặc định), Dày 6; bán kính tẩy 12 |
| Ảnh | Khung trên trang 200 × 132; cột phải L2 210; ảnh lớn L5 400 × 264 |
| Nút công cụ | Cao 36 (nhỏ 30); cảm ứng và màn hẹp tối thiểu 44 × 44; bo 8 |
| Thời gian | Thông báo 2.2 giây; phản hồi 1.2 giây (nhỏ 0.9); thử lại Quiz 0.9 giây; tự xếp lại từ 1.2 giây |

## Phụ lục B. Ví dụ dữ liệu

Rút gọn; bản đầy đủ nên có đủ chín dạng.

```json
{
  "meta": {"code":"WS-0001","version":1,"kind":"teacher","title":"A Day in Space",
           "lesson":"Level 2 · Unit 1 · Daily routines","theme":{"name":"Space Explorers","emoji":"🚀"},"pagesTarget":4},
  "items": [
    {"id":"e1","type":"matching","title":"Match the words","instruction":"Match the words with the pictures.",
     "layout":"L2","passage":"","wordBank":[],
     "media":[{"id":"m1","kind":"image","keyword":"morning routine","emoji":"⏰","hue":220,"style":0,"alt":"Illustration: morning routine"}],
     "questions":[{"id":"q1","left":"usually","right":"🔁","explanation":"usually: most of the time"},
                  {"id":"q2","left":"lunch","right":"🍱"}],
     "rightList":["🌆","🔁","🚫","🍱","🏫","🌅"],"breakBefore":false},
    {"id":"e2","type":"mcq","title":"Pick the best answer","instruction":"Choose A, B or C.","layout":"L1",
     "passage":"","wordBank":[],"media":[],
     "questions":[{"id":"q3","stem":"I usually watch TV in the ___.",
       "options":[{"id":"o0","text":"homework"},{"id":"o1","text":"breakfast"},{"id":"o2","text":"evening"}],
       "correctId":"o2","explanation":"\"evening\" makes the sentence correct."}]},
    {"id":"e3","type":"tfng","title":"Reading check","instruction":"Write T, F or NG.","layout":"L3",
     "passage":"Mia wakes up at six o'clock. She goes to school at seven.","wordBank":[],
     "media":[{"id":"m2","kind":"audio","title":"Listen and read","transcript":"Mia wakes up at six o'clock.\nShe goes to school at seven.","duration":10}],
     "questions":[{"id":"q4","statement":"Mia wakes up at six o'clock.","answer":"T"}]},
    {"id":"e4","type":"cloze_mcq","title":"Complete the text","instruction":"Choose the correct word.","layout":"L3",
     "passage":"She has {1} at half past six. She goes to {2} at seven.","wordBank":[],"media":[],
     "questions":[{"id":"q5","n":1,"options":["breakfast","teeth","school"],"correctIdx":0},
                  {"id":"q6","n":2,"options":["lunch","school","bed"],"correctIdx":1}]},
    {"id":"e5","type":"rewrite","title":"Sentence transformation","instruction":"Begin with the words given.","layout":"L1",
     "passage":"","wordBank":[],
     "media":[{"id":"m3","kind":"video","title":"A morning on the station","caption":"Zed wakes up and has breakfast.","duration":24,"hue":19}],
     "questions":[{"id":"q7","original":"We have breakfast at seven.","lead":"He","accepted":["He has breakfast at seven."]}]}
  ],
  "feedback": {"correct":{"img":{"star":true,"check":true},"snd":{"chime":true}},
               "wrong":{"img":{"arrow":true},"snd":{"soft":true}},"volume":0.6,"showText":true}
}
```

Cùng câu `tfng` ở dữ liệu học sinh (đáp án và giải thích đã bỏ): `{"id":"q4","statement":"Mia wakes up at six o'clock."}`; `feedback` là `null` hoặc vắng mặt.

## Phụ lục C. Bảng âm thanh phản hồi

Âm tổng hợp bằng Web Audio: mỗi nốt là một bộ dao động (tần số Hz / thời lượng giây), nối tiếp nhau, mỗi nốt chồng lên nốt trước 20% thời lượng. Biên độ tăng nhanh về `volume × 0.35` trong 15 ms rồi tắt dần theo hàm mũ tới hết nốt.

| Âm | Nhóm | Nốt | Dạng sóng |
|---|---|---|---|
| `chime` | đúng | 880/0.12, 1320/0.22 | sine |
| `arp` | đúng | 523/0.08, 659/0.08, 784/0.08, 1047/0.18 | sine |
| `pop` | đúng | 600/0.05, 900/0.09 | sine |
| `bell` | đúng (cũng dùng cho đồng hồ hết giờ) | 1175/0.3 | sine |
| `soft` | sai | 330/0.18, 262/0.26 | triangle |
| `bloop` | sai | 392/0.1, 294/0.22 | triangle |
| `hmm` | sai | 311/0.16, 294/0.16, 277/0.22 | triangle |
