@echo off
echo Smart Study Planner - Automated Test Setup
echo ==========================================

echo Installing required packages...
pip install -r requirements.txt

echo.
echo Downloading ChromeDriver...
python -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"

echo.
echo Setup complete! Running tests...
echo.
python qt.py

pause