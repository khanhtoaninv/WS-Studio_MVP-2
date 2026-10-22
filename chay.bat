@echo off
rem ================================================================
rem  ws-studio: tai ban moi nhat tu GitHub roi mo app.
rem  Dat tep nay o dau cung duoc (vi du Desktop) va bam dup.
rem  - Lan dau: tai ma ve %USERPROFILE%\WS-Studio_MVP-2, hoi khoa Claude API.
rem  - Cac lan sau: lay ban moi nhat (thu muc nay do tep .bat quan ly,
rem    sua tay trong do se bi ghi de; tep .env duoc giu nguyen).
rem  Can: Git for Windows. Node.js 20+ de dung Claude; khong co Node
rem  thi mo ban mot tep (AI gia lap).
rem ================================================================
chcp 65001 >nul
setlocal EnableDelayedExpansion
set "REPO=https://github.com/khanhtoaninv/WS-Studio_MVP-2.git"
set "BRANCH=main"
set "DIR=%USERPROFILE%\WS-Studio_MVP-2"
set "PORT=5173"
title ws-studio

where git >nul 2>nul
if errorlevel 1 (
  echo [!] Chưa có Git. Cài bằng lệnh:  winget install Git.Git
  echo     hoặc tải tại https://git-scm.com/download/win , rồi chạy lại tệp này.
  pause & exit /b 1
)

if not exist "%DIR%\.git" (
  echo == Tải ws-studio lần đầu vào %DIR% ...
  echo    Nếu trình duyệt hỏi đăng nhập GitHub, hãy đăng nhập tài khoản có quyền vào repo.
  git clone --branch %BRANCH% "%REPO%" "%DIR%"
  if errorlevel 1 ( echo [!] Không tải được mã. Kiểm tra mạng và quyền truy cập repo. & pause & exit /b 1 )
) else (
  echo == Lấy bản mới nhất ...
  git -C "%DIR%" fetch origin %BRANCH%
  if errorlevel 1 (
    echo [!] Không kết nối được GitHub, mở bản đang có trên máy.
  ) else (
    git -C "%DIR%" reset --hard origin/%BRANCH% >nul
  )
)
cd /d "%DIR%"
for /f %%h in ('git rev-parse --short HEAD') do echo    Phiên bản: %%h

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Chưa có Node.js nên mở bản một tệp, AI giả lập.
  echo     Muốn dùng Claude: winget install OpenJS.NodeJS.LTS , rồi chạy lại tệp này.
  start "" "%DIR%\dist\ws-studio.html"
  timeout /t 8 >nul & exit /b 0
)

rem Cài thư viện khi package-lock.json đổi
for /f %%h in ('git rev-parse HEAD:package-lock.json') do set "LOCK=%%h"
set "OLD="
if exist "node_modules\.lockhash" set /p OLD=<"node_modules\.lockhash"
if not "!LOCK!"=="!OLD!" (
  echo == Cài thư viện ^(npm install^) ...
  call npm install --no-fund --no-audit
  if errorlevel 1 ( echo [!] npm install lỗi. & pause & exit /b 1 )
  >"node_modules\.lockhash" echo !LOCK!
)

rem Khóa Claude API: hỏi một lần, lưu trong .env (không đưa lên git)
if not exist ".env" (
  copy /y ".env.example" ".env" >nul
  echo.
  echo Dán ANTHROPIC_API_KEY để dùng Claude, hoặc bấm Enter để dùng AI giả lập.
  echo Sửa sau trong tệp %DIR%\.env
  set "KEY="
  set /p "KEY=ANTHROPIC_API_KEY: "
  if not "!KEY!"=="" powershell -NoProfile -Command "(Get-Content -Raw '.env') -replace '(?m)^ANTHROPIC_API_KEY=.*$', 'ANTHROPIC_API_KEY=!KEY!' | Set-Content -NoNewline -Encoding utf8 '.env'"
)

rem Mở trình duyệt khi máy chủ sẵn sàng, chạy máy chủ trong cửa sổ này
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 60;$i++){try{Invoke-WebRequest -UseBasicParsing http://localhost:%PORT%/api/health | Out-Null; Start-Process http://localhost:%PORT%/; break}catch{Start-Sleep -Milliseconds 500}}"
echo.
echo == ws-studio đang chạy tại http://localhost:%PORT%/  (đóng cửa sổ này để tắt)
set "PORT=%PORT%"
node server\index.js
pause
