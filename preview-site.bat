@echo off
chcp 65001 >nul
title Antigravity 展示站 - 本機預覽伺服器
setlocal

rem 先確認 Node.js 存在，避免丟出看不懂的錯誤
where node >nul 2>nul
if errorlevel 1 (
    echo [錯誤] 找不到 Node.js，請先安裝後再執行本工具：https://nodejs.org/
    pause
    exit /b 1
)

rem preview.js 支援重複執行，退出碼：
rem   0 = 伺服器正常結束（使用者中止）
rem   2 = 偵測到既有預覽伺服器，已直接開啟網站（不重複佔埠）
rem   1 = 啟動失敗
node "%~dp0preview.js" %*
set "RC=%ERRORLEVEL%"

if "%RC%"=="0" exit /b 0
if "%RC%"=="2" exit /b 0

echo.
echo [錯誤] 預覽伺服器啟動失敗（結束代碼 %RC%）。
pause
exit /b %RC%
