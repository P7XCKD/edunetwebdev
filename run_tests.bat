@echo off
echo Smart Study Planner - Automated Test Setup
echo ==========================================

echo Installing required packages...
"C:/Users/Dev/AppData/Local/Programs/Python/Python313/python.exe" -m pip install -r requirements.txt

echo.
echo Downloading ChromeDriver...
"C:/Users/Dev/AppData/Local/Programs/Python/Python313/python.exe" -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"

echo.
echo Setup complete! Running tests...
echo.
"C:/Users/Dev/AppData/Local/Programs/Python/Python313/python.exe" qt.py

pause