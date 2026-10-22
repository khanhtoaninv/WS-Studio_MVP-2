---
name: giao-dien-content-matrix
description: Hệ giao diện rút từ app Content Matrix (token màu, chữ, khoảng cách, nút, thẻ, popup, khóa, dark mode) để dựng hoặc sửa giao diện web khác cho đồng bộ.
---

# Hệ giao diện Content Matrix cho web khác

Dùng khi dựng mới hoặc sửa giao diện một web/app mà người dùng muốn "giống Content Matrix": gọn, sáng sủa, nhiều dữ liệu, tiếng Việt, chạy tốt cả sáng/tối và điện thoại. Lấy đúng token và quy tắc dưới đây, không tự chế màu hay cỡ chữ mới.

## Quy tắc bắt buộc
1. **Không bao giờ dùng ký tự/icon "✦"** ở bất kỳ đâu (nút, nhãn, tiêu đề, placeholder, toast). Cũng không thay bằng sao lấp lánh khác cho "AI". Nút AI chỉ ghi chữ (vd. "Gen AI", "Viết bằng AI").
2. Mọi màu, cỡ chữ, bo góc, bóng đi qua biến CSS ở `:root`. Không viết mã màu trực tiếp trong thành phần.
3. Chữ giao diện tiếng Việt, nhãn ngắn; phần phụ để trong ngoặc: "Cột (đề xuất)". Không viết hoa toàn bộ trừ `.eyebrow`.
4. Icon là SVG nét (stroke 1.8, `currentColor`, 16–18px), có `aria-hidden="true"`; nút chỉ có icon phải có `aria-label`. Không dùng emoji làm icon.
5. Có đủ dark mode (tự theo hệ thống + ép bằng `data-theme`), có `:focus-visible`, tôn trọng `prefers-reduced-motion`.

## Token (dán nguyên khối)
```css
:root {
  --bg: #f2f4f6; --surface: #ffffff; --surface-2: #e8ecf0; --line: #d3dae2; --line-strong: #9eabb9;
  --ink: #16202a; --ink-2: #4a5765; --ink-3: #6f7c8a;
  --accent: #2741b0; --accent-soft: #e4e8fa; --accent-ink: #ffffff;
  --mark: #f3c24c; --mark-soft: #fdf1cf; --mark-ink: #3a2a00;
  --warn: #8a4b00; --warn-soft: #fff1d9; --bad: #b42318; --bad-soft: #fde8e6; --good: #1d6f48; --good-soft: #e1f3e9;
  --f-body: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --f-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --fs-1: 12px; --fs-2: 13px; --fs-3: 14px; --fs-4: 15px; --fs-5: 18px; --fs-6: 22px; --fs-7: 28px;
  --r-s: 6px; --r-m: 10px;
  --shadow: 0 1px 2px rgb(16 24 40 / 6%), 0 4px 16px rgb(16 24 40 / 6%);
}
/* Tối: khối giá trị giống hệt nhau ở hai chỗ */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* DARK */ } }
:root[data-theme="dark"] { /* DARK */ }
/* DARK =
  --bg: #11161c; --surface: #19212a; --surface-2: #222c37; --line: #2f3b48; --line-strong: #5a6a7b;
  --ink: #e6ebf0; --ink-2: #b0bccb; --ink-3: #8f9cab;
  --accent: #8ea2ff; --accent-soft: #232c52; --accent-ink: #0d1330;
  --mark: #f3c24c; --mark-soft: #3a2f12; --mark-ink: #fff3cf;
  --warn: #ffc56b; --warn-soft: #3a2a10; --bad: #ff8f84; --bad-soft: #3e1a17; --good: #7fd6a6; --good-soft: #15352a;
  --shadow: 0 1px 2px rgb(0 0 0 / 40%), 0 6px 20px rgb(0 0 0 / 30%);
  color-scheme: dark; */
```
Font nạp từ Google Fonts: `Be Vietnam Pro` (400/500/600/700) và `IBM Plex Mono` (400/500).

### Ý nghĩa màu
- `--accent` (xanh chàm): hành động chính, mục đang chọn, liên kết, focus, trạng thái "Đã duyệt".
- `--mark` (vàng): **việc cần làm tiếp / cần xử lý**, ngày hôm nay. Chỉ một vùng nổi vàng mỗi màn.
- `--good` xong/đã đăng, `--warn` cảnh báo, `--bad` lỗi/xóa. Mỗi màu có bản `-soft` làm nền nhãn; chữ dùng màu đậm trên nền soft.
- `--ink` / `--ink-2` / `--ink-3`: chữ chính / phụ (`.muted`) / mờ (`.faint`, gợi ý).
- Màu kênh/nhãn riêng (nếu có) thêm token `--ch-*`, có bản tối sáng hơn.

