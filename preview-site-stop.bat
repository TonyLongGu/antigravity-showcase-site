@echo off
chcp 65001 >nul
title Antigravity 展示站 - 關閉本機預覽伺服器
setlocal

rem 先確認 Node.js 存在，避免丟出看不懂的錯誤
where node >nul 2>nul
if errorlevel 1 (
    echo [錯誤] 找不到 Node.js，請先安裝後再執行本工具：https://nodejs.org/
    pause
    exit /b 1
)

rem 關閉本站的預覽伺服器（自動由健康檢查端點／監聽中的埠找出 PID）
node "%~dp0preview.js" --stop %*
set "RC=%ERRORLEVEL%"

if "%RC%"=="0" exit /b 0

echo.
echo [提示] 有伺服器無法自動關閉（結束代碼 %RC%），詳見上方訊息。
pause
exit /b %RC%