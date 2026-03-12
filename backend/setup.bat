@echo off
echo =============================================
echo  Voice2Sense - Backend Setup (Windows)
echo =============================================
echo.

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo =============================================
echo  Setup complete! Start the server with:
echo    cd backend
echo    venv\Scripts\activate
echo    python server.py
echo =============================================
pause
