@echo off
REM GRAMS Project Startup Script for Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║  GRAMS - Grievance Redressal System    ║
echo ║  Development Server Startup            ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "server\node_modules" (
    echo ⚠️  Dependencies not installed!
    echo Installing dependencies... This may take a few minutes.
    call npm run install-all
    if errorlevel 1 (
        echo ❌ Installation failed!
        pause
        exit /b 1
    )
)

REM Check if .env files exist
if not exist "server\.env" (
    echo ⚠️  server\.env not found!
    echo Creating from template...
    copy "server\.env.example" "server\.env" >nul
)

if not exist "client\.env" (
    echo ⚠️  client\.env not found!
    echo Creating from template...
    copy "client\.env.example" "client\.env" >nul
)

echo.
echo ✅ All checks passed!
echo.
echo 🚀 Starting development servers...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    API:      http://localhost:5000/api
echo.
echo Press Ctrl+C to stop all servers
echo.

call npm run dev

pause
