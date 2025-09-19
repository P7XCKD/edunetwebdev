# PowerShell script to run tests
Write-Host "Smart Study Planner - Automated Test Runner" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$pythonPath = "C:/Users/Dev/AppData/Local/Programs/Python/Python313/python.exe"

Write-Host "Checking Python installation..." -ForegroundColor Yellow
& $pythonPath test_install.py

Write-Host "`nRunning automated test suite..." -ForegroundColor Yellow
& $pythonPath qt.py

Write-Host "`nPress any key to continue..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")