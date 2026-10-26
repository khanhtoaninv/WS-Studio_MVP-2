# ĐẶC TẢ TỆP HTML PHIẾU BÀI TẬP (bản xuất và viewer)

> Mã tài liệu: **WSS-HTML-SPEC** · Phiên bản **1.0** · Ngày **26/10/2026** · Quyết định gốc: **D-139**
> Đối tượng đọc: đội hoặc hệ thống khác cần **tự tạo tệp HTML phiếu có tính năng tương đương** tệp mà ws-studio xuất ra.
> Bản tham chiếu: ws-studio phiên bản app 16 (`src/viewer/viewer.js`, `src/viewer/viewer.css`, `src/domain/export.js`).
> Ngôn ngữ: tài liệu và giao diện tiếng Việt; **nội dung phiếu tiếng Anh**.

Tệp kèm theo trong cùng thư mục (`docs/html-phieu/`), dùng làm chuẩn đối chiếu:

| Tệp | Là gì |
|---|---|
| `WS-0008_v1_giao-vien.html` | Tệp xuất thật, bản giáo viên, phiếu trình diễn đủ 9 dạng bài, bố cục L1–L4, ảnh, audio, video |
| `WS-0008_v1_hoc-sinh.html` | Tệp xuất thật, bản học sinh của cùng phiếu (không có dữ liệu đáp án) |
| `vi-du-du-lieu-giao-vien.json` | Dữ liệu đầu vào (ViewerData) của bản giáo viên, đúng như nhúng trong tệp |
| `vi-du-du-lieu-hoc-sinh.json` | Dữ liệu đầu vào của bản học sinh |
| `anh-hoc-sinh-trang1.png`, `anh-giao-vien-dap-an.png` | Ảnh chụp trang 1 bản học sinh và trang 2 bản giáo viên khi bật đáp án |

Tạo lại các tệp mẫu sau khi đổi viewer: `npm run build` rồi `python tools/tao_mau_html.py`.

---

## Mục lục

1. Phạm vi và mức yêu cầu
2. Tổng quan: hai tệp, một viewer
3. Ràng buộc kỹ thuật (một tệp, ngoại tuyến)
4. Cấu trúc tệp HTML, tên tệp và metadata
5. Dữ liệu đầu vào (ViewerData)
6. Chín dạng câu hỏi
7. Bố cục bài L1–L6
8. Dàn trang A4
9. Thanh công cụ và chế độ xem
10. Đáp án và giải thích
11. Media: ảnh, audio, video
12. Lớp vẽ (bút, tẩy, đánh dấu)
13. Công cụ trình bày
14. Phóng to một bài, ghim bài, ghi chú giáo viên
15. Bảng nhanh và bảng trắng
16. Làm trên phiếu, Quiz và phản hồi đúng sai
17. Phím tắt
18. Lưu cục bộ
19. Kiểu dáng
20. Khả năng tiếp cận, cảm ứng, in
21. An toàn dữ liệu (escape, không lộ đáp án)
22. Tiêu chí nghiệm thu
23. Ngoài phạm vi và điểm mở
- Phụ lục A. Khung tệp tối thiểu
- Phụ lục B. Ví dụ dữ liệu rút gọn
- Phụ lục C. Ánh xạ sang mã nguồn tham chiếu

---

## 1. Phạm vi và mức yêu cầu

Tài liệu mô tả **tệp HTML phiếu bài tập** mà ws-studio tải về khi phiếu đã duyệt cấp 2 (Tải bản chính thức), gồm: dữ liệu đầu vào, cách hiển thị, hành vi tương tác, kiểu dáng và ràng buộc. Hệ thống khác dựa vào đây để sinh ra tệp có cùng tính năng từ cùng dữ liệu, không cần mã của ws-studio.

Ba mức yêu cầu dùng xuyên suốt:

- **BẮT BUỘC**: thiếu thì không coi là tương đương.
- **NÊN**: có trong bản tham chiếu và được giáo viên dùng; chỉ bỏ khi có lý do và ghi lại.
- **CÓ THỂ**: chi tiết trình bày; được làm khác miễn giữ ý.

Khi tài liệu và tệp mẫu khác nhau, **tệp mẫu thắng** (nó là đầu ra thật của bản tham chiếu); báo lại để sửa tài liệu.

Mặc định mức theo nhóm (từng mục có thể ghi riêng):

| Nhóm | Mức |
|---|---|
| Ràng buộc một tệp ngoại tuyến, metadata, dữ liệu đầu vào, bản học sinh không đáp án, escape | BẮT BUỘC |
| Hiển thị 9 dạng câu, bố cục L1–L6, dàn trang A4, đầu phiếu và chân trang | BẮT BUỘC |
| Chế độ xem (trang, cuộn, trình chiếu, 2 trang), zoom, đi tới, đáp án, media, lớp vẽ, lưu cục bộ | BẮT BUỘC |
| Công cụ trình bày, phóng to một bài, ghim, ghi chú, bảng nhanh, bảng trắng, Quiz, Làm trên phiếu, phản hồi | NÊN |
| Màu, cỡ chữ, khoảng cách, icon, hiệu ứng | CÓ THỂ (giữ giá trị tham chiếu nếu không có lý do đổi) |

## 2. Tổng quan: hai tệp, một viewer

Mỗi lần xuất tạo **hai tệp độc lập** từ cùng một phiếu:

| | Bản giáo viên (`kind: "teacher"`) | Bản học sinh (`kind: "student"`) |
|---|---|---|
| Dữ liệu đáp án | Có (khóa đáp án, giải thích, cấu hình phản hồi) | **Không có trong tệp**, kể cả trong metadata và mã nguồn |
| Nhãn trên thanh công cụ và chân trang | "Bản giáo viên" | "Bản học sinh" |
| Nhóm Đáp án, Quiz, Làm trên phiếu | Có | Không |
| Nút ✓ (đáp án bài) và 📝 (ghi chú) ở đầu bài, nút "?" từng câu | Có | Không |
| Công cụ "Hiện đáp án lần lượt", phím `A`, `Space` | Có | Không |
| Mọi tính năng còn lại (xem, zoom, vẽ, trình bày, media, bảng nhanh) | Có | Có |

Hai tệp dùng **cùng một mã viewer**; khác nhau chỉ ở dữ liệu nhúng. Viewer quyết định là bản giáo viên khi `meta.kind === "teacher"`.

Mọi thao tác trong viewer **không đổi dữ liệu phiếu** (BR-14). Những gì người dùng tạo ra (nét vẽ, ghi chú, ghim, chế độ 2 trang) lưu riêng trên trình duyệt (mục 18).

## 3. Ràng buộc kỹ thuật (một tệp, ngoại tuyến)

**BẮT BUỘC**

1. **Một tệp `.html` tự đủ.** CSS và JS viết thẳng trong tệp (`<style>`, `<script>`). Không tải gì từ mạng: không CDN, không font web, không ảnh ngoài, không gọi API. Mở bằng bấm đúp (`file://`) phải chạy đủ chức năng khi máy **không có mạng**.
2. **Media nhúng trong tệp.** Ảnh và khung video là SVG sinh bằng mã từ dữ liệu (mục 11). Audio đọc bằng giọng đọc của trình duyệt (`speechSynthesis`); không có thì mô phỏng thanh tiến độ.
3. **Âm thanh phản hồi** tổng hợp bằng Web Audio (`AudioContext`), không dùng tệp âm thanh.
4. **Dữ liệu nằm trong thẻ `<script type="application/json">`**, viewer đọc bằng `JSON.parse(textContent)`. Không dựng dữ liệu bằng chuỗi JS thực thi.
5. **Chạy được trên** Chrome, Edge, Firefox, Safari bản hiện hành (Safari từ 16.4, vì mã dùng regex lookbehind); laptop, máy chiếu, bảng tương tác, máy tính bảng có bút. Chuột, cảm ứng và bút dùng chung Pointer Events.
6. **Không lỗi console** khi mở và khi dùng các chức năng.
7. **Không phụ thuộc máy chủ.** Không cần đăng nhập, không gửi dữ liệu đi đâu.

**Tham khảo kích thước**: tệp mẫu khoảng 135–140 KB (viewer JS khoảng 89 KB, CSS khoảng 21 KB, dữ liệu 14–20 KB). Font dùng font hệ thống (không nhúng font trong tệp xuất).

**Kiểu mã của bản tham chiếu**: viewer là một IIFE "script cổ điển" (không ES module), gắn vào `window.WSV`. Hệ thống khác được tự chọn công nghệ (React, Svelte, JS thuần…) **miễn đầu ra vẫn là một tệp HTML tự đủ** thỏa các điều trên.

## 4. Cấu trúc tệp HTML, tên tệp và metadata

### 4.1. Tên tệp (BẮT BUỘC)

```
<mã phiếu>_v<số phiên bản>_giao-vien.html
<mã phiếu>_v<số phiên bản>_hoc-sinh.html
```

Ví dụ: `WS-0008_v1_giao-vien.html`, `WS-0008_v1_hoc-sinh.html`.

### 4.2. Khung tài liệu (BẮT BUỘC về các thẻ metadata và hai khối JSON; phần còn lại CÓ THỂ)

