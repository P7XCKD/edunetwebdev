# Smart Study Planner - Automated Test Suite

## Overview
This automated test suite (`qt.py`) comprehensively tests all components of the Smart Study Planner including adding tasks, deleting them, exporting PDF, drag-and-drop functionality, and more.

## What Gets Tested
1. **Page Load** - Verifies the application loads correctly
2. **Add Card Modal** - Tests modal opening/closing
3. **Add New Card** - Creates study tasks with all fields
4. **Task ID Display** - Checks unique task ID generation (TSK-001, etc.)
5. **Add Custom Section** - Creates new Kanban columns
6. **Drag and Drop** - Tests moving cards between sections
7. **Card Context Menu** - Right-click menu functionality
8. **Edit Card** - Modifying existing tasks
9. **Export PDF** - PDF export with dark theme and calendar
10. **Local Storage** - Data persistence after page refresh
11. **Responsive Design** - Mobile view compatibility
12. **Clear All Data** - Bulk data deletion

## Prerequisites
- Python 3.7 or higher
- Google Chrome browser
- Internet connection (for ChromeDriver download)

## Quick Setup & Run

### Option 1: Automatic Setup (Windows)
```bash
# Just double-click this file:
run_tests.bat
```

### Option 2: Manual Setup
```bash
# Install Python packages
pip install -r requirements.txt

# Run the test suite
python qt.py
```

### Option 3: With Auto-ChromeDriver Management
```bash
# Install with webdriver manager
pip install selenium webdriver-manager

# Run tests (will auto-download ChromeDriver)
python qt.py
```

## Test Results
- **Console Output**: Real-time test progress with ✅/❌ indicators
- **test_results.json**: Detailed results with timestamps
- **Success Rate**: Percentage of tests passed

## Sample Output
```
🚀 Starting Smart Study Planner Automated Test Suite
============================================================
✅ Chrome WebDriver initialized successfully
✅ PASS: Page Load - Title: Smart Study Planner
✅ PASS: Add Card Modal
✅ PASS: Add New Card - Found 1 cards
✅ PASS: Task ID Display - Task ID: TSK-001
✅ PASS: Add Custom Section - Found sections: ['To Do', 'Testing Section']
...
============================================================
📊 TEST SUMMARY: 12/12 tests passed
✅ Success Rate: 100.0%
📄 Detailed results saved to test_results.json
🎉 All tests passed! Your Study Planner is working perfectly!
```

## Troubleshooting

### ChromeDriver Issues
```bash
# Install webdriver manager for automatic ChromeDriver handling
pip install webdriver-manager
```

### Port/File Access Issues
- Ensure no other instances of Chrome are running
- Check that `index.html` exists in the same directory
- Run from the project root directory

### Module Import Errors
```bash
# Reinstall Selenium
pip uninstall selenium
pip install selenium==4.15.0
```

## Customizing Tests
You can modify `qt.py` to:
- Add new test cases
- Change test data (task titles, dates, etc.)
- Adjust timeouts and delays
- Add performance testing
- Test different browsers

## Files Created
- `qt.py` - Main test suite
- `requirements.txt` - Python dependencies
- `run_tests.bat` - Windows auto-setup script
- `test_results.json` - Test results (generated after running)

## Notes
- Tests run in a real Chrome browser window
- Each test includes cleanup to avoid interference
- Tests are designed to be independent and repeatable
- Local Storage is tested for data persistence
- Export functionality opens real browser tabs

## Support
The test suite automatically handles most common issues and provides detailed error messages for troubleshooting.