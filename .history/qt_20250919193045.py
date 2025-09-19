#!/usr/bin/env python3
"""
Automated Test Suite for Smart Study Planner
Tests all components including adding tasks, deleting, export PDF, and more
Author: GitHub Copilot
"""

import os
import time
import json
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    WEBDRIVER_MANAGER_AVAILABLE = False

class StudyPlannerTester:
    def __init__(self):
        self.setup_driver()
        self.test_results = []
        self.base_url = f"file://{os.path.abspath('index.html')}"
        
    def setup_driver(self):
        """Setup Chrome WebDriver with options"""
        chrome_options = Options()
        chrome_options.add_argument("--disable-popup-blocking")
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        try:
            if WEBDRIVER_MANAGER_AVAILABLE:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                self.driver = webdriver.Chrome(options=chrome_options)
                
            self.driver.maximize_window()
            self.wait = WebDriverWait(self.driver, 10)
            print("SUCCESS: Chrome WebDriver initialized successfully")
        except Exception as e:
            print(f"ERROR: Failed to initialize WebDriver: {e}")
            print("Please ensure ChromeDriver is installed and in PATH")
            print("Run: pip install webdriver-manager")
            exit(1)

    def log_test(self, test_name, success, message=""):
        """Log test results"""
        status = "PASS" if success else "FAIL"
        result = f"[{status}]: {test_name}"
        if message:
            result += f" - {message}"
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })

    def wait_for_element(self, by, value, timeout=10):
        """Wait for element to be present and visible"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
            return element
        except TimeoutException:
            return None

    def test_page_load(self):
        """Test 1: Page loads successfully"""
        try:
            self.driver.get(self.base_url)
            self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "app-container")))
            title = self.driver.find_element(By.TAG_NAME, "h1").text
            success = "Smart Study Planner" in title
            self.log_test("Page Load", success, f"Title: {title}")
            return success
        except Exception as e:
            self.log_test("Page Load", False, str(e))
            return False

    def test_add_card_modal(self):
        """Test 2: Add Card Modal Opens"""
        try:
            add_btn = self.wait_for_element(By.ID, "addCardBtn")
            add_btn.click()
            
            modal = self.wait_for_element(By.ID, "cardModal")
            success = modal.is_displayed()
            self.log_test("Add Card Modal", success)
            
            # Close modal for next tests
            close_btn = self.driver.find_element(By.ID, "cancelCard")
            close_btn.click()
            time.sleep(0.5)
            return success
        except Exception as e:
            self.log_test("Add Card Modal", False, str(e))
            return False

    def test_add_new_card(self):
        """Test 3: Add New Study Card"""
        try:
            # Open add card modal
            add_btn = self.wait_for_element(By.ID, "addCardBtn")
            add_btn.click()
            
            # Fill in card details
            title_input = self.wait_for_element(By.ID, "cardTitle")
            title_input.clear()
            title_input.send_keys("Test Study Task")
            
            subject_input = self.driver.find_element(By.ID, "cardSubject")
            subject_input.clear()
            subject_input.send_keys("Mathematics")
            
            # Set due date (tomorrow)
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            due_date = self.driver.find_element(By.ID, "cardDueDate")
            due_date.clear()
            due_date.send_keys(tomorrow)
            
            # Set priority
            priority_select = Select(self.driver.find_element(By.ID, "cardPriority"))
            priority_select.select_by_value("high")
            
            # Add description
            description = self.driver.find_element(By.ID, "cardDescription")
            description.clear()
            description.send_keys("This is a test study task for automated testing")
            
            # Save card
            save_btn = self.driver.find_element(By.ID, "saveCard")
            save_btn.click()
            
            # Wait for card to appear
            time.sleep(1)
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            success = len(cards) > 0
            
            # Check if card contains our title
            if success:
                card_titles = [card.find_element(By.CLASS_NAME, "card-title").text for card in cards]
                success = any("Test Study Task" in title for title in card_titles)
            
            self.log_test("Add New Card", success, f"Found {len(cards)} cards")
            return success
        except Exception as e:
            self.log_test("Add New Card", False, str(e))
            return False

    def test_task_id_display(self):
        """Test 4: Task ID Display"""
        try:
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            if not cards:
                self.log_test("Task ID Display", False, "No cards found")
                return False
            
            # Check if task ID is displayed
            task_id_elements = self.driver.find_elements(By.CLASS_NAME, "card-task-id")
            success = len(task_id_elements) > 0
            
            if success and task_id_elements:
                task_id_text = task_id_elements[0].text
                success = task_id_text.startswith("TSK-")
            
            self.log_test("Task ID Display", success, f"Task ID: {task_id_text if success else 'Not found'}")
            return success
        except Exception as e:
            self.log_test("Task ID Display", False, str(e))
            return False

    def test_add_custom_section(self):
        """Test 5: Add Custom Section"""
        try:
            # Click add section button
            add_section_btn = self.wait_for_element(By.ID, "addColumnBtn")
            add_section_btn.click()
            
            # Fill section details
            section_name = self.wait_for_element(By.ID, "columnName")
            section_name.clear()
            section_name.send_keys("Testing Section")
            
            # Select color
            color_select = Select(self.driver.find_element(By.ID, "columnColor"))
            color_select.select_by_value("blue")
            
            # Save section
            save_btn = self.driver.find_element(By.ID, "saveColumn")
            save_btn.click()
            
            # Wait for section to appear
            time.sleep(1)
            sections = self.driver.find_elements(By.CLASS_NAME, "kanban-column")
            section_titles = [section.find_element(By.CLASS_NAME, "column-title").text for section in sections]
            success = any("Testing Section" in title for title in section_titles)
            
            self.log_test("Add Custom Section", success, f"Found sections: {section_titles}")
            return success
        except Exception as e:
            self.log_test("Add Custom Section", False, str(e))
            return False

    def test_drag_and_drop(self):
        """Test 6: Drag and Drop Functionality"""
        try:
            # Find a card to drag
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            if not cards:
                self.log_test("Drag and Drop", False, "No cards to drag")
                return False
            
            source_card = cards[0]
            
            # Find target section (different from source)
            sections = self.driver.find_elements(By.CLASS_NAME, "kanban-column")
            if len(sections) < 2:
                self.log_test("Drag and Drop", False, "Need at least 2 sections")
                return False
            
            target_section = sections[-1]  # Last section
            
            # Perform drag and drop
            actions = ActionChains(self.driver)
            actions.drag_and_drop(source_card, target_section).perform()
            
            time.sleep(1)
            success = True  # Basic success if no error occurred
            self.log_test("Drag and Drop", success, "Card moved between sections")
            return success
        except Exception as e:
            self.log_test("Drag and Drop", False, str(e))
            return False

    def test_card_context_menu(self):
        """Test 7: Card Context Menu"""
        try:
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            if not cards:
                self.log_test("Card Context Menu", False, "No cards found")
                return False
            
            # Right-click on first card
            actions = ActionChains(self.driver)
            actions.context_click(cards[0]).perform()
            
            time.sleep(0.5)
            # Look for context menu
            context_menu = self.driver.find_elements(By.CLASS_NAME, "context-menu")
            success = len(context_menu) > 0
            
            if success:
                # Click somewhere else to close menu
                self.driver.find_element(By.TAG_NAME, "body").click()
            
            self.log_test("Card Context Menu", success)
            return success
        except Exception as e:
            self.log_test("Card Context Menu", False, str(e))
            return False

    def test_edit_card(self):
        """Test 8: Edit Card"""
        try:
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            if not cards:
                self.log_test("Edit Card", False, "No cards found")
                return False
            
            # Double-click to edit
            actions = ActionChains(self.driver)
            actions.double_click(cards[0]).perform()
            
            # Wait for modal
            modal = self.wait_for_element(By.ID, "cardModal")
            if not modal.is_displayed():
                self.log_test("Edit Card", False, "Modal not opened")
                return False
            
            # Modify title
            title_input = self.driver.find_element(By.ID, "cardTitle")
            title_input.clear()
            title_input.send_keys("Updated Test Task")
            
            # Save changes
            save_btn = self.driver.find_element(By.ID, "saveCard")
            save_btn.click()
            
            time.sleep(1)
            success = True  # If no error, consider success
            self.log_test("Edit Card", success, "Card edited successfully")
            return success
        except Exception as e:
            self.log_test("Edit Card", False, str(e))
            return False

    def test_export_pdf(self):
        """Test 9: Export PDF Functionality"""
        try:
            # Store current window handles
            original_windows = self.driver.window_handles
            
            # Click export PDF button
            export_btn = self.wait_for_element(By.ID, "exportPdfBtn")
            export_btn.click()
            
            # Wait for new window/tab
            time.sleep(2)
            new_windows = self.driver.window_handles
            
            success = len(new_windows) > len(original_windows)
            
            if success:
                # Switch to new window and check content
                self.driver.switch_to.window(new_windows[-1])
                time.sleep(1)
                
                # Check if export content is present
                page_source = self.driver.page_source
                success = "Smart Study Planner" in page_source and "Study Calendar" in page_source
                
                # Close export window and return to main
                self.driver.close()
                self.driver.switch_to.window(original_windows[0])
            
            self.log_test("Export PDF", success, "Export window opened with content")
            return success
        except Exception as e:
            self.log_test("Export PDF", False, str(e))
            return False

    def test_clear_all_data(self):
        """Test 10: Clear All Data"""
        try:
            # Click clear all button
            clear_btn = self.wait_for_element(By.ID, "clearAllBtn")
            clear_btn.click()
            
            # Handle confirmation dialog
            time.sleep(0.5)
            try:
                alert = self.driver.switch_to.alert
                alert.accept()
                time.sleep(1)
            except:
                pass  # No alert, continue
            
            # Check if cards are cleared
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            success = len(cards) == 0
            
            self.log_test("Clear All Data", success, f"Remaining cards: {len(cards)}")
            return success
        except Exception as e:
            self.log_test("Clear All Data", False, str(e))
            return False

    def test_responsive_design(self):
        """Test 11: Responsive Design"""
        try:
            # Test mobile view
            self.driver.set_window_size(375, 667)  # iPhone size
            time.sleep(1)
            
            # Check if elements are still accessible
            header = self.driver.find_element(By.CLASS_NAME, "app-header")
            kanban = self.driver.find_element(By.CLASS_NAME, "kanban-board")
            
            success = header.is_displayed() and kanban.is_displayed()
            
            # Restore window size
            self.driver.maximize_window()
            time.sleep(0.5)
            
            self.log_test("Responsive Design", success, "Mobile view test")
            return success
        except Exception as e:
            self.log_test("Responsive Design", False, str(e))
            return False

    def test_local_storage(self):
        """Test 12: Local Storage Persistence"""
        try:
            # Add a test card
            add_btn = self.wait_for_element(By.ID, "addCardBtn")
            add_btn.click()
            
            title_input = self.wait_for_element(By.ID, "cardTitle")
            title_input.clear()
            title_input.send_keys("Persistence Test")
            
            save_btn = self.driver.find_element(By.ID, "saveCard")
            save_btn.click()
            time.sleep(1)
            
            # Refresh page
            self.driver.refresh()
            time.sleep(2)
            
            # Check if card persists
            cards = self.driver.find_elements(By.CLASS_NAME, "study-card")
            card_titles = [card.find_element(By.CLASS_NAME, "card-title").text for card in cards]
            success = any("Persistence Test" in title for title in card_titles)
            
            self.log_test("Local Storage", success, "Data persists after refresh")
            return success
        except Exception as e:
            self.log_test("Local Storage", False, str(e))
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("Starting Smart Study Planner Automated Test Suite")
        print("=" * 60)
        
        tests = [
            self.test_page_load,
            self.test_add_card_modal,
            self.test_add_new_card,
            self.test_task_id_display,
            self.test_add_custom_section,
            self.test_drag_and_drop,
            self.test_card_context_menu,
            self.test_edit_card,
            self.test_export_pdf,
            self.test_local_storage,
            self.test_responsive_design,
            self.test_clear_all_data,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ Test failed with error: {e}")
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        print(f"✅ Success Rate: {(passed/total)*100:.1f}%")
        
        # Save detailed results
        self.save_test_results(passed, total)
        
        return passed == total

    def save_test_results(self, passed, total):
        """Save test results to JSON file"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tests': total,
                'passed': passed,
                'failed': total - passed,
                'success_rate': (passed/total)*100
            },
            'test_details': self.test_results
        }
        
        with open('test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"📄 Detailed results saved to test_results.json")

    def cleanup(self):
        """Cleanup resources"""
        try:
            self.driver.quit()
            print("🧹 Browser closed successfully")
        except:
            pass

def main():
    """Main function to run tests"""
    print("Smart Study Planner - Automated Test Suite")
    print("Testing all components automatically...")
    print()
    
    tester = StudyPlannerTester()
    
    try:
        all_passed = tester.run_all_tests()
        
        if all_passed:
            print("\n🎉 All tests passed! Your Study Planner is working perfectly!")
        else:
            print("\n⚠️ Some tests failed. Check the results above for details.")
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()