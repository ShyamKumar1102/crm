@echo off
echo ========================================
echo Testing Netlify Build Process
echo ========================================
echo.

echo [1/4] Cleaning previous builds...
if exist frontend\dist rmdir /s /q frontend\dist
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules
echo Done!
echo.

echo [2/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root npm install failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend npm install failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Done!
echo.

echo [4/4] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Done!
echo.

echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your project is ready for Netlify deployment.
echo.
echo Next steps:
echo 1. Push code to GitHub
echo 2. Connect repository to Netlify
echo 3. Add environment variables
echo 4. Deploy!
echo.
echo See DEPLOYMENT_CHECKLIST.md for details.
echo.
pause
