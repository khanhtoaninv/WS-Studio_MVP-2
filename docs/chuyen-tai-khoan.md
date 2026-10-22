# Tiếp tục ws-studio bằng tài khoản khác

Mọi thứ cần để làm tiếp đều nằm trong repo này: mã nguồn, đặc tả (`docs/ws-studio-mvp-spec.md`), README, `chay.bat`, quy tắc làm việc cho Claude (`CLAUDE.md`) và tài liệu tham khảo (`docs/tham-khao/`). Chỉ có **khóa API** là không nằm trên git; bạn nhập lại ở bước 5.

Trong hướng dẫn này, **tài khoản cũ** là tài khoản GitHub `khanhtoaninv` đang giữ repo `WS-Studio_MVP-2`, **tài khoản mới** là tài khoản GitHub và Claude bạn muốn dùng từ nay.

---

## Bước 1. Cho tài khoản GitHub mới quyền vào repo

Chọn **một** trong ba cách.

### Cách A (khuyên dùng): thêm tài khoản mới làm cộng tác viên

Repo vẫn ở tài khoản cũ, cả hai tài khoản đều đẩy được. Không phải sửa gì trong mã.

1. Đăng nhập GitHub bằng **tài khoản cũ**, mở `https://github.com/khanhtoaninv/WS-Studio_MVP-2`.
2. **Settings** → **Collaborators** (hoặc **Collaborators and teams**) → **Add people**.
3. Nhập tên đăng nhập hoặc email của **tài khoản mới** → **Add**.
4. Đăng nhập GitHub bằng **tài khoản mới**, mở email mời (hoặc `https://github.com/notifications`) → **Accept invitation**.

### Cách B: chuyển hẳn repo sang tài khoản mới

Repo thuộc về tài khoản mới; tài khoản cũ mất quyền (trừ khi được thêm lại làm cộng tác viên).

1. Bằng **tài khoản cũ**: repo → **Settings** → cuối trang **Danger Zone** → **Transfer ownership**.
2. Nhập tên tài khoản mới, gõ tên repo để xác nhận → **I understand, transfer this repository**.
3. Bằng **tài khoản mới**: chấp nhận yêu cầu chuyển trong email.
4. Địa chỉ mới là `https://github.com/<tài-khoản-mới>/WS-Studio_MVP-2`. GitHub tự chuyển hướng từ địa chỉ cũ, nhưng nên sửa cho đúng: xem **Bước 6**.

### Cách C: sao một bản riêng (fork) sang tài khoản mới

Dùng khi muốn tách hẳn, repo cũ giữ nguyên.

1. Tài khoản mới cần quyền đọc repo cũ (repo công khai, hoặc làm Cách A trước).
2. Bằng **tài khoản mới**: mở repo → **Fork** → chọn tài khoản mới → **Create fork**. Nhớ bỏ chọn "Copy the main branch only" nếu muốn giữ mọi nhánh (thường không cần).
3. Sửa địa chỉ repo trong `chay.bat`: xem **Bước 6**.

> Muốn repo mới không còn dính tới repo cũ (không hiện "forked from"): trên GitHub chọn **New repository** → **Import a repository**, dán địa chỉ repo cũ.

---

## Bước 2. Tạo project Claude mới và kết nối GitHub

1. Đăng nhập `https://claude.ai` bằng **tài khoản Claude mới**.
2. Mở `https://claude.ai/connect-github`, đăng nhập bằng **tài khoản GitHub mới** và cho phép.
3. Nếu được hỏi cài **Claude GitHub App**: chọn tài khoản giữ repo và chọn repo `WS-Studio_MVP-2`.
   - Cách A: repo vẫn thuộc tài khoản cũ, nên ứng dụng phải được cài trên **tài khoản cũ**. Nếu không cài được từ tài khoản mới, đăng nhập GitHub bằng tài khoản cũ và cài tại `https://github.com/apps/claude/installations/select_target` (chọn `khanhtoaninv` → Only select repositories → `WS-Studio_MVP-2`).
   - Cách B và C: cài trên tài khoản mới.
