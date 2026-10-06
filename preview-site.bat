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

rem 1) 先看有沒有既有伺服器：有 → 只開站後結束（不啟動、不佔終端機）
rem    這一步讓「重複執行」在 IDE 內永遠有效 —— 伺服器絕不會佔住終端機。
node "%~dp0preview.js" --probe %*
if errorlevel 2 exit /b 0
if errorlevel 1 (
    echo.
    pause
    exit /b 1
)

rem 2) 沒有伺服器 → 交給 preview.js 以「真正的背景行程」啟動
rem    （detached + stdio 全導向 NUL：不繼承本終端機／管線的任何 handle，
rem      所以用終端機、管線或重導向呼叫都不會被背景行程卡住；
rem      啟動後會等伺服器真的起來才開站，失敗會直接顯示錯誤）。
node "%~dp0preview.js" --detach %*
if errorlevel 1 (
    echo.
    pause
    exit /b 1
)
exit /b 0