## Chữ
- Một font cho cả chữ và tiêu đề; mono chỉ cho ô sửa mã/Markdown. Số, giờ dùng `font-variant-numeric: tabular-nums`.
- Thân 14px (`--fs-3`), `line-height: 1.5`. h1 28 / h2 22 / h3 15 (600). Tiêu đề 700, `letter-spacing: -0.01em`, `text-wrap: balance`.
- Nhãn nhỏ 12px; nhãn trường 12px đậm 600 màu `--ink-2`; `.eyebrow` 12px viết hoa, giãn 0.08em, màu `--ink-3`.
- Điện thoại (≤760px): h1 xuống 22px.

## Khoảng cách và bố cục
- Bậc dùng: 4, 6, 8, 10, 12, 14, 16, 20, 24px. Giữa các khối lớn 20px; trong panel 12px; giữa nút 8px.
- Khung app: thanh bên 220px + vùng chính; thanh trên dính (`position: sticky`) nền `color-mix(var(--bg) 88%, transparent)` + `backdrop-filter: blur(8px)`. Lề vùng chính 20px 24px.
- Dùng `grid` với `minmax(0, 1fr)` và `min-width: 0` để chữ dài không làm vỡ cột.
- Mốc responsive: 1100 (bỏ cột phụ), 900 (bảng/lịch thành danh sách thẻ), 760 (ẩn thanh bên, hiện tab bar dưới đáy 56px, lề 16px, có `env(safe-area-inset-*)`). Không có cuộn ngang trang; bảng rộng nằm trong `.tbl-wrap { overflow-x: auto }`.
- Vùng bấm tối thiểu 36px (desktop), 44px (điện thoại).

### Phân cấp thị giác ba tầng
1. **Tập trung** `.focus`: "việc tiếp theo", viền vàng, vạch trái 6px `--mark`, bóng đậm hơn, nút chính to (44px). Chỉ một khối mỗi màn.
2. **Vùng làm việc** `.work`: bảng/lịch chính, nền `--surface`, viền `--line`, `--shadow`, thanh công cụ nằm trong.
3. **Phần phụ** `.panel.quiet`: nền trong suốt, viền nét đứt, tiêu đề nhỏ màu `--ink-2`.

Người dùng thích: **section có số tròn + tiêu đề, đặt trên nền xám nhạt** (`--surface-2`) để các section trắng nổi lên; các section rộng bằng nhau; mỗi khối một khung, không lồng khung trong khung.

