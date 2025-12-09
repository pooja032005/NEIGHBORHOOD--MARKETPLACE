@echo off
REM Open Neighborhood Marketplace in Chrome

echo Starting servers...

REM Kill any existing Node processes
taskkill /F /IM node.exe >nul 2>&1

REM Wait for processes to terminate
timeout /t 2 /nobreak

REM Start backend in background
start cmd /k "cd /d C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\backend && node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in background
start cmd /k "cd /d C:\Users\pooja\OneDrive\Desktop\neighborhood-marketplace\frontend && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak

REM Open in Chrome
echo Opening app in Chrome...
start chrome http://localhost:5173

echo.
echo Servers started! Opening app in Chrome...
echo.
pause
