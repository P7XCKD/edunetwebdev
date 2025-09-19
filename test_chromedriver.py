#!/usr/bin/env python3
"""
Simple ChromeDriver Test
Tests if ChromeDriver is working before running full test suite
"""

import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def test_chromedriver():
    """Test basic ChromeDriver functionality"""
    print("Testing ChromeDriver setup...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Try to create a driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Try to load a simple page
        driver.get("data:text/html,<html><body><h1>Test</h1></body></html>")
        
        # Try to find an element
        element = driver.find_element(By.TAG_NAME, "h1")
        success = element.text == "Test"
        
        driver.quit()
        
        if success:
            print("SUCCESS: ChromeDriver is working correctly!")
            return True
        else:
            print("ERROR: ChromeDriver test failed")
            return False
            
    except Exception as e:
        print(f"ERROR: ChromeDriver not working: {e}")
        print("\nSolutions:")
        print("1. Run: py setup_chromedriver.py")
        print("2. Or download ChromeDriver manually and place in this folder")
        print("3. Or add ChromeDriver to your system PATH")
        return False

if __name__ == "__main__":
    if test_chromedriver():
        print("\nReady to run full test suite!")
        print("Run: py qt.py")
    else:
        print("\nPlease fix ChromeDriver setup first.")