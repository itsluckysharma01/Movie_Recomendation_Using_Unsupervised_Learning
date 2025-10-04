@echo off
echo ========================================
echo  Movie Recommendation System
echo  Starting Flask Server...
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
)

echo.
echo ========================================
echo  Starting server on http://localhost:5000
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the Flask application
python app.py

pause
