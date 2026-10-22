# ws-studio v2

Soạn, kiểm tra tiêu chuẩn, duyệt và xuất phiếu bài tập. Giao diện tiếng Việt, nội dung phiếu tiếng Anh.

Đặc tả: [`docs/ws-studio-mvp-spec.md`](docs/ws-studio-mvp-spec.md).

Bản v2 giữ nguyên chức năng của prototype (259 kiểm tra t1–t8 vẫn đạt) nhưng đổi cấu trúc để:

1. **Clone về là chạy được với Claude API thật**: sinh bài, tự sửa theo bộ kiểm tra, tạo lại câu và bài.
2. **Sẵn sàng chuyển sang React**: chỉ thư mục `src/ui/` phải viết lại; lõi, store và dịch vụ dùng lại nguyên.

## Chạy nhanh trên Windows

Tải [`chay.bat`](chay.bat) về máy (ví dụ để ở Desktop) rồi bấm đúp. Cửa sổ luôn ở lại để đọc thông báo và lỗi; nếu nó báo lỗi, chụp màn hình gửi lại. Mỗi lần mở, tệp này tự lấy bản mới nhất từ GitHub vào `%USERPROFILE%\WS-Studio_MVP-2`, cài thư viện khi cần, rồi mở app trong trình duyệt. Lần đầu nó hỏi `ANTHROPIC_API_KEY` (bấm Enter để bỏ qua và dùng AI giả lập) và lưu vào `.env` trong thư mục đó.

