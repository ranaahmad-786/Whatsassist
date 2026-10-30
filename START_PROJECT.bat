@echo off
title Starting WhatsAssist - Muhammad Ahmad Khan (24-ST-027)
color 0A

echo =====================================================================
echo                WhatsAssist - 1-Click System Launcher
echo           PTUT Final Year Project - Muhammad Ahmad Khan (24-ST-027)
echo           Brand: ZepTech Smart Electronics & E-Mobility Store
echo =====================================================================
echo.

set CURRENT_DIR=%~dp0
if exist "%CURRENT_DIR%New Project Final Year - Copy\New Project Final Year - Copy\backend" (
    set TARGET_DIR=%CURRENT_DIR%New Project Final Year - Copy\New Project Final Year - Copy\
) else if exist "%CURRENT_DIR%New Project Final Year - Copy\backend" (
    set TARGET_DIR=%CURRENT_DIR%New Project Final Year - Copy\
) else (
    set TARGET_DIR=%CURRENT_DIR%
)

cd /d "%TARGET_DIR%"

echo [1/4] Checking and clearing old port listeners (5000 & 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/4] Starting Backend API Server (Port 5000)...
start "WhatsAssist Backend API" cmd /k "cd /d "%TARGET_DIR%backend" && npm start"

timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Dashboard (Port 5173)...
start "WhatsAssist Frontend UI" cmd /k "cd /d "%TARGET_DIR%frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo [4/4] Opening WhatsAssist in your Browser...
start http://localhost:5173

echo.
echo =====================================================================
echo  WhatsAssist is now running!
echo  Frontend UI: http://localhost:5173
echo  Backend API: http://localhost:5000
echo  (Keep the two terminal windows open while using the application)
echo =====================================================================
timeout /t 5