4. Tạo project mới trong Claude Code (ví dụ tên `WS-Studio_MVP2`).
5. Mở **Project settings** → **Resources** (Repositories) → thêm repo `WS-Studio_MVP-2`.

## Bước 3. Dán chỉ dẫn cho project mới

Mở **Project settings** → phần chỉ dẫn (Instructions) của project, dán nguyên khối dưới đây (đổi địa chỉ repo nếu đã làm Cách B hoặc C):

```
Dự án ws-studio: app soạn phiếu bài tập. Chỉ soạn, kiểm tra tiêu chuẩn, duyệt, xuất file; không giao bài, không chấm điểm.
Ưu tiên: thao tác soạn mạnh, bài bám tiêu chuẩn. UI tiếng Việt, nội dung phiếu tiếng Anh.

Hiện trạng: mã nguồn chính là v2 (Node + Vite, chia lớp domain / state / services / viewer / ui) tại repo GitHub khanhtoaninv/WS-Studio_MVP-2, nhánh main. AI sinh bài chọn ở Cấu hình hệ thống > API (AI giả lập, Claude, OpenAI, Gemini, DeepSeek), lỗi thì quay về AI giả lập. Mục tiêu tiếp theo: chuyển giao diện sang React, chỉ viết lại src/ui/. Bản cũ v1 ở docs/tham-khao/ws-studio-v1.zip để đối chiếu.

Quy tắc làm việc:
- Đọc CLAUDE.md, docs/ws-studio-mvp-spec.md và README.md trong repo trước khi trả lời.
- Mỗi quyết định mới ghi mã D-xx (tiếp từ số lớn nhất ở mục 19A của đặc tả), cuối thread tóm tắt và cập nhật đặc tả trong repo.
- Giữ mọi kiểm tra t1–t9 (npm test) và kiểm thử máy chủ (npm run test:server) đạt trước khi đẩy.
- Sau mỗi lần cập nhật, tự commit và đẩy các file liên quan lên git. Không làm artifact.
- chay.bat ở gốc repo tải bản mới nhất và mở app trên Windows.
```

Repo đã có `CLAUDE.md` với cùng các quy tắc, nên dù quên bước này Claude vẫn đọc được khi mở repo.

## Bước 4. Câu đầu tiên gửi Claude ở project mới

Dán câu này vào project chat:

> Đây là dự án ws-studio chuyển từ tài khoản cũ sang. Hãy đọc CLAUDE.md, docs/ws-studio-mvp-spec.md (nhất là mục 19A và 21) và README.md trong repo, chạy npm test và npm run test:server để chắc mọi thứ đạt, rồi tóm tắt cho tôi hiện trạng, quyết định D-xx mới nhất và việc nên làm tiếp.

Từ đó giao việc như bình thường. Claude ở project mới không nhớ các cuộc trò chuyện cũ; mọi điều đã chốt phải nằm trong đặc tả. Nếu có điều gì chỉ nói trong chat cũ mà chưa ghi vào đặc tả, hãy nhắc lại cho Claude.

## Bước 5. Chạy app trên máy Windows

1. Cài Git và Node.js nếu máy chưa có (mở PowerShell):
   ```
   winget install Git.Git
   winget install OpenJS.NodeJS.LTS
   ```
2. Lấy `chay.bat`: mở repo trên GitHub → `chay.bat` → nút **Download raw file**, lưu ra Desktop. Nếu đã làm Cách B hoặc C, làm Bước 6 trước.
3. Bấm đúp `chay.bat`. Lần đầu:
   - Git có thể mở trình duyệt để đăng nhập GitHub: đăng nhập **tài khoản mới** (tài khoản có quyền vào repo).
   - Nó hỏi `ANTHROPIC_API_KEY`: dán khóa hoặc bấm Enter để bỏ qua.
