@echo off
rem ================================================================
rem  ws-studio: tai ban moi nhat tu GitHub roi mo app.
rem  Dat tep nay o dau cung duoc (vi du Desktop) va bam dup.
rem  - Lan dau: tai ma ve %USERPROFILE%\WS-Studio_MVP-2, hoi khoa Claude API.
rem  - Cac lan sau: lay ban moi nhat. Thu muc do tep nay quan ly, sua tay se bi ghi de;
rem    tep .env duoc giu nguyen.
rem  Can Git for Windows. Co them Node.js 20+ thi dung duoc Claude va Lam bai tren lop.
rem  Tep nay chi dung ky tu ASCII de cmd khong bi loi bang ma; cua so luon o lai de doc loi.
rem ================================================================
if not "%WS_KEEP%"=="1" (
  set "WS_KEEP=1"
  start "ws-studio" cmd /k ""%~f0""
  exit /b
)
chcp 65001 >nul
setlocal EnableDelayedExpansion
set "REPO=https://github.com/khanhtoaninv/WS-Studio_MVP-2.git"
set "BRANCH=main"
set "DIR=%USERPROFILE%\WS-Studio_MVP-2"
set "PORT=5173"
title ws-studio

echo.
echo === ws-studio: kiem tra va mo app ===
where git >nul 2>nul
if errorlevel 1 goto :nogit

if exist "%DIR%\.git" goto :update
echo [1/4] Tai ws-studio lan dau vao %DIR%
echo       Neu trinh duyet hoi dang nhap GitHub, hay dang nhap tai khoan co quyen vao repo.
git clone --branch %BRANCH% "%REPO%" "%DIR%"
if errorlevel 1 goto :noclone
goto :afterget

:update
echo [1/4] Lay ban moi nhat tu GitHub
git -C "%DIR%" fetch origin %BRANCH%
if errorlevel 1 (
  echo       Khong ket noi duoc GitHub, mo ban dang co tren may.
) else (
  git -C "%DIR%" reset --hard origin/%BRANCH% >nul
)

:afterget
cd /d "%DIR%"
for /f %%h in ('git rev-parse --short HEAD') do echo       Phien ban ma: %%h

where node >nul 2>nul
if errorlevel 1 goto :nonode

echo [2/4] Kiem tra thu vien
for /f %%h in ('git rev-parse HEAD:package-lock.json') do set "LOCK=%%h"
set "OLD="
if exist "node_modules\.lockhash" set /p OLD=<"node_modules\.lockhash"
if "!LOCK!"=="!OLD!" (
  echo       Da co san.
) else (
  echo       Cai thu vien, lan dau mat khoang 1 phut...
  call npm install --no-fund --no-audit
  if errorlevel 1 goto :nonpm
  >"node_modules\.lockhash" echo !LOCK!
)

echo [3/4] Khoa Claude API
if exist ".env" (
  echo       Dung khoa trong %DIR%\.env
) else (
  copy /y ".env.example" ".env" >nul
  echo       Dan ANTHROPIC_API_KEY de dung Claude, hoac bam Enter de dung AI gia lap.
  echo       Sua sau trong tep %DIR%\.env
  set "KEY="
  set /p "KEY=      ANTHROPIC_API_KEY: "
  if not "!KEY!"=="" powershell -NoProfile -Command "(Get-Content -Raw '.env') -replace '(?m)^ANTHROPIC_API_KEY=.*$', 'ANTHROPIC_API_KEY=!KEY!' | Set-Content -NoNewline -Encoding utf8 '.env'"
)

echo [4/4] Chay may chu va mo trinh duyet
rem Tat may chu ws-studio cu con dang chay o cong nay, neu khong trang moi se dung may chu cu
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  taskkill /F /PID %%p >nul 2>nul && echo       Da tat may chu cu dang chiem cong %PORT% ^(PID %%p^).
)
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 60;$i++){try{Invoke-WebRequest -UseBasicParsing http://localhost:%PORT%/api/health | Out-Null; Start-Process http://localhost:%PORT%/; break}catch{Start-Sleep -Milliseconds 500}}"
echo.
echo ws-studio dang chay tai http://localhost:%PORT%/
echo Dong cua so nay de tat. Hoc sinh vao dia chi ghi o dong "Hoc sinh vao lam bai" ben duoi.
echo.
node server\index.js
echo.
echo May chu da dung ^(ma loi %errorlevel%^). Doc cac dong phia tren de biet nguyen nhan.
goto :end

:nogit
echo [LOI] Chua co Git. Cai bang lenh:  winget install Git.Git
echo       hoac tai tai https://git-scm.com/download/win , roi chay lai tep nay.
goto :end

:noclone
echo [LOI] Khong tai duoc ma. Kiem tra mang va quyen truy cap repo.
goto :end

:nonode
echo [LOI] Chua co Node.js nen khong chay duoc may chu. Cai bang lenh:
echo       winget install OpenJS.NodeJS.LTS
echo       roi dong cua so, mo lai chay.bat. Tam thoi mo ban mot tep ^(AI gia lap, khong co Lam bai tren lop^).
start "" "%DIR%\dist\ws-studio.html"
goto :end

:nonpm
echo [LOI] npm install bi loi. Doc cac dong phia tren.
goto :end

:end
echo.
echo Cua so van mo de ban doc thong bao. Go exit de dong.
