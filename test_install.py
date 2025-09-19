#!/usr/bin/env python3
# Simple test to verify installation
import sys
print("Python version:", sys.version)

try:
    import selenium
    print("SUCCESS: Selenium installed:", selenium.__version__)
except ImportError:
    print("ERROR: Selenium not installed")

try:
    from webdriver_manager.chrome import ChromeDriverManager
    print("SUCCESS: WebDriver Manager installed")
except ImportError:
    print("ERROR: WebDriver Manager not installed")

print("\nReady to run tests!")