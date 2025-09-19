#!/usr/bin/env python3
"""
ChromeDriver Setup Helper
Downloads and sets up ChromeDriver automatically
"""

import os
import sys
import zipfile
import requests
from pathlib import Path

def get_chrome_version():
    """Get installed Chrome version"""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Google\Chrome\BLBeacon")
        version, _ = winreg.QueryValueEx(key, "version")
        return version.split('.')[0]  # Return major version
    except:
        return "119"  # Default to recent version

def download_chromedriver():
    """Download ChromeDriver for current Chrome version"""
    print("Setting up ChromeDriver...")
    
    chrome_version = get_chrome_version()
    print(f"Detected Chrome version: {chrome_version}")
    
    # ChromeDriver download URL (using stable version)
    base_url = "https://chromedriver.storage.googleapis.com"
    
    # Get latest version for the Chrome major version
    try:
        version_url = f"{base_url}/LATEST_RELEASE_{chrome_version}"
        response = requests.get(version_url)
        if response.status_code == 200:
            driver_version = response.text.strip()
        else:
            driver_version = "119.0.6045.105"  # Fallback version
    except:
        driver_version = "119.0.6045.105"  # Fallback version
    
    print(f"Using ChromeDriver version: {driver_version}")
    
    # Download URL
    download_url = f"{base_url}/{driver_version}/chromedriver_win32.zip"
    
    # Download and extract
    try:
        print("Downloading ChromeDriver...")
        response = requests.get(download_url)
        
        if response.status_code == 200:
            zip_path = "chromedriver.zip"
            with open(zip_path, "wb") as f:
                f.write(response.content)
            
            print("Extracting ChromeDriver...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(".")
            
            os.remove(zip_path)
            print("SUCCESS: ChromeDriver installed!")
            return True
        else:
            print(f"Failed to download ChromeDriver: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error downloading ChromeDriver: {e}")
        return False

if __name__ == "__main__":
    if download_chromedriver():
        print("\nYou can now run: py qt.py")
    else:
        print("\nPlease download ChromeDriver manually from:")
        print("https://chromedriver.chromium.org/")