@echo off
echo 🚀 Starting Cursor IDE Development Environment...

:: Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.
echo 🎯 To start development:
echo 1. Backend:  cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:3001
echo.
echo Press any key to exit...
pause