## Thành phần
```css
.btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:36px; padding:6px 14px;
  border-radius:var(--r-s); border:1px solid var(--line); background:var(--surface); font-weight:500; cursor:pointer; white-space:nowrap; }
.btn:hover { border-color: var(--line-strong); }
.btn.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); font-weight:600; }
.btn.primary:hover { filter: brightness(1.08); }
.btn.ghost { border-color:transparent; background:none; } .btn.ghost:hover { background:var(--surface-2); }
.btn.danger { color: var(--bad); }
.btn.sm { min-height:30px; padding:3px 10px; font-size:var(--fs-2); }
.btn.icon { width:36px; padding:0; }
.btn:disabled { opacity:.5; cursor:not-allowed; }

.panel { background:var(--surface); border:1px solid var(--line); border-radius:var(--r-m); padding:16px; }
.sec { display:grid; gap:12px; padding:14px 16px; border:1px solid var(--line-strong); border-radius:var(--r-m); background:var(--surface); }
.sec-n { display:inline-grid; place-items:center; width:20px; height:20px; border-radius:50%;
  background:var(--accent); color:var(--accent-ink); font-size:var(--fs-1); font-weight:700; }

.st { display:inline-flex; align-items:center; gap:3px; font-size:var(--fs-1); font-weight:500; padding:0 6px; border-radius:999px; }
.st-need{background:var(--warn-soft);color:var(--warn)} .st-ok{background:var(--accent-soft);color:var(--accent)}
.st-done{background:var(--good-soft);color:var(--good)} .st-bad{background:var(--bad-soft);color:var(--bad)}
.st-off{background:var(--surface-2);color:var(--ink-2)}

.note { padding:10px 12px; border-radius:var(--r-s); background:var(--surface-2); color:var(--ink-2); font-size:var(--fs-2); }
.note.warn{background:var(--warn-soft);color:var(--warn)} .note.bad{background:var(--bad-soft);color:var(--bad)} .note.good{background:var(--good-soft);color:var(--good)}
.empty { padding:28px 16px; text-align:center; color:var(--ink-2); border:1px dashed var(--line-strong); border-radius:var(--r-m); }

.field { display:grid; gap:4px; } .field > label { font-size:var(--fs-1); font-weight:600; color:var(--ink-2); }
.field input, .field select, .field textarea { min-height:38px; padding:7px 10px; border:1px solid var(--line); border-radius:var(--r-s); background:var(--surface); width:100%; }
.field .hint { font-size:var(--fs-1); color:var(--ink-3); } .field .err { font-size:var(--fs-1); color:var(--bad); }

.tabs button { border:0; background:none; padding:10px 14px; min-height:44px; color:var(--ink-2); border-bottom:2px solid transparent; }
.tabs button[aria-selected="true"] { color:var(--ink); border-bottom-color:var(--accent); font-weight:600; }
.seg button[aria-pressed="true"] { background:var(--ink); color:var(--bg); font-weight:600; } /* nút chọn nhóm */
```
- **Nút**: mỗi vùng tối đa một `.primary`. Thứ tự hành động: phụ bên trái, chính bên phải; xóa dùng `.ghost.danger` đặt riêng bên trái chân hộp.
- **Thẻ danh sách cần xử lý**: vạch trái 3px — `--mark` = cần làm, `--good` = xong (thẻ xong có thể mờ `opacity:.72`). Không đổi cả viền sang màu cảnh báo.
- **Popup** (`.dialog`): giữa màn, `width: min(480px, calc(100% - 32px))` (rộng: 640/820/980px), `max-height: calc(100% - 48px)`, cuộn bên trong, padding 20px, gap 14px, nền `--surface`, `--shadow`; nền che `rgb(10 16 24 / 42%)`. Chân hộp `.actions` căn phải, gap 8px, cho xuống dòng. Popup xem/sửa nhiều phần có thể nền `--surface-2` với các section trắng.
- **Ngăn bên** (`.drawer`): bên phải, `width: min(560px, 100%)`, header có viền dưới; trượt vào 0.18s.
- **Toast**: đáy giữa, nền `--ink` chữ `--bg`, 13px; lỗi nền `--bad`; có thể kèm nút "Hoàn tác" viền `currentColor`.
- **Bảng**: chữ 13px, ô padding 8px, viền dưới `--line`, đầu bảng 12px đậm nền `--surface-2`.
- **Số liệu (KPI)**: ô nền `--surface-2`, số 28px tabular, nhãn 12px `--ink-2`.
- **Highlight trong chữ**: `mark` nền `--mark-soft` + gạch chân trong 2px `--mark`.

## Trạng thái khóa, mờ, chỉ xem
- Icon ổ khóa phản ánh **trạng thái hiện tại**: khóa đóng = đang khóa, khóa mở = đang mở. Bấm để đổi. Kèm `title` giải thích ("Đã duyệt nên đang khóa. Mở khóa để sửa.").
- Khi một khâu bị khóa: vùng đó **chỉ xem**, nút sửa vẫn hiện nhưng mờ (`disabled`, `opacity .35–.5`, `cursor: not-allowed`) — không ẩn đi, để người dùng biết chức năng ở đâu. Thao tác không làm thay đổi nội dung (xem, xuất, tải về) vẫn bật.
- Bước sau chưa mở được vì bước trước chưa xong: tab/nút mờ (`opacity .45`) + `title` nói cần làm gì.
- `label.btn` (nút tải tệp) không có `disabled`, dùng class `.disabled { opacity:.45; pointer-events:none }`.
- Nút "Duyệt" đã duyệt: nền `--surface-2`, chữ `--ink-3`, không còn hover.
- Cảnh báo không chặn thao tác trừ khi thật sự bắt buộc: hiện `.note.warn` hoặc nhãn `.st-need`, để người dùng tự quyết.

## Chuyển động và truy cập
- Chuyển động ngắn (0.18s ease-out), chỉ trong `@media (prefers-reduced-motion: no-preference)`; nhấp nháy/xoay tắt khi `reduce`.
- `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`.
- Thiết bị cảm ứng (`@media (hover: none)`): nút chỉ hiện khi rê chuột phải hiện sẵn.
- Chữ cho trình đọc màn hình: `.sr` (ẩn trực quan).

## Cách làm khi áp dụng cho web mới
1. Dán khối token (cả bản tối) và nạp font; đặt `body { background: var(--bg); color: var(--ink); font: var(--fs-3)/1.5 var(--f-body); }`.
2. Xác định trên mỗi màn: một khối Tập trung (nếu có việc tiếp theo), một Vùng làm việc, phần phụ quiet.
3. Dựng bằng các lớp ở trên; chỉ thêm token mới khi web có khái niệm riêng (vd. màu kênh), và luôn kèm bản tối.
4. Kiểm tra trước khi giao: sáng + tối, 375px và 1280px, không cuộn ngang, nút ≥36/44px, không có "✦", không có mã màu viết thẳng ngoài `:root`.