4. App mở ở `http://localhost:5173/`. Vào **Cấu hình hệ thống** → tab **API**: chọn nhà cung cấp (Claude, OpenAI, Gemini, DeepSeek), dán khóa, bấm **Kiểm tra kết nối** rồi **Lưu**. Dùng ngay, không cần chạy lại.

Khóa nằm ở đâu:

| Nơi | Có trên git? | Ghi chú |
|---|---|---|
| `%USERPROFILE%\WS-Studio_MVP-2\.env` | Không | Do `chay.bat` tạo; mẫu ở `.env.example` |
| `%USERPROFILE%\WS-Studio_MVP-2\data\ai-settings.json` | Không | Do tab API tạo; thắng `.env` |

Muốn mang khóa từ máy cũ sang: chép hai tệp trên sang đúng chỗ ở máy mới. Nếu khóa gắn với tài khoản Claude/Anthropic cũ mà bạn không muốn dùng nữa, tạo khóa mới ở `https://platform.claude.com` bằng tài khoản mới và nhập lại ở tab API.

Dữ liệu soạn trong app (phiếu, bài, kho bài) lưu trong trình duyệt (`localStorage`), **không** nằm trên git. Đổi máy hoặc đổi trình duyệt thì dữ liệu cũ không đi theo; dùng **Nạp dữ liệu mẫu** để có dữ liệu thử.

## Bước 6. Chỉ khi đã chuyển hoặc fork repo (Cách B, C)

1. Mở `chay.bat` trên GitHub (repo mới) → biểu tượng bút chì, sửa dòng:
   ```
   set "REPO=https://github.com/khanhtoaninv/WS-Studio_MVP-2.git"
   ```
   thành địa chỉ repo mới, ví dụ `https://github.com/<tài-khoản-mới>/WS-Studio_MVP-2.git` → **Commit changes**. (Hoặc nhờ Claude ở project mới sửa và đẩy.)
2. Tải lại `chay.bat` về Desktop (thay tệp cũ).
3. Lần chạy sau, `chay.bat` tự trỏ thư mục cài đặt `%USERPROFILE%\WS-Studio_MVP-2` sang repo mới; `.env` và `data\` được giữ.
4. Sửa địa chỉ repo trong `CLAUDE.md` và chỉ dẫn project (Bước 3) nếu muốn cho đúng.

Nếu Windows còn nhớ đăng nhập GitHub cũ và báo không có quyền: mở **Credential Manager** → **Windows Credentials** → xóa mục `git:https://github.com` → chạy lại `chay.bat` và đăng nhập tài khoản mới.

---

## Danh sách mang theo

| Thứ | Ở đâu | Đã có trong git? |
|---|---|---|
| Mã nguồn v2, `dist/`, kiểm thử | gốc repo | Có |
| Đặc tả | `docs/ws-studio-mvp-spec.md` | Có |
| Quy tắc cho Claude | `CLAUDE.md` | Có |
| Hướng dẫn này | `docs/chuyen-tai-khoan.md` | Có |
| Thảo luận soạn phiếu | `docs/tham-khao/thao-luan/` | Có |
| Đánh giá giao diện và ảnh chụp | `docs/tham-khao/ui-danh-gia/` | Có |
| Skill giao diện Content Matrix và ảnh đã tải lên | `docs/tham-khao/tai-len/` | Có |
| Mã bản cũ v1 (để đối chiếu) | `docs/tham-khao/ws-studio-v1.zip` | Có |
| Khóa API | `.env`, `data/ai-settings.json` trên máy | **Không**, nhập lại hoặc chép tay |
| Dữ liệu đã soạn trong app | `localStorage` của trình duyệt | **Không** |
| Lịch sử chat với Claude ở project cũ | claude.ai | **Không**, các quyết định đã ghi trong đặc tả |

Các bản dựng cũ (`ws-studio-build/`, các tệp `.zip` trong thư mục dự án cũ) chỉ là bản chụp trước đây, không cần mang theo: bản mới nhất luôn dựng được từ git (`npm run build`).