Thứ tự trong tệp tham chiếu:

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{tên phiếu} · Bản giáo viên</title>            <!-- hoặc "· Bản học sinh" -->
  <meta name="ws-id" content="{mã phiếu}">
  <meta name="ws-version" content="{số phiên bản}">
  <meta name="ws-kind" content="teacher">                <!-- hoặc "student" -->
  <script type="application/json" id="ws-meta">{meta}</script>
  <style>html,body{margin:0;height:100%;background:#E9EDF2}#app{height:100vh} …CSS viewer…</style>
</head>
<body>
  <div id="app"></div>
  <script type="application/json" id="ws-data">{ViewerData}</script>
  <script>…mã viewer…</script>
  <script>WSV.mount(document.getElementById('app'),
          JSON.parse(document.getElementById('ws-data').textContent), {globalKeys:true});</script>
</body>
</html>
```

- `lang="en"` vì nội dung phiếu tiếng Anh; nhãn giao diện viewer vẫn tiếng Việt.
- `data-theme="light"`: tệp xuất luôn dùng thanh công cụ sáng (chế độ tối chỉ áp cho viewer trong app).
- `#ws-meta` chứa đúng đối tượng `meta` của ViewerData (mục 5.1). Mục đích: hệ thống chuyên dụng đọc được mã phiếu, phiên bản, loại bản mà không cần chạy JS (D-50).
- `#ws-data` chứa toàn bộ ViewerData.

### 4.3. Mã hóa JSON trong thẻ script (BẮT BUỘC)

Trước khi chèn JSON vào `<script type="application/json">`, thay:

| Ký tự | Thay bằng | Lý do |
|---|---|---|
| `<` | `<` | Chặn `</script>` và thẻ HTML trong chuỗi người dùng |
| U+2028 | ` ` | Ký tự ngắt dòng làm hỏng một số trình phân tích |
| U+2029 | ` ` | Như trên |

Kết quả: phần dữ liệu nhúng **không chứa ký tự `<` thô** nào (bộ kiểm tra xuất bản kiểm điều này).

## 5. Dữ liệu đầu vào (ViewerData)

ViewerData là một đối tượng JSON. Ví dụ đầy đủ ở `vi-du-du-lieu-giao-vien.json` và `vi-du-du-lieu-hoc-sinh.json`.

```
ViewerData {
  meta:      Meta
  items:     Item[]            // các bài, theo thứ tự trên phiếu
  qfb:       QuizFeedback|null // cấu hình phản hồi đúng/sai; null ở bản học sinh
  mediaFail: boolean           // chỉ để demo lỗi media; tệp xuất luôn false
}
```

### 5.1. Meta

| Trường | Kiểu | Bắt buộc | Ý nghĩa và cách dùng |
|---|---|---|---|
| `code` | string | có | Mã phiếu, ví dụ `WS-0008`. Hiện ở đầu phiếu và chân trang; dùng trong khóa lưu cục bộ |
| `version` | number | có | Số phiên bản phiếu. Hiện dạng `v1` |
| `kind` | `"teacher"` \| `"student"` | có | Loại bản |
| `title` | string | có | Tên phiếu. Tiêu đề lớn đầu trang 1, tên trên thanh công cụ, `<title>` |
| `lesson` | string | có | Nhãn lesson ngắn, ví dụ `Level 2 · U1 · Lesson 1.1 Daily routines`. Hiện ở dòng meta đầu phiếu |
| `lessonFull` | string | không | Nhãn đầy đủ có tên giáo trình (chỉ metadata) |
| `exportedAt` | string ISO 8601 | có | Thời điểm xuất (chỉ metadata) |
| `exportedBy` | string | có | Người xuất (chỉ metadata) |
| `theme` | `{name, emoji}` \| null | không | Theme phiếu; có thì hiện viên "🚀 Space Explorers" ở đầu phiếu |
| `pagesTarget` | number \| null | không | Số trang A4 mục tiêu. Dùng cho tự thu gọn (mục 8.6) |
| `scope` | object | có | `{curriculum, curriculumVersion, levelId, unitId, lessonIds[]}` (chỉ metadata) |
| `standards` | string[] | có | Tiêu chuẩn đã dùng, dạng `"STD-MCQ@1.2"` (chỉ metadata) |

### 5.2. Item (một bài)

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | string | Mã bài, duy nhất trong phiếu. Dùng làm khóa ghim, ghi chú, `data-ex` |
| `no` | number | Số thứ tự 1, 2, 3… (viewer tự đánh số theo vị trí, trường này để tham khảo) |
| `type` | string | Một trong 9 dạng: `mcq`, `fill_blank`, `word_form`, `matching`, `ordering`, `tfng`, `cloze_mcq`, `rewrite`, `short_answer` |
| `title` | string | Tiêu đề bài |
| `instruction` | string | Hướng dẫn (in nghiêng dưới tiêu đề); rỗng thì bỏ |
| `layout` | `"L1"`…`"L6"` | Bố cục (mục 7) |
| `passage` | string | Đoạn văn; rỗng nếu không có. Với `cloze_mcq` chứa chỗ trống dạng `{1}`, `{2}`… Giữ xuống dòng (`white-space: pre-wrap`) |
| `wordBank` | string[] | Hộp từ; rỗng thì không hiện. Có thể trùng từ |
| `media` | Media[] | Ảnh, audio, video của bài (mục 5.4) |
| `questions` | Question[] | Câu hỏi theo dạng (mục 5.3) |
| `rightList` | string[] | Chỉ dạng `matching`: cột phải **đã xáo**, gồm đáp án của các câu và mục gây nhiễu |
| `breakBefore` | boolean | Bắt đầu bài ở trang mới (D-134) |
| `keep` | boolean | Không bắt buộc. Có thì ghi đè mặc định "giữ trọn bài trên một trang" (mục 8.4) |

### 5.3. Question theo dạng

Mọi câu có `id` (string, duy nhất). Cột "Chỉ bản GV" là các khóa **phải bỏ** ở bản học sinh.

| Dạng | Trường hiển thị | Chỉ bản GV |
|---|---|---|
| `mcq` | `stem` (có thể chứa `___`), `options: [{id, text}]` (2–4 phương án) | `correctId`, `explanation` |
| `fill_blank` | `text` (chứa `___` là chỗ trống) | `accepted: string[]`, `explanation` |
| `word_form` | `text` (chứa `___`), `baseWord` (chữ in hoa, ví dụ `GO`) | `accepted`, `explanation` |
| `matching` | `left` (vế trái) | `right` (chuỗi đúng, nằm trong `rightList`), `explanation` |
| `ordering` | `words: string[]` (đã xáo), `punct` (dấu câu cuối, mặc định `.`) | `answerText` (câu đúng có dấu), `explanation` |
| `tfng` | `statement` | `answer: "T"\|"F"\|"NG"`, `explanation` |
| `cloze_mcq` | `n` (số chỗ trống trong passage), `options: string[]` | `correctIdx` (chỉ số 0), `explanation` |
| `rewrite` | `original`, `lead` (từ mở đầu câu viết lại) | `accepted`, `explanation` |
| `short_answer` | `question`, `maxWords` (số từ tối đa) | `accepted`, `explanation` |

Chuỗi `___` là **hai dấu gạch dưới trở lên liền nhau**; mỗi cụm như vậy thành một chỗ trống.

Khóa đáp án đầy đủ (phải vắng mặt hoàn toàn ở bản học sinh): `correctId`, `accepted`, `answer`, `correctIdx`, `explanation`, `answerText`, `right`. Bản học sinh vẫn có `rightList` (đó là đề, không phải đáp án) và `qfb: null`.

### 5.4. Media

```
Ảnh   { id, kind:"image", keyword, emoji, hue (0–359), style (0|1|2), alt, status, source?, prompt? }
Audio { id, kind:"audio", title, transcript, voice ("en-GB"), rate, speakers: string[], duration (giây), status, source? }
Video { id, kind:"video", title, caption, duration (giây), hue, status, source? }
```

- `alt` của ảnh là bắt buộc về nội dung (V15); dùng làm `aria-label`.
- `transcript` audio: mỗi dòng (ngắt bằng `\n`) là một lượt; dòng dạng `Tên: lời` là lời của người nói `Tên`. Một dòng duy nhất thì tách theo câu.
- `source`, `prompt`, `status` là thông tin nguồn gốc, viewer không dùng để hiển thị.

### 5.5. QuizFeedback (`qfb`, chỉ bản GV)

```json
{"correct":{"img":{"star":true,"check":true,"confetti":true,"thumbs":true,"trophy":true,"smile":true},
            "snd":{"chime":true,"arp":true,"pop":true,"bell":true}},
 "wrong":  {"img":{"arrow":true,"cloud":true,"sprout":true,"puzzle":true},
            "snd":{"soft":true,"bloop":true,"hmm":true}},
 "volume":0.6, "showText":true}
```

Bật hoặc tắt từng hình và âm dùng khi phản hồi đúng/sai (mục 16.3). Thiếu `qfb` thì dùng mặc định: đúng `star, check` + `chime`; sai `arrow` + `soft`; âm lượng 0.6; hiện lời.

## 6. Chín dạng câu hỏi

### 6.1. Khung chung của một câu (BẮT BUỘC)

Mỗi câu là một hàng: **số câu** (đậm, chữ sans 13px, xám đậm) bên trái, **thân câu** bên phải. Số câu đánh từ 1 trong mỗi bài (riêng `cloze_mcq` dùng `n`). Ở bản GV có thêm:

- dòng đáp án (ẩn mặc định, xanh `#0F6B37`, sans 12.5px đậm) ngay dưới thân câu;
- dòng giải thích (ẩn mặc định, xám `#7A8496`, 12px) nếu có `explanation`;
- nút tròn nhỏ "?" ở lề phải (chỉ hiện khi rê chuột hoặc thiết bị cảm ứng) để xem/ẩn đáp án riêng câu đó.

**Chỗ trống** (`___`): một đoạn gạch chân đậm (viền dưới 1.5px, rộng tối thiểu 84px), chèn trong dòng. Ở bản GV khi bật đáp án, đáp án hiện **ngay trong chỗ trống** (xanh đậm).

### 6.2. Từng dạng

| Dạng | Hiển thị trên giấy | Đáp án khi bật (bản GV) |
|---|---|---|
| `mcq` Trắc nghiệm | Câu dẫn; dưới là các phương án nằm ngang, mỗi phương án "**A** text", "**B** text"… (chữ cái sans đậm), cách nhau 22px, xuống dòng khi hết chỗ | Phương án đúng tô nền xanh nhạt `#E3F4EA` viền `#9fd3b2`; dòng `Answer: C · evening` |
| `fill_blank` Điền từ | Câu có chỗ trống | `accepted[0]` trong chỗ trống; dòng `Accept: a / b` |
| `word_form` Biến đổi từ | Câu có chỗ trống, cuối câu là **từ gốc in hoa** (sans đậm 12.5px, giãn chữ, xám) | Như điền từ |
| `ordering` Sắp xếp | Các từ đã xáo, mỗi từ trong một ô viền bo góc, nằm ngang; dưới là một dòng kẻ để viết | `answerText` hiện trên dòng kẻ; không có dòng `Answer` riêng |
| `tfng` Đúng/Sai/Không có | Nhận định; cùng dòng, bên phải là ba ô nhỏ `T` `F` `NG` | Ô đúng tô nền xanh `#1E8A4C` chữ trắng; dòng `Answer: T` |
| `cloze_mcq` Điền khuyết có lựa chọn | Trong đoạn văn, mỗi `{n}` thành **ô số n** (viền, sans đậm) + chỗ trống. Mỗi câu là một hàng: số `n` rồi các phương án A, B, C | Đáp án trong chỗ trống của đoạn văn; phương án đúng tô xanh; dòng `Answer: A · lunch` |
| `rewrite` Viết lại câu | Câu gốc; dòng dưới: **từ mở đầu** (đậm) + dòng kẻ dài 72% | Dòng `Accept: …` |
| `short_answer` Trả lời ngắn | Câu hỏi; dưới là một dòng kẻ để viết | Dòng `Accept: …` |
| `matching` Nối | Hai cột: trái là các vế `left` có số và một chỗ trống ngắn (34px) để ghi chữ cái; phải là `rightList` đánh **A, B, C…**. Mục bên phải là emoji hoặc chuỗi tối đa 3 ký tự thì hiện cỡ lớn (24px) | Chữ cái đúng (vị trí của `right` trong `rightList`) hiện trong chỗ trống |

Dạng `matching` không có dòng đáp án riêng: đáp án chỉ là chữ cái trong chỗ trống (nút "?" vẫn có).

### 6.3. Đoạn văn, hộp từ, đầu bài

- **Đầu bài**: ô số bài (nền `#1A2233`, chữ trắng, sans 12px đậm, bo 5px) + tiêu đề (serif 18px đậm) + nhóm nút công cụ bài ở bên phải (mục 14). Dưới là hướng dẫn in nghiêng xám `#4A5466`.
- **Đoạn văn**: khung nền `#F7F8FA`, viền `#E3E7EE`, bo 6px, đệm 10px 14px, giữ xuống dòng.
- **Hộp từ**: khung viền đứt 1.5px `#9AA3B2`, các từ cách nhau bằng dấu "·" nhạt, chữ sans 13.5px.
- Thứ tự trong bài (bố cục L1): đầu bài → media → đoạn văn → hộp từ → các câu.

## 7. Bố cục bài L1–L6

**BẮT BUỘC.** Mỗi bài có `layout`. Viewer tính **bố cục hiệu lực** như sau, rồi mới dựng:

1. `L2` hoặc `L5` mà bài **không có ảnh** → `L1`.
2. `L6` mà dạng bài không thuộc `mcq, matching, fill_blank, word_form, tfng` → `L1`.
3. `L3` mà bài **không có đoạn văn** → `L4` nếu có từ 6 câu trở lên, ngược lại `L1`.

| Mã | Tên | Cách dựng |
|---|---|---|
| L1 | Một cột | Chạy một mạch từ trên xuống; media thành một hàng ngang (ảnh 200×132, nút audio, nút video) ngay dưới đầu bài |
| L2 | Ảnh bên phải | Lưới hai cột `1fr 210px`, khoảng cách 16px: trái là đoạn văn, hộp từ, câu; phải là media xếp dọc, ảnh rộng hết cột. Cả bài là một khối không tách trang |
| L3 | Đoạn văn trái, câu phải | Lưới hai cột bằng nhau, cách 18px: trái là đoạn văn + media; phải là hộp từ + câu. Có luật tách riêng khi dài (mục 8.5) |
| L4 | Câu hai cột | Câu xếp thành cặp trong lưới hai cột (khoảng cách 2px dọc, 22px ngang) |
| L5 | Ảnh trên, câu dưới | Ảnh lớn 400×264 căn giữa ngay dưới đầu bài, câu một cột bên dưới |
| L6 | Lưới thẻ | Câu thành thẻ, lưới 3 cột (khung viền 1.5px bo 10px, đệm 8px 10px). Bài nối: vế trái thành thẻ 3 cột, cột phải thành thẻ 4 cột |

Bài **nối** luôn là một khối: L1 dùng hai cột `.mt`; L2 đặt hai cột trong phần trái, media bên phải; L5 ảnh lớn trên; L6 như bảng trên.

## 8. Dàn trang A4

**BẮT BUỘC** về kết quả: phiếu hiện thành các **trang A4 dọc** giống bản in; nội dung không tràn qua mép trang (trừ trường hợp "trang quá khổ" ở 8.5); các luật giữ trọn, ngắt trang, không để tiêu đề mồ côi được tôn trọng. Thuật toán dưới đây là của bản tham chiếu; hệ thống khác NÊN làm theo để số trang khớp.

### 8.1. Kích thước

| Đại lượng | Giá trị (px CSS, 96 dpi) |
|---|---|
| Trang | 794 × 1123 (A4) |
| Lề trong trang | trên 56, phải 64, dưới 60, trái 64 |
| Chiều cao dùng được cho nội dung (`PAGE_LIMIT`) | 1123 − 56 − 60 − 26 = **981** (26 dành cho chân trang) |
| Khoảng cách giữa hai bài | 20 |
| Dòng "(tiếp)" khi bài sang trang | 18 |

Trang được dựng ở kích thước thật 794 × 1123 rồi **thu phóng bằng `transform: scale()`**, nên tỉ lệ nội dung trong trang không đổi khi zoom.

### 8.2. Đầu phiếu (chỉ trang 1)

- Tiêu đề phiếu: serif 26px đậm.
- Dòng meta (sans 11.5px, xám): `lesson` · viên theme "emoji tên" · `code · v{version}`.
- Ba ô viết tay: `Name:` · `Class:` · `Date:` (ô Date ngắn hơn, tỉ lệ 0.6), gạch chân xám.
- Kẻ đậm 2px `#1A2233` dưới đầu phiếu, cách nội dung 18px.

### 8.3. Chân trang (mọi trang)

Cách đáy 22px, sans 10.5px, màu `#9AA3B2`. Trái: `WS-0008 · v1 · Bản giáo viên` (hoặc `Bản học sinh`). Phải: `{trang} / {tổng}`.

### 8.4. Chia bài thành đơn vị đo

Mỗi bài được cắt thành các **đơn vị** (unit), đo chiều cao thật bằng cách dựng thử trong một khung ẩn rộng 794px:

- Bố cục L1, L4, L5, L6 (trừ bài nối): đơn vị **đầu** = đầu bài + hướng dẫn + media + đoạn văn + hộp từ; sau đó mỗi **câu** là một đơn vị (L4: mỗi cặp câu; L6: mỗi hàng 3 thẻ).
- L2, L3 và mọi bài nối: cả bài là **một đơn vị**.

**Giữ trọn bài** (`keep`): mặc định bật với `tfng`, `cloze_mcq`, `short_answer`, `matching`; trường `keep` của bài ghi đè.

### 8.5. Thuật toán xếp trang

Đi lần lượt các đơn vị, trang hiện tại bắt đầu với chiều cao đầu phiếu (trang 1) hoặc 0:

1. Ở **đơn vị đầu tiên của một bài**, nếu trang đã có nội dung, gọi `chỗ còn = 981 − đã dùng − 20`:
   - `breakBefore` bật → sang trang mới.
   - `keep` bật, tổng chiều cao bài ≤ 961 và > chỗ còn → sang trang mới (đẩy cả bài).
   - Ngược lại, nếu là đơn vị đầu: cộng chiều cao đầu bài với tối đa **2 câu kế tiếp**; vượt chỗ còn → sang trang mới (tiêu đề không đứng một mình cuối trang).
2. **Bài L3 quá dài** (đơn vị cả bài không vừa chỗ còn): trừ khi bài giữ trọn và vừa một trang, tách bài: bỏ dần câu cuối khỏi khối hai cột đến khi khối (đoạn văn + các câu đầu) vừa chỗ; các câu còn lại thành từng đơn vị câu riêng sang trang sau, kèm dòng tiếp có thêm "· đoạn văn ở trang trước". Không tách được thì sang trang mới rồi thử lại trên trang trống.
3. Cộng đơn vị vào trang: thêm 20 nếu là bài mới trên trang này, thêm 18 nếu là phần tiếp của bài từ trang trước. Vượt 981 và trang đã có nội dung → sang trang mới.
4. Một đơn vị cao hơn cả trang trống → đặt vào trang đó và đánh dấu **trang quá khổ**: trang cao `max(1123, chiều cao + 150)`, viền và lớp vẽ cao theo.

Bài nối tiếp từ trang trước có dòng nhỏ ở đầu (sans 11px, xám): `Bài 5 (tiếp) · Reading check with Mia`.

### 8.6. Tự thu gọn theo số trang mục tiêu

Nếu `meta.pagesTarget` có giá trị và số trang vượt mục tiêu: mọi bài dạng `mcq`, `fill_blank`, `word_form`, `tfng` có từ 4 câu và bố cục hiệu lực L1 được **hiển thị** như L4 (không đổi dữ liệu), rồi xếp trang lại.

### 8.7. Vẽ lại khi đổi kích thước

Đổi kích thước cửa sổ làm tỉ lệ thay đổi hơn 1% → vẽ lại, giữ vị trí cuộn tương đối.

## 9. Thanh công cụ và chế độ xem

### 9.1. Thanh công cụ (BẮT BUỘC các nhóm Xem, Đi tới, Zoom, Đáp án, Bút; NÊN nhóm Trình bày)

Một hàng nút trên cùng, nền trắng, viền dưới, tự xuống dòng khi hẹp. Các nhóm, từ trái sang phải (nhãn đúng như bản tham chiếu):

| Nhóm | Nút (nhãn · gợi ý khi rê chuột) |
|---|---|
| Nhận diện | Tên phiếu (cắt bớt, tối đa 260px) · nhãn "Bản giáo viên" (nền xanh nhạt) hoặc "Bản học sinh" (nền xám) |
| Xem | `▤ Trang` · `☰ Cuộn` · `⛶ Trình chiếu` · `⧉ 2 trang` |
| Đi tới | `◀` Trang trước (←) · hộp chọn "Đi tới…" · `▶` Trang sau (→) |
| Zoom | `−` Thu nhỏ · `100%` (hiện tỉ lệ hiện tại, bấm để về mặc định) · `+` Phóng to · `↔` Vừa chiều ngang · `↕` Vừa chiều cao · `🔍` Phóng vùng |
| Đáp án (chỉ GV) | `✓ Đáp án` (toàn phiếu, phím A) · `ⓘ` giải thích · `🎯 Quiz` · `🖱 Làm trên phiếu` |
| Bút | `➚` Con trỏ · `✎ Bút` · `⌫` Tẩy · `▾` tùy chọn bút; nhóm phụ: 5 màu, độ dày (Mảnh/Vừa/Dày), `↶` hoàn tác, `↷` làm lại, `🗑` xóa tất cả nét, `👁` bật/tắt lớp vẽ |
| Trình bày | `🧰 Trình bày` (menu, mục 13) · `✎ Bảng nhanh` |

- Nút đang bật có nền đậm `#1A2233`, chữ trắng.
- Nhóm phụ của Bút **chỉ hiện** khi đang vẽ, khi bấm `▾`, hoặc khi đã có nét vẽ.
- Bản tham chiếu thay các ký tự biểu tượng trên thanh công cụ bằng **icon SVG nét** (viewBox 24, nét 1.8, đầu tròn); nội dung phiếu không bị đổi. Hệ thống khác được dùng bộ icon khác nhưng phải giữ nhãn chữ và `aria-label`.

### 9.2. Chế độ xem (BẮT BUỘC)

| Chế độ | Hành vi |
|---|---|
| **Trang** (mặc định) | Các trang xếp dọc, cách nhau 22px, có bóng, căn giữa trên nền `#E9EDF2` |
| **Cuộn** | Các trang nối liền, không bóng, ngăn bằng gạch đứt; vẫn giữ đúng nội dung trang |
| **Trình chiếu** | Toàn màn hình (`requestFullscreen` trên khung viewer), **chỉ hiện trang đang xem** (hoặc cặp trang ở chế độ 2 trang), thanh công cụ **tự ẩn** (mục 13). Thoát toàn màn hình bằng Esc hoặc nút trình duyệt thì về chế độ Trang |
| **2 trang** | Hai trang cạnh nhau, lật theo cặp (1-2, 3-4…). Dùng được với Trang và Trình chiếu; ở Cuộn thì bỏ qua. Lựa chọn được lưu (mục 18) |

### 9.3. Tỉ lệ và zoom (BẮT BUỘC)

- **Vừa ngang** (mặc định): tỉ lệ = (rộng khung − 48) / 794, **tối đa 1.15** khi không trình chiếu; chế độ 2 trang: (rộng − 48 − 30) / (2 × 794).
- **Vừa cao**: (cao khung − 48) / 1123.
- Zoom `+`/`−`: nhân hoặc chia 1.15, giới hạn 0.3 đến 4 lần so với tỉ lệ vừa; tỉ lệ cuối không nhỏ hơn 0.2.
- **Phóng vùng**: bấm `🔍`, kéo chọn một hình chữ nhật trên trang (rộng ít nhất 20px) → phóng sao cho vùng đó vừa chiều ngang (tối đa 6 lần) và cuộn tới vùng đó; thông báo "Đang phóng vùng. Esc để về tổng." Nút trên trang vẫn bấm được, nét vẽ phóng theo.
- Esc khi đang zoom → về 100%.

### 9.4. Đi tới (BẮT BUỘC)

Hộp chọn "Đi tới…" gồm, theo thứ tự: các **bài đã ghim** (`★ Bài 3: Missing words with Bolt`), các **trang** (`Trang 1`, `Trang 2`…), các bài còn lại (`Bài 1: …`). Chọn xong hộp trở về "Đi tới…".

- Đi tới trang: cuộn mượt tới trang (Trình chiếu: chuyển trang hiện).
- Đi tới bài: cuộn tới đầu bài.
- ◀ ▶, ←/→, PageUp/PageDown: lùi/tiến 1 trang (2 trang ở chế độ 2 trang). "Trang hiện tại" là trang cuối cùng có mép trên nằm trong 40% đầu khung nhìn.
- Phím `1`…`9`: nhảy tới bài thứ 1…9.

### 9.5. Thông báo nhanh

Hộp tối nhỏ ở giữa phía trên, tự tắt sau 2.2 giây. Dùng cho các thông báo trong tài liệu này (ví dụ "Đã xóa nét vẽ. Bấm ↶ để hoàn tác.").

## 10. Đáp án và giải thích (bản GV, BẮT BUỘC)

Bốn cấp xem/ẩn, độc lập nhau:

| Cấp | Cách bật |
|---|---|
| Toàn phiếu | Nút `✓ Đáp án` hoặc phím `A` |
| Một bài | Nút `✓` ở đầu bài; áp cho mọi phần của bài kể cả phần sang trang sau |
| Một câu | Nút "?" ở lề phải câu |
| Lần lượt | Phím `Space` hiện đáp án câu kế tiếp **trong phần đang nhìn thấy** (hoặc trong bài đang phóng to); `Shift+Space` ẩn câu vừa hiện; hết thì báo "Đã hiện hết đáp án trong phần đang xem." |

Giải thích: nút `ⓘ` bật/tắt riêng; chỉ hiện ở câu có `explanation`.

Đáp án hiện bằng cách đổi lớp CSS, **không dựng lại trang**, nên nét vẽ và vị trí cuộn giữ nguyên. Khi dựng lại trang (đổi zoom, chế độ), trạng thái đáp án toàn phiếu được giữ.

## 11. Media: ảnh, audio, video

### 11.1. Ảnh (BẮT BUỘC)

Ảnh là **SVG sinh từ dữ liệu**, không cần tệp ảnh. Công thức tham chiếu (viewBox 300×200):

- Nền gradient chéo từ `hsl(hue,70%,92%)` sang `hsl(hue+40,75%,84%)`.
- Họa tiết theo `style`: 0 = hai vòng tròn mờ; 1 = sọc chéo mờ; 2 = lưới chấm tròn; màu nhấn `hsl(hue,55%,55%)`.
- Bóng elip mờ dưới; `emoji` cỡ 78 ở giữa; `keyword` sans 14 đậm ở dưới, màu `hsl(hue,40%,30%)`.
- `role="img"`, `aria-label` = `alt`.

Ảnh trên trang là một **nút** (`aria-label="Phóng to ảnh: {alt}"`), khung 200×132 viền bo 8px. Bấm mở **lớp xem ảnh**: nền tối 82%, ảnh rộng tới 86% (tối đa 900px) tỉ lệ 3:2; nút `+`, `−` (bước 0.25, giới hạn 0.5–4), lăn chuột để zoom, kéo để di chuyển; đóng bằng `✕ Đóng`, bấm nền, hoặc Esc.

### 11.2. Audio (BẮT BUỘC phát được, NÊN đủ điều khiển)

Trên trang: nút viên thuốc xanh `▶ {title}`. Bấm mở **trình phát** nổi ở giữa đáy (nền tối, rộng tối đa 560px) và tự phát. Chỉ một trình phát tại một thời điểm.

- Hàng điều khiển: phát/tạm dừng (`▶`/`❚❚`), phát lại từ đầu `↺`, thanh tua 0–1000, thời gian `m:ss / m:ss`, tốc độ `0.75×` `1×` `1.25×`, âm lượng, đóng `✕`.
- Dưới là **transcript**, cuộn được, cao tối đa 96px; dòng đang đọc được tô sáng và tự cuộn tới; tên người nói in đậm.
- Đọc bằng `speechSynthesis`, giọng `en-GB`, lần lượt từng dòng. Người nói thứ 1, 2, 3 trong hội thoại dùng giọng tiếng Anh khác nhau (nếu có) và cao độ 1, 1.35, 0.8.
- Thời lượng mỗi dòng ước tính = max(1.2, số từ / 2.6) giây; tổng dùng cho thanh tua.
- Trình duyệt không có giọng đọc: thanh tiến độ chạy theo thời lượng ước tính và hiện dòng vàng "Chế độ mô phỏng audio: trình duyệt không có giọng đọc, thanh tiến độ chạy theo thời lượng ước tính."

### 11.3. Video (BẮT BUỘC mô phỏng)

Trên trang: nút viên thuốc tím `▶ Video · {title}`. Bấm mở lớp tối, khung 16:9 rộng tối đa 800px, chạy **cảnh SVG hoạt họa** (nền `hsl(hue,45%,22%)`, mặt trời di chuyển, hai nhân vật emoji trượt ngang, góc trên ghi "{title} · mô phỏng") trong `duration` giây, phụ đề `caption` ở đáy khung. Có nút phát/tạm dừng, thanh tiến độ vàng, thời gian `0:ss / 0:dd`, đóng `✕` (hoặc bấm nền, Esc).

### 11.4. Lỗi media (NÊN)

Khi `mediaFail` là true: ảnh đầu tiên của mỗi bài hiện khung đỏ "Không tải được ảnh." + nút `Thử lại`; video hiện "Không tải được video." + `Thử lại`. Phần khác vẫn chạy. Tệp xuất luôn có `mediaFail: false`; hành vi này dùng cho demo trong app.

## 12. Lớp vẽ (BẮT BUỘC)

Mỗi trang có một **canvas phủ** đúng kích thước trang (794 × 1123, hoặc cao hơn với trang quá khổ), tọa độ nét lưu theo hệ tọa độ trang nên đúng vị trí ở mọi mức zoom.

- Viewer **luôn mở ở Con trỏ**: lớp vẽ không nhận chuột, mọi nút, ảnh, đáp án trên trang bấm được.
- **Bút (khóa)**: nút `✎ Bút` hoặc phím `P` (bấm lại để tắt); Esc về Con trỏ.
- **Vẽ theo phím giữ** (không cần bật Bút), thả phím là về Con trỏ, nét dở được hoàn tất; mất focus cửa sổ cũng về Con trỏ:

| Giữ phím + kéo | Kết quả | Màu |
|---|---|---|
| `Shift` | Đường thẳng, tự khóa ngang hoặc dọc theo hướng kéo lệch nhiều hơn | Đỏ `#E8483B` |
| `Ctrl` (Mac `Cmd`) | Bút đánh dấu tự do: nét dày gấp 4, trong suốt 35% | Vàng `#F2C200` |
| `Ctrl` + `Shift` | Hình chữ nhật chỉ viền | Đỏ `#E8483B` |
| Không giữ, đang ở Bút | Vẽ tự do | Màu đang chọn |

- Màu chọn: `#E8483B` (mặc định), `#2D5BD0`, `#1E8A4C`, `#1A2233`, `#F2B705`. Chọn màu tự bật Bút. Độ dày: Mảnh 2, **Vừa 3** (mặc định), Dày 6.
- **Tẩy** (`⌫`, phím `E`): kéo qua nét nào thì xóa **cả nét** đó (bán kính chạm 12px; với đường thẳng và khung là 10px quanh cạnh).
- **Hoàn tác / Làm lại** (`↶` `↷`, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y): ngăn xếp gồm thêm nét, tẩy nét, xóa tất cả.
- **Xóa tất cả** (`🗑`): xóa mọi nét mọi trang, báo "Đã xóa nét vẽ. Bấm ↶ để hoàn tác."
- **Ẩn lớp vẽ** (`👁`): ẩn hoặc hiện mọi nét, không xóa.
- Con trỏ: chữ thập khi vẽ, ô khi tẩy. Canvas đặt `touch-action: none` để vẽ bằng bút trên máy tính bảng không cuộn trang.
- Nét vẽ lưu cục bộ (mục 18), vẫn còn khi tải lại trang.

Một nét được lưu dạng `{t: "pen"|"line"|"hl"|"rect", c: "#màu", w: độ dày, pts: [[x, y], …]}`.

## 13. Công cụ trình bày (NÊN)

Menu `🧰 Trình bày` liệt kê công cụ kèm phím tắt; mục đang bật được tô. Mặc định tất cả tắt.

| Công cụ | Phím | Hành vi |
|---|---|---|
| Thanh công cụ tự ẩn | `H` | Thanh trượt lên khuất; rê chuột vào 16px mép trên thì hiện, rời xuống quá 70px thì ẩn. Trình chiếu tự bật |
| Che câu | `C` | Phủ sọc chéo xám lên **thân mọi câu và đoạn văn**, chữ "Bấm để hé"; bấm một câu để hé hoặc che lại; tắt công cụ là hé hết |
| Rèm kéo | `R` | Tấm rèm tối từ mép trên, ban đầu cao 40%; kéo tay nắm "⇕ Kéo rèm" ở mép dưới để hạ/nâng |
| Tối màn / Trắng màn | `B` / `W` | Phủ kín đen hoặc trắng; bấm chuột hoặc phím bất kỳ để quay lại |
| Đèn rọi | `L` | Tối 78% toàn khung trừ vòng tròn theo con trỏ (bán kính 140px); `Alt` + lăn chuột đổi cỡ 50–400px |
| Hiện đáp án lần lượt | `Space` | Như mục 10; chỉ bản GV |
| Đồng hồ đếm giờ | `T` | Hộp nổi góc trên phải: số lớn `3:00` (mặc định), nút `1′ 3′ 5′ 10′`, `−1′ +1′`, `▶ Bắt đầu`/`❚❚ Tạm dừng`, `↺` (về 3:00), `✕`. Hết giờ: số đỏ nhấp nháy, chuông kêu hai lần |
| Bảng trắng | `K` | Mục 15.2 |

## 14. Phóng to một bài, ghim bài, ghi chú giáo viên (NÊN)

Đầu mỗi bài có nhóm nút nhỏ (hiện khi rê chuột, luôn hiện trên thiết bị cảm ứng và khi trình chiếu):

| Nút | Bản | Hành vi |
|---|---|---|
| `☆` / `★` Ghim | cả hai | Ghim hoặc bỏ ghim; bài ghim lên đầu hộp "Đi tới" với dấu ★; lưu cục bộ |
| `⤢` Phóng to bài | cả hai | Mở lớp phủ chỉ chứa bài đó trên tờ giấy rộng 794px, thu phóng vừa ngang (hoặc `↕` vừa cao), cuộn dọc nếu dài. Thanh trên: `◀ Bài trước`, `Bài sau ▶`, "Bài i / n", `✓ Đáp án bài` (GV), `↔`, `↕`, `Về tổng (Esc)`. Phím ←/→ chuyển bài, Space hiện đáp án lần lượt trong bài. Nét vẽ gắn với trang, còn nguyên khi quay về |
| `✓` Đáp án bài | GV | Mục 10 |
| `📝` Ghi chú | GV | Hộp nổi nhỏ "Ghi chú giáo viên · chỉ bản giáo viên, lưu trên trình duyệt này", ô nhập 260×120, tự lưu khi gõ; chỉ mở khi bấm nên không lộ lên màn chiếu |

## 15. Bảng nhanh và bảng trắng (NÊN)

### 15.1. Bảng nhanh (cả hai bản)

- Mở bằng nút `✎ Bảng nhanh` hoặc **nháy đúp vào vùng trống** (không phải nút, ô nhập, lựa chọn, phương án, ô T/F/NG, ô từ sắp xếp, ảnh, hàng nối, thanh công cụ).
- Cửa sổ nổi 560 × 400, tối thiểu 360 × 260, kéo thanh trên để di chuyển, kéo góc để đổi cỡ.
- Công cụ: Bút, Tẩy nét, Text (bấm chỗ cần gõ, Enter để đặt, Esc bỏ), Đường thẳng, Mũi tên, Khung, Elip (giữ Shift: vuông hoặc tròn).
- 5 màu (`#1A2233` mặc định, đỏ, xanh dương, xanh lá, vàng), cỡ Nhỏ/Vừa/Lớn, nền Trắng / Kẻ ô 24px / Kẻ dòng 28px.
- Hoàn tác, làm lại, xóa hết (xóa hết cũng hoàn tác được), **Lưu PNG** (`bang-nhanh.png`, nền trắng), đóng `✕` hoặc Esc. Đóng chỉ ẩn: mở lại vẫn còn nội dung trong phiên. Không lưu cục bộ.

### 15.2. Bảng trắng (phím `K`)

Một trang trắng phủ toàn khung viewer (không tính vào số trang), vẽ tự do bằng màu và độ dày đang chọn. Nút: `↶`, `Xóa`, `Về phiếu (Esc)`. Nội dung giữ trong phiên, không lưu cục bộ.

## 16. Làm trên phiếu, Quiz và phản hồi đúng sai (bản GV, NÊN)

### 16.1. So khớp đáp án

- `mcq`: phương án chọn có `id === correctId`.
- `cloze_mcq`: chỉ số chọn `=== correctIdx`.
- `tfng`: `"T"|"F"|"NG"` `=== answer`.
- `matching`: `rightList[chọn] === right`.
- `fill_blank`, `word_form`: chuẩn hóa rồi so với từng mục của `accepted`.
- `ordering`: chuẩn hóa câu ghép (các từ cách nhau một dấu cách + `punct`) rồi so với `answerText`.
- `rewrite`, `short_answer`: **không tự chấm**.

Chuẩn hóa: chữ thường; `’` thành `'`; bỏ mọi ký tự ngoài `a-z 0-9 ' dấu cách`; gộp khoảng trắng; cắt hai đầu.

### 16.2. Làm trên phiếu (`🖱 Làm trên phiếu`)

Bật/tắt chế độ làm bài ngay trên trang. Bật thì tắt đáp án và báo "Làm trên phiếu: bấm chọn đáp án, bấm ô trống để điền. Tắt chế độ để xóa sạch."; cạnh nút hiện bộ đếm `Đúng x/y` (tính theo lần làm đầu của mỗi câu).

| Dạng | Thao tác | Chấm khi |
|---|---|---|
| `mcq`, `cloze_mcq` | Bấm một phương án (viền xanh) | Bấm |
| `tfng` | Bấm T, F hoặc NG | Bấm |
| `fill_blank`, `word_form` | Bấm chỗ trống → hiện ô nhập | Enter |
| `matching` | Bấm hàng → hiện hộp chọn chữ cái | Chọn |
| `ordering` | Bấm lần lượt các từ (từ đã dùng mờ đi), câu ghép hiện dưới | Dùng hết từ; sau 1.2 giây tự xếp lại |
| `rewrite`, `short_answer` | Không tương tác | |

Kết quả: cả câu tô nền xanh `#E3F4EA` (đúng) hoặc đỏ `#FDE7E4` (sai) kèm phản hồi cỡ nhỏ. Tắt chế độ: dựng lại trang, phiếu về nguyên bản. Không lưu.

### 16.3. Phản hồi đúng sai

Hình nổi giữa khung (cao 42%), phóng nhẹ khi hiện, tự tắt sau 1.2 giây (0.9 giây và hình 110px ở Làm trên phiếu); có thể kèm lời và âm thanh.

- **Hình** chọn ngẫu nhiên trong các hình đang bật của nhóm, **không lặp lại hình vừa dùng**. Đúng: `star` (sao vàng), `check` (dấu tích trên tròn xanh), `confetti` (giấy màu + 🎉), `thumbs` (👍), `trophy` (🏆), `smile` (mặt cười). Sai: `arrow` (mũi tên vòng cam), `cloud` (mây 💭), `sprout` (🌱), `puzzle` (🧩). Tất cả là SVG nhúng.
- **Lời** (tiếng Anh, khi `showText`): đúng ngẫu nhiên một trong "Great job!", "Well done!", "Excellent!", "You got it!", "Super!"; sai: "Nice try!", "Almost! Try again.", "Keep going!", "Not quite. You can do it!".
- **Âm** tổng hợp Web Audio, âm lượng `volume × 0.35`, các nốt nối tiếp (tần số Hz, thời lượng giây):

| Âm | Nốt | Dạng sóng |
|---|---|---|
| `chime` | 880/.12, 1320/.22 | sine |
| `arp` | 523/.08, 659/.08, 784/.08, 1047/.18 | sine |
| `pop` | 600/.05, 900/.09 | sine |
| `bell` | 1175/.3 | sine |
| `soft` | 330/.18, 262/.26 | triangle |
| `bloop` | 392/.1, 294/.22 | triangle |
| `hmm` | 311/.16, 294/.16, 277/.22 | triangle |

- Người dùng đặt giảm chuyển động (`prefers-reduced-motion`) thì không có hiệu ứng phóng.

### 16.4. Quiz (`🎯 Quiz`)

Lớp phủ toàn khung, một câu mỗi lần, chữ lớn (câu 28px, phương án 22px), dùng tốt trên máy chiếu.

1. **Màn tùy chọn**: "{n} câu từ {m} bài. Kết quả không được lưu." Ô chọn: Xáo thứ tự câu (tắt), Cho thử lại khi sai (bật), Hiện đáp án đúng sau khi sai (bật), Hẹn giờ mỗi câu (Không/15/30/60 giây), Tắt tiếng (tắt). Nút `Bắt đầu`.
2. **Màn câu hỏi**: thanh trên `Câu i/n`, thanh tiến độ, đồng hồ (nếu hẹn giờ), `✕ Thoát`. Trên thẻ: "Bài k · tên bài", rồi:
   - `mcq`, `cloze_mcq`, `tfng`, `matching`: lưới 2 cột nút phương án (TF/NG hiện "True", "False", "Not given"; nối hiện cả `rightList`). `cloze_mcq` hiện đoạn văn, ô số đang hỏi tô vàng. `tfng` có mục gập "Xem đoạn văn". Nối có ghi "· Chọn mục nối với".
   - `fill_blank`, `word_form`: ô nhập "Gõ đáp án rồi Enter".
   - `ordering`: "Put the words in order", các ô từ to, câu ghép hiện dưới.
   - `rewrite`, `short_answer`: hiện đề; ghi "Câu mở: không tự chấm. Bấm "Xem đáp án mẫu" để so sánh." và nút `Xem đáp án mẫu`.
   - Thanh dưới: `← Câu trước`, `Kiểm tra` (bật khi đã chọn hoặc gõ), `Câu tiếp →`.
3. **Kiểm tra**: tô phương án chọn xanh hoặc đỏ, phản hồi cỡ lớn. **Lần trả lời đầu** được ghi điểm. Sai và còn được thử lại (tối đa 2 lần) → sau 0.9 giây bỏ chọn để thử lại; hết lượt → hiện đáp án đúng (nếu bật). Hết giờ → tính sai, hiện đáp án, báo "Hết giờ: câu này tính sai."
4. **Tổng kết**: số lớn `x/y` (không tính câu mở), "câu đúng ở lần trả lời đầu tiên · không lưu kết quả", danh sách "Câu cần làm lại" (`Bài k · câu j`) hoặc 🏆 nếu đúng hết; nút `Làm lại câu sai`, `Làm lại từ đầu`.

Phím trong Quiz: `1`–`4` hoặc `A`–`D` chọn phương án; `Enter` kiểm tra rồi sang câu; `←`/`→` câu trước/sau; `Esc` thoát.

## 17. Phím tắt (BẮT BUỘC các phím điều hướng, zoom, đáp án, bút; NÊN phần còn lại)

Phím chỉ có hiệu lực khi không gõ trong ô nhập. Tệp xuất bắt phím toàn trang (`globalKeys`).

| Phím | Việc |
|---|---|
| `←` `→` / `PageUp` `PageDown` | Trang trước, sau (khi phóng một bài: bài trước, sau) |
| `+` `=` / `-` | Phóng to, thu nhỏ |
| `1`…`9` | Tới bài 1…9 |
| `A` | Đáp án toàn phiếu (GV) |
| `Space` / `Shift+Space` | Hiện đáp án câu kế, lùi lại (GV) |
| `P` | Bút (khóa) bật/tắt |
| `E` | Tẩy bật/tắt |
| Giữ `Shift` / `Ctrl` / `Ctrl+Shift` | Đường thẳng / đánh dấu / khung |
| `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y` | Hoàn tác, làm lại nét vẽ |
| `H` `C` `R` `B` `W` `L` `T` `K` | Tự ẩn thanh, che câu, rèm, tối màn, trắng màn, đèn rọi, đồng hồ, bảng trắng |
| `Esc` | Đóng theo thứ tự ưu tiên: bảng nhanh → lớp phủ đang mở (ảnh, video, Quiz, phóng bài, bảng trắng) → menu nổi → chế độ phóng vùng → zoom về 100% → về Con trỏ → thoát Trình chiếu |
| Phím bất kỳ | Khi đang Tối màn hoặc Trắng màn: quay lại |

## 18. Lưu cục bộ (BẮT BUỘC)

- Khóa `localStorage`: `wsv:{code}:v{version}:{kind}`, ví dụ `wsv:WS-0008:v1:teacher`. Mỗi phiếu, mỗi phiên bản, mỗi loại bản lưu riêng; phiên bản mới bắt đầu trắng.
- Giá trị JSON:

```json
{"strokes": {"0": [ {"t":"pen","c":"#E8483B","w":3,"pts":[[120,300],[140,310]]} ], "2": []},
 "notes":   {"ex-orogx5i8q": "Hỏi lại câu 3"},
 "pins":    ["ex-g99hnei8o"],
 "layout":  {"two": true}}
```

  `strokes` theo chỉ số trang (0 là trang 1); `notes` và `pins` theo `id` bài; `layout.two` là chế độ 2 trang.
- Ghi lại sau mỗi thay đổi. Trình duyệt không cho ghi (chế độ riêng tư, `file://` bị chặn) → báo một lần "Trình duyệt không cho lưu: nét vẽ sẽ mất khi đóng trang." và vẫn chạy bình thường.
- Không đồng bộ giữa các máy. Bảng nhanh, bảng trắng, Quiz, Làm trên phiếu **không lưu**.

## 19. Kiểu dáng

### 19.1. Tờ phiếu (giữ như bản in, BẮT BUỘC về tính dễ đọc; giá trị là tham chiếu)

| Thành phần | Giá trị |
|---|---|
| Chữ nội dung | Serif: `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif`, 15.5px, giãn dòng 1.5, màu `#1A2233` |
| Chữ phụ (số câu, nhãn, đáp án, chân trang) | Sans hệ thống: `system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif` |
| Nền trang | Trắng; nền quanh trang `#E9EDF2` |
| Màu chữ phụ | `#4A5466`, `#7A8496`, `#9AA3B2` |
| Đường kẻ | `#D5DBE4`, `#9AA3B2` |
| Nhấn | `#2741B0` |
| Đúng / sai | `#1E8A4C` (chữ đáp án `#0F6B37`) / `#C23A2B` |
| Tô bài đang chọn | Vệt highlight vàng `#FFE36E` dưới tiêu đề |

Tờ phiếu và mọi cửa sổ nổi luôn sáng.

### 19.2. Thanh công cụ

Nút cao 36px (nhỏ 30px), bo 8px, chữ 14px; rê chuột nền `#F1F4F8`; đang bật nền `#1A2233` chữ trắng. Các nhóm ngăn bằng vạch dọc `#E6E9EF`. Toàn bộ màu khai báo bằng biến CSS trên `.wsv` (`--vstage`, `--vbar`, `--vtx`, `--vline`, `--von`…); viewer trong app đổi bộ biến này cho chế độ tối, tệp xuất cố định sáng.

### 19.3. Màn hình hẹp (dưới 768px)

Thanh công cụ một hàng cuộn ngang; nút tối thiểu 44 × 44px; lề trong trang giảm còn 40px 28px.

## 20. Khả năng tiếp cận, cảm ứng, in

- Nút chỉ có biểu tượng phải có `aria-label` (lấy từ `title` nếu thiếu). Thanh công cụ có `role="toolbar"` và `aria-label="Thanh công cụ viewer"`. Trình phát audio có `role="region"`. Ô nhập khi làm bài có `aria-label` ("Câu {id}", "Điền đáp án", "Chọn chữ cái"). Ảnh có `aria-label` từ `alt`. (BẮT BUỘC)
- Biểu tượng trang trí đặt `aria-hidden="true"`.
- Thiết bị cảm ứng (`pointer: coarse`): luôn hiện nút công cụ bài và nút "?" (không dựa vào rê chuột). (BẮT BUỘC)
- Tương phản chữ ≥ 4.5:1 (chữ lớn ≥ 3:1).
- **In** (`@media print`, NÊN): ẩn thanh công cụ, nút công cụ bài, nút "?"; bỏ nền và bóng; mỗi trang A4 một trang in.

## 21. An toàn dữ liệu (BẮT BUỘC)

1. **Escape mọi chuỗi** lấy từ dữ liệu khi chèn vào HTML: `&` `<` `>` `"` `'` thành thực thể. Áp cho tiêu đề, hướng dẫn, đoạn văn, câu, phương án, alt, transcript, tên theme, mã phiếu… Dữ liệu chứa `<script>` phải hiện thành chữ.
2. **Bản học sinh không chứa đáp án** ở bất kỳ đâu trong tệp: không có các khóa `correctId`, `accepted`, `answer`, `correctIdx`, `explanation`, `answerText`, `right` trong `#ws-data` và `#ws-meta`; `qfb` là `null`. Tìm chuỗi đáp án mẫu trong mã nguồn tệp (xem nguồn) không thấy. Không giấu đáp án bằng CSS hay mã hóa: **bỏ hẳn khỏi dữ liệu** khi tạo tệp.
3. Dữ liệu nhúng không chứa `<` thô (mục 4.3).
4. Tệp không gửi dữ liệu ra ngoài, không đọc tệp khác.

Bộ kiểm tra xuất bản của ws-studio chạy 5 mục trước khi cho tải; hệ thống khác NÊN chạy tương tự:

| Mục | Đạt khi |
|---|---|
| Tài nguyên đủ | Mọi media tham chiếu đều có và đã nhúng |
| Cấu trúc hợp lệ | Có ít nhất một bài; mọi bài có `type` và ít nhất một câu |
| Bản học sinh không chứa đáp án | Quét JSON dữ liệu và metadata không thấy khóa đáp án |
| Chuỗi người dùng đã escape | Phần `#ws-data` không có `<` thô |
| Có mã phiếu và phiên bản | `<meta name="ws-id">` đúng mã; có `#ws-meta`; tên tệp đúng mẫu |

## 22. Tiêu chí nghiệm thu

Dùng hai tệp mẫu và dữ liệu `vi-du-du-lieu-*.json` để đối chiếu. Tệp do hệ thống khác tạo **từ cùng dữ liệu** đạt khi:

**Tệp và dữ liệu**
- [ ] Tạo được hai tệp đúng tên; mỗi tệp mở bằng bấm đúp khi tắt mạng, không lỗi console.
- [ ] Có `ws-id`, `ws-version`, `ws-kind`, `#ws-meta`, `#ws-data` đúng nội dung.
- [ ] Bản học sinh: không có khóa đáp án, `qfb` null, không có nhóm Đáp án/Quiz/Làm trên phiếu, không có nút ✓ 📝 ? ở bài và câu; ghi "Bản học sinh" ở thanh công cụ và chân trang.
- [ ] Dữ liệu chứa `<b>x</b>` hiện thành chữ, không thành thẻ.

**Hiển thị**
- [ ] Phiếu WS-0008 ra **4 trang A4** ở cả hai bản (như tệp mẫu), đầu phiếu ở trang 1, chân trang đánh số `i / 4`.
- [ ] Đủ 9 dạng câu hiển thị như mục 6; bố cục L2 (ảnh phải), L3 (đoạn văn trái), L4 (câu hai cột) đúng như ảnh mẫu.
- [ ] Bài đánh dấu giữ trọn không bị cắt ngang trang; bài có `breakBefore` bắt đầu trang mới; tiêu đề bài không nằm một mình cuối trang.

**Tương tác**
- [ ] Chế độ Trang, Cuộn, 2 trang, Trình chiếu (một trang, thanh tự ẩn); ←/→ lật trang; Đi tới trang và bài.
- [ ] Zoom +/−, 100%, vừa ngang, vừa cao, phóng vùng; Esc về.
- [ ] Đáp án câu, bài, toàn phiếu, phím A, Space lần lượt; giải thích.
- [ ] Bấm ảnh mở lớp xem, Esc đóng; audio có tua, tốc độ 0.75×/1×/1.25×, transcript; video mô phỏng có phụ đề.
- [ ] Bút (khóa) vẽ được, lưu và còn sau khi tải lại; Esc về Con trỏ; Shift vẽ đường ngang đỏ; Ctrl+Shift vẽ khung; hoàn tác, làm lại, xóa tất cả và hoàn tác việc xóa.
- [ ] Che câu và hé từng câu; rèm; tối màn và phím bất kỳ quay lại; đèn rọi; đồng hồ; bảng trắng.
- [ ] Ghim bài lên đầu "Đi tới"; phóng to một bài và chuyển bài; ghi chú giáo viên lưu cục bộ.
- [ ] Nháy đúp vùng trống mở bảng nhanh có công cụ Text; Esc đóng.
- [ ] Quiz có màn tùy chọn, "Câu x/y", phản hồi có hình và lời, tổng kết `x/y` không lưu.
- [ ] Làm trên phiếu: chọn đúng tô xanh, sai tô đỏ, bộ đếm `Đúng x/y`; tắt là sạch.

## 23. Ngoài phạm vi và điểm mở

**Không thuộc tệp xuất** (viewer trong app có, hệ thống khác không cần làm):

- Chế độ xem trước thu nhỏ trong trình soạn (`mini`): nút `✎ Sửa` trên bài, nút `⤓ Ngắt trang ở đây`, đồng bộ bài đang chọn.
- Dải cờ "Bản xem trước · chưa duyệt cấp 2" và công tắc "Xem như học sinh".
- Chế độ làm bài cho **Làm bài trên lớp** (D-129, D-131): ô nhập thật trên phiếu, khóa sau khi nộp, tô kết quả do máy chủ chấm. Chạy qua máy chủ máy giáo viên, không có trong tệp tải về.
- Chế độ tối của thanh công cụ.

**Điểm mở** (chưa có trong bản tham chiếu, cần quyết định khi làm):

- Ảnh, audio, video **thật** (tệp nhúng base64 hoặc đường dẫn). Hiện tại media là mô phỏng sinh từ `keyword`, `emoji`, `hue`, `transcript`. Nếu thêm, đề xuất trường `src` (data URI) trong Media và giữ nguyên hành vi lớp xem, trình phát.
- Bản "HTML luyện tập có đáp án" cho học sinh (D-102): tạm dừng.
- Lược đồ JSON hình thức (JSON Schema) cho ViewerData: tài liệu này mô tả bằng bảng; có thể sinh lược đồ từ hai tệp ví dụ.

---

## Phụ lục A. Khung tệp tối thiểu

Bộ khung dưới đây cho thấy luồng tối thiểu: đọc dữ liệu, dựng đầu phiếu, một bài trắc nghiệm, nút đáp án. Không phải bản đầy đủ; dùng để hình dung cách nối dữ liệu với giao diện.

```html
<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Demo · Bản giáo viên</title>
<meta name="ws-id" content="WS-DEMO"><meta name="ws-version" content="1"><meta name="ws-kind" content="teacher">
<script type="application/json" id="ws-meta">{"code":"WS-DEMO","version":1,"kind":"teacher","title":"Demo"}</script>
<style>
  body{margin:0;background:#E9EDF2;font-family:system-ui,sans-serif}
  .page{width:794px;min-height:1123px;margin:24px auto;background:#fff;box-sizing:border-box;padding:56px 64px 60px;
        font:15.5px/1.5 Georgia,serif;color:#1A2233;position:relative}
  .ans{display:none;color:#0F6B37;font:600 12.5px system-ui,sans-serif}
  .show-ans .ans{display:block}
  .show-ans .opt.c{background:#E3F4EA}
</style></head><body>
<button id="t">✓ Đáp án</button><div id="app"></div>
<script type="application/json" id="ws-data">{"meta":{"code":"WS-DEMO","version":1,"kind":"teacher","title":"Demo",
 "lesson":"Level 2 · U1"},"items":[{"id":"e1","type":"mcq","title":"Pick the answer","instruction":"Choose A, B or C.",
 "layout":"L1","passage":"","wordBank":[],"media":[],"questions":[{"id":"q1","stem":"I watch TV in the ___.",
 "options":[{"id":"o0","text":"homework"},{"id":"o1","text":"evening"}],"correctId":"o1"}]}],"qfb":null,"mediaFail":false}</script>
<script>
(function(){
  var d = JSON.parse(document.getElementById('ws-data').textContent);
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var T = d.meta.kind==='teacher', L='ABCDEFGHIJ';
  var h = '<div class="page"><h1>'+esc(d.meta.title)+'</h1><div>'+esc(d.meta.lesson)+' · '+esc(d.meta.code)+' · v'+d.meta.version+'</div>';
  d.items.forEach(function(it,i){
    h += '<section><h2>'+(i+1)+'. '+esc(it.title)+'</h2><i>'+esc(it.instruction)+'</i>';
    it.questions.forEach(function(q,k){
      var ci = T ? q.options.findIndex(function(o){return o.id===q.correctId;}) : -1;
      h += '<div>'+(k+1)+'. '+esc(q.stem).replace(/_{2,}/g,'<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>')+'<div>'+
        q.options.map(function(o,j){ return '<span class="opt'+(j===ci?' c':'')+'"><b>'+L[j]+'</b> '+esc(o.text)+'</span> '; }).join('')+
        '</div>'+(T&&ci>=0?'<div class="ans">Answer: '+L[ci]+' · '+esc(q.options[ci].text)+'</div>':'')+'</div>';
    });
    h += '</section>';
  });
  document.getElementById('app').innerHTML = h+'</div>';
  document.getElementById('t').onclick = function(){ document.getElementById('app').classList.toggle('show-ans'); };
})();
</script></body></html>
```

## Phụ lục B. Ví dụ dữ liệu rút gọn

Một bài từ mỗi nhóm, rút từ `vi-du-du-lieu-giao-vien.json` (bản đầy đủ có 9 bài).

```json
{
  "meta": {"code":"WS-0008","version":1,"kind":"teacher","title":"Showcase · A Day in Space",
    "lesson":"Level 2 · U1 · Lesson 1.1 Daily routines","theme":{"name":"Space Explorers","emoji":"🚀"},
    "pagesTarget":4, "exportedAt":"2026-10-26T09:53:13.468Z","exportedBy":"Nguyễn Thị Lan",
    "scope":{"curriculum":"Explorers English 1","curriculumVersion":"2.1","levelId":"ex1-l2","unitId":"ex1-l2-u1","lessonIds":["ex1-l2-u1-1"]},
    "standards":["STD-MAT@1.0","STD-MCQ@1.2"]},
  "items": [
    {"id":"ex-w6n63oi8m","no":1,"type":"matching","title":"Match the words with Zed","instruction":"Match the words with the pictures.",
     "layout":"L2","passage":"","wordBank":[],
     "media":[{"id":"m-31pozvi8m","kind":"image","keyword":"morning routine","emoji":"⏰","hue":220,"style":0,"alt":"Illustration: morning routine","status":"ok"}],
     "questions":[{"id":"q-ewvvk2i8m","left":"usually","right":"🔁","explanation":"usually: most of the time"},
                  {"id":"q-eeegkai8m","left":"lunch","right":"🍱","explanation":"lunch: food in the middle of the day"}],
     "rightList":["🌆","🔁","🚫","🍱","🏫","🌅"],"breakBefore":false},
    {"id":"ex-orogx5i8q","no":5,"type":"tfng","title":"Reading check with Mia","instruction":"Read the text. Write T (true), F (false) or NG (not given).",
     "layout":"L3","passage":"Mia wakes up at six o'clock. She usually brushes her teeth …","wordBank":[],
     "media":[{"id":"m-01uirsi8r","kind":"audio","title":"Listen and read","transcript":"Mia wakes up at six o'clock. …","voice":"en-GB","rate":1,"speakers":[],"duration":25,"status":"ok"}],
     "questions":[{"id":"q-jy43pki8q","statement":"Mia wakes up at six o'clock.","answer":"T","explanation":"The text says this."}],
     "breakBefore":false},
    {"id":"ex-8s8jvji8s","no":6,"type":"cloze_mcq","title":"Complete the text with Bolt","instruction":"Read the text and choose the correct word for each gap.",
     "layout":"L3","passage":"… has {1} at half past six. … She has {2} at school. …","wordBank":[],"media":[],
     "questions":[{"id":"q-crx4msi8s","n":1,"options":["breakfast","teeth","school"],"correctIdx":0,"explanation":"Gap 1: \"breakfast\"."}],
     "breakBefore":false},
    {"id":"ex-gta3xni8t","no":8,"type":"rewrite","title":"Sentence transformation with Mia","instruction":"Rewrite the sentences. Begin with the words given.",
     "layout":"L1","passage":"","wordBank":[],
     "media":[{"id":"m-qxtehbi8t","kind":"video","title":"A morning on the space station","caption":"Zed wakes up, brushes his teeth and has breakfast with Mia.","duration":24,"hue":19,"status":"ok"}],
     "questions":[{"id":"q-4h9mmoi8t","original":"We have breakfast at seven.","lead":"He","accepted":["He has breakfast at seven."]}],
     "breakBefore":false}
  ],
  "qfb": {"correct":{"img":{"star":true,"check":true},"snd":{"chime":true}},"wrong":{"img":{"arrow":true},"snd":{"soft":true}},"volume":0.6,"showText":true},
  "mediaFail": false
}
```

Cùng bài T/F/NG ở bản học sinh (đáp án và giải thích đã bỏ):

```json
{"id":"q-jy43pki8q","statement":"Mia wakes up at six o'clock."}
```

## Phụ lục C. Ánh xạ sang mã nguồn tham chiếu

| Nội dung | Vị trí trong repo |
|---|---|
| Dựng ViewerData từ phiếu, bỏ khóa đáp án ở bản HS | `src/domain/export.js` (`EX.itemView`, `EX.viewerData`) |
| Dựng tệp HTML, mã hóa JSON, tên tệp, bộ kiểm tra xuất bản | `src/domain/export.js` (`EX.build`, `EX.jsonForScript`, `EX.fileName`, `EX.checks`) |
| Hiển thị câu theo dạng | `src/viewer/viewer.js` (`qHTML`, `blankify`, `passageHTML`, `mediaHTML`) |
| Bố cục hiệu lực, đơn vị đo | `WSV.effLayout`, `WSV.blockUnits` |
| Dàn trang, giữ trọn, tách L3, tự thu gọn | `WSV.paginate`, `WSV.keepOf`, `WSV.layoutPages` |
| Đầu phiếu, chân trang | `WSV.sheetHead`, `WSV.pageHTML` |
| Viewer: thanh công cụ, chế độ, zoom, vẽ, trình bày, Quiz, phím | `WSV.mount` |
| Ảnh, video, âm, hình phản hồi | `WSV.svgImage`, `WSV.videoScene`, `WSV.fbSound`, `FB_IMG`, `WSV.FB_TEXT` |
| Icon SVG thanh công cụ | `IC`, `GLYPH`, `WSV.iconize` |
| Kiểu dáng | `src/viewer/viewer.css` |
| Kiểm thử tự động của tệp xuất | `tests/t5_viewer.py` |
| Tạo lại tệp mẫu của tài liệu này | `tools/tao_mau_html.py` |
