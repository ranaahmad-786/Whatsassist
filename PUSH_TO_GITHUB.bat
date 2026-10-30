@echo off
title Push WhatsAssist to GitHub - Muhammad Ahmad Khan (24-ST-027)
color 0A

echo =====================================================================
echo            WhatsAssist - Automated GitHub Setup and Push
echo          PTUT Final Year Project - Muhammad Ahmad Khan (24-ST-027)
echo =====================================================================
echo.

set PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%

where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed.
    echo Opening Git download page...
    start https://git-scm.com/download/win
    pause
    exit /b 1
)

set SCRIPT_DIR=%~dp0
if exist "%SCRIPT_DIR%New Project Final Year - Copy\New Project Final Year - Copy\backend" (
    set PROJECT_DIR=%SCRIPT_DIR%New Project Final Year - Copy\New Project Final Year - Copy\
) else if exist "%SCRIPT_DIR%New Project Final Year - Copy\backend" (
    set PROJECT_DIR=%SCRIPT_DIR%New Project Final Year - Copy\
) else (
    set PROJECT_DIR=%SCRIPT_DIR%
)

cd /d "%PROJECT_DIR%"

echo [1/4] Checking Git repository initialization...
if not exist ".git" (
    git init -b main
) else (
    echo Git repository is ready.
)

echo.
echo [2/4] Configuring Git user identity...
git config user.name "Muhammad Ahmad Khan"
git config user.email "ranaahmadkhan.112211@gmail.com"
echo User: Muhammad Ahmad Khan (ranaahmadkhan.112211@gmail.com)

echo.
echo [3/4] Staging files for commit...
git add .
git commit -m "feat: WhatsAssist Final Year Project - Real WhatsApp Multi-Device and Full AI Engine" >nul 2>&1

echo.
echo [4/4] Configuring GitHub Remote and Pushing...
set REPO_URL=https://github.com/ranaahmad-786/Whatsassist.git
echo Target Repository: %REPO_URL%

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing project to GitHub...
echo Note: If a browser popup opens, click Sign in with your browser to authorize.
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo =====================================================================
    echo [!] Push encountered an issue or requires GitHub browser login.
    echo =====================================================================
) else (
    echo.
    echo =====================================================================
    echo  SUCCESS! WhatsAssist has been pushed to GitHub!
    echo  View repository at: https://github.com/ranaahmad-786/Whatsassist
    echo =====================================================================
)

echo.
echo Press any key to close this window...
pause >nul
