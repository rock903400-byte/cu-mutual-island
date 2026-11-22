@echo off
cd /d "%~dp0"
title CU Mutual Fund Carnival Server (http://127.0.0.1:8765)
echo ======================================================
echo   CU Mutual Fund Carnival - Local 3D Game Server
echo ======================================================
echo.
echo Starting server at http://127.0.0.1:8765 ...
echo Keep this window open while playing!
echo.
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:8765/index.html"
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8765 --bind 127.0.0.1
) else (
  py -m http.server 8765 --bind 127.0.0.1
)
pause
