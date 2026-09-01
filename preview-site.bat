@echo off
chcp 65001 >nul
echo 正在啟動 Antigravity 插件官網本機預覽伺服器...
node "%~dp0preview.js"
pause