Cần [Git for Windows](https://git-scm.com/download/win) (`winget install Git.Git`). Có thêm Node.js 20+ (`winget install OpenJS.NodeJS.LTS`) thì app chạy với Claude; không có Node thì mở bản một tệp với AI giả lập. Thư mục cài do `chay.bat` quản lý: sửa tay trong đó sẽ bị ghi đè ở lần chạy sau, còn `.env` được giữ.

## Chạy trên máy

Cần Node 20.12 trở lên.

```bash
git clone <repo> ws-studio && cd ws-studio
npm install
cp .env.example .env        # điền ANTHROPIC_API_KEY
npm run dev                 # http://localhost:5173, sửa mã là thấy ngay
```

| Lệnh | Việc |
|---|---|
| `npm run dev` | Máy chủ nhỏ + Vite, tự khởi động lại khi mã máy chủ đổi. Có khóa thì AI là Claude, không có thì AI giả lập |
| `npm run build` | Dựng `dist/ws-studio.html`: một tệp tự đủ, bấm đúp mở bằng `file://`, luôn chạy AI giả lập. `dist/` được đưa lên git để `chay.bat` chạy ngay không cần dựng, nên nhớ dựng lại trước khi commit |
| `npm start` | Dựng rồi chạy bản dựng qua máy chủ (có Claude) |
| `npm test` | Dựng rồi chạy 259 kiểm tra t1–t8 (cần `pip install playwright` và Chromium; đặt `WS_CHROME` nếu dùng trình duyệt riêng) |
| `npm run test:server` | Kiểm thử máy chủ, dịch vụ Claude (với Claude API giả, không tốn tiền) và Làm bài trên lớp |

Nguồn AI đang dùng hiện ở **Cài đặt → Nguồn AI**. Khi Claude lỗi (mạng, hết hạn mức, từ chối), lệnh đó tự chạy bằng AI giả lập và app báo bằng thông báo đỏ.

Cấu hình trong `.env`: `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` (mặc định `claude-opus-5-5`), `CLAUDE_EFFORT` (mặc định `medium`), `PORT`, `VITE_AI_MODE=mock` để ép dùng giả lập.

## Làm bài trên lớp

Mở phiếu đã duyệt ở bản giáo viên, bấm **Làm bài trên lớp**, rồi **Bắt đầu phiên**. Màn hình hiện mã phiên 4 ký tự và địa chỉ cho học sinh (dạng `http://<máy giáo viên>:5173/lop?ma=XXXX`). Học sinh cùng Wi-Fi mở địa chỉ đó trên điện thoại hoặc máy tính, nhập tên, nhận mã cá nhân để vào lại nếu lỡ thoát. Bài làm tự lưu, nộp rồi không sửa được.

Giáo viên thấy danh sách học sinh tự cập nhật, bấm vào từng em để xem bài từng câu kèm đáp án. Bảng xếp hạng, biểu đồ tỷ lệ đúng theo bài và các câu sai nhiều nhất cập nhật liên tục; **Kết thúc và tổng kết** khóa phiên, **Xuất ảnh báo cáo** tải một ảnh PNG.

- Chỉ chạy khi mở app qua máy chủ (`chay.bat`, `npm run dev`, `npm start`), không chạy khi mở tệp HTML bằng `file://`.
- Đáp án chỉ nằm trên máy chủ; đề gửi cho học sinh không có đáp án, máy chủ chấm.
- Kết quả lưu tạm trong bộ nhớ máy chủ: đóng cửa sổ máy chủ là mất. Nên xuất ảnh báo cáo trước khi tắt.
- Lần đầu trên Windows, tường lửa hỏi cho phép Node.js: chọn cho phép. Một số Wi-Fi trường chặn các máy nói chuyện với nhau; khi đó phát Wi-Fi từ điện thoại giáo viên.
- Mã: `server/classroom.js` (phiên, API), `server/student.html` (trang học sinh), `src/shared/classroom.js` (tách đề/đáp án, chấm, thống kê), `src/ui/views/classroom.js` (màn giáo viên), `src/services/classroom/http.js` (thay khi có backend).

## Số phiên bản

Mỗi lần cập nhật tăng `VERSION` trong `src/version.js` thêm 1 và ghi một dòng vào `NOTE`. Số này hiện ở chân thanh bên, ngay dưới "Nạp dữ liệu mẫu" và "Reset", để biết đang chạy bản nào. Máy chủ cũng báo phiên bản của nó qua `/api/health` (và in ở dòng đầu cửa sổ máy chủ); nếu khác phiên bản trang, chân thanh bên hiện thêm "máy chủ bản X" màu đỏ: đóng mọi cửa sổ máy chủ (hoặc `taskkill /F /IM node.exe`) rồi chạy lại.

## Cấu trúc

```
server/                 Máy chủ Node nhỏ: giữ khóa API, /api/health, /api/ai/{generate,fix,variants}
  index.js              HTTP + Vite (dev) hoặc phục vụ dist (start)
  claude.js             Lời nhắc và lệnh gọi Claude, ép JSON theo lược đồ loại bài
src/
  main.js               Điểm vào: import theo thứ tự lớp, hỏi máy chủ, khởi động
  ws.js                 Không gian tên chung WS (window.WS cho bảng demo và kiểm thử)
  shared/ai-contract.js Lược đồ JSON từng loại bài, đổi qua lại dạng Claude ↔ dạng app (dùng chung với server)
  domain/               Lõi nghiệp vụ, JS thuần, không chạm DOM
    data.js             Giáo trình, theme, tiêu chuẩn, bố cục, người dùng mẫu
    validator.js        Bộ kiểm tra V01–V17, điểm 6 tiêu chí
    rules.js            Quyền, máy trạng thái bài/phiếu, khóa mềm, tiến độ lesson
    importers.js        Nhập giáo trình Markdown, kiểm tệp lesson
    seed.js             Dữ liệu mẫu
    export.js           Dựng tệp HTML xuất (giáo viên / học sinh), kiểm tra xuất bản
  state/
    store.js            Tiện ích U, store S, tra cứu Q, nhật ký
    actions.js          Mọi thay đổi trạng thái (A.*)
  services/             Mọi thứ có thể thay bằng hệ thống thật
    index.js            Chọn bản cài đặt, tự quay về giả lập khi lỗi
    ai/index.js         Giao diện AI bất đồng bộ + bản giả lập
    ai/mock.js          AI giả lập, ước tính chiều cao, dàn khối, media giả lập
    ai/claude.js        AI gọi Claude qua máy chủ
    storage/local.js    Lưu localStorage
    publish/mock.js     Đẩy sang hệ thống chuyên dụng (giả lập)
  viewer/               Viewer dùng chung cho app và tệp xuất (script cổ điển, nhúng nguyên văn)
  ui/                   Giao diện hiện tại (chuỗi HTML). Lớp duy nhất phải viết lại khi lên React
    ui.js, app.js, views/*.js, styles/*.css
tests/                  t1–t8 (Playwright, chạy trên dist/ws-studio.html), e2e/ cho máy chủ
tools/fetch_fonts.py    Tạo lại font nhúng
```

Luật phụ thuộc: `domain/` không gọi giao diện; `ui/` đọc store và gọi `A.*` hoặc `WS.services.*`; chỉ `services/` được gọi mạng hoặc lưu trữ. Ngoại lệ còn lại: vài hành động trong `state/actions.js` tự mở hộp xác nhận (`WS.UI.confirm/modal/prompt`), xem bước 5 bên dưới.

## Lộ trình sang React

1. Dựng `src/ui-react/` bằng Vite React, dùng chung `domain/`, `state/`, `services/`, `viewer/`.
2. Bọc store thành hook: `useStore(selector)` dựa trên `S.on()` và `useSyncExternalStore`.
3. Chuyển từng màn hình (gợi ý thứ tự: Cài đặt, Kho bài, Duyệt, Dashboard, Soạn phiếu, Trình soạn). Hai bản giao diện chạy song song theo route cho tới khi xong.
4. Giữ t1–t8: các kiểm thử bám tên lớp CSS và `WS.*`, nên màn hình React giữ tên lớp và `data-*` cũ.
5. Việc còn lại trước khi lên React: chuyển các hộp xác nhận trong `state/actions.js` lên `ui/` (hành động chỉ nhận kết quả đã xác nhận); tách `U.download` (đang chạm DOM) khỏi `state/store.js`; đổi dần `WS.*` sang `import`/`export` có tên.
