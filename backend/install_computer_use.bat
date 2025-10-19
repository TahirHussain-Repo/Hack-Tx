@echo off
echo ==========================================
echo Installing Computer Use Dependencies
echo ==========================================
echo.

echo Step 1: Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python packages
    pause
    exit /b 1
)
echo.

echo Step 2: Installing Playwright browsers...
python -m playwright install chromium
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Playwright browsers
    pause
    exit /b 1
)
echo.

echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Make sure your .env file has GEMINI_API_KEY set
echo 2. Run: python server.py
echo.
pause

