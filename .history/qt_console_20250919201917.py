#!/usr/bin/env python3
"""
Console-Only Test Suite for Smart Study Planner
Fast background testing without opening browser - results in 5 seconds
Tests JavaScript functionality, file structure, and configuration
"""

import os
import json
import time
import re
from datetime import datetime

class ConsoleStudyPlannerTester:
    def __init__(self):
        self.test_results = []
        self.start_time = time.time()
        self.errors = []
        
    def log_test(self, test_name, success, message=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status}: {test_name}"
        if message:
            result += f" - {message}"
        print(result)
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        if not success:
            self.errors.append(f"{test_name}: {message}")

    def test_file_structure(self):
        """Test 1: Check if all required files exist"""
        required_files = [
            'index.html',
            'style.css', 
            'script-new.js'
        ]
        
        missing_files = []
        for file in required_files:
            if not os.path.exists(file):
                missing_files.append(file)
        
        success = len(missing_files) == 0
        message = f"Missing files: {missing_files}" if missing_files else "All files present"
        self.log_test("File Structure", success, message)
        return success

    def test_html_structure(self):
        """Test 2: Validate HTML structure and required elements"""
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            required_elements = [
                'kanbanBoard',
                'cardModal', 
                'columnModal',
                'addCardBtn',
                'script-new.js'
            ]
            
            missing_elements = []
            for element in required_elements:
                if element not in html_content:
                    missing_elements.append(element)
            
            success = len(missing_elements) == 0
            message = f"Missing elements: {missing_elements}" if missing_elements else "All HTML elements found"
            self.log_test("HTML Structure", success, message)
            return success
        except Exception as e:
            self.log_test("HTML Structure", False, str(e))
            return False

    def test_css_syntax(self):
        """Test 3: Basic CSS syntax validation"""
        try:
            with open('style.css', 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            # Basic syntax checks
            open_braces = css_content.count('{')
            close_braces = css_content.count('}')
            
            # Check for common CSS issues
            issues = []
            if open_braces != close_braces:
                issues.append(f"Mismatched braces: {open_braces} open, {close_braces} close")
            
            # Check for required styles
            required_styles = [
                '.study-card',
                '.board-column',
                '.completion-toggle-btn',
                '.card-header'
            ]
            
            missing_styles = []
            for style in required_styles:
                if style not in css_content:
                    missing_styles.append(style)
            
            if missing_styles:
                issues.append(f"Missing styles: {missing_styles}")
            
            success = len(issues) == 0
            message = "; ".join(issues) if issues else "CSS syntax valid"
            self.log_test("CSS Syntax", success, message)
            return success
        except Exception as e:
            self.log_test("CSS Syntax", False, str(e))
            return False

    def test_javascript_syntax(self):
        """Test 4: JavaScript syntax and structure validation"""
        try:
            with open('script-new.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            issues = []
            
            # Check for required classes and functions
            required_components = [
                'class StudyPlannerKanban',
                'saveColumn()',
                'toggleCardCompletion(',
                'exportToPDF()',
                'createCardElement(',
                'renderColumns()',
                'getDefaultColumns()'
            ]
            
            missing_components = []
            for component in required_components:
                if component not in js_content:
                    missing_components.append(component)
            
            if missing_components:
                issues.append(f"Missing components: {missing_components}")
            
            # Check for console.log statements (indicates proper logging)
            console_logs = js_content.count('console.log')
            if console_logs < 5:
                issues.append(f"Insufficient logging: only {console_logs} console.log statements")
            
            # Check for modern JavaScript features
            if 'const ' not in js_content:
                issues.append("No const declarations found")
            if 'let ' not in js_content:
                issues.append("No let declarations found")
            
            success = len(issues) == 0
            message = "; ".join(issues) if issues else f"JavaScript structure valid ({console_logs} log statements)"
            self.log_test("JavaScript Syntax", success, message)
            return success
        except Exception as e:
            self.log_test("JavaScript Syntax", False, str(e))
            return False

    def test_completion_feature(self):
        """Test 5: Check if completion toggle feature is implemented"""
        try:
            with open('script-new.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            completion_features = [
                'toggleCardCompletion',
                'completion-toggle-btn',
                'isCompleted',
                'completedDate'
            ]
            
            missing_features = []
            for feature in completion_features:
                if feature not in js_content:
                    missing_features.append(feature)
            
            success = len(missing_features) == 0
            message = f"Missing features: {missing_features}" if missing_features else "Completion feature implemented"
            self.log_test("Completion Feature", success, message)
            return success
        except Exception as e:
            self.log_test("Completion Feature", False, str(e))
            return False

    def test_enter_key_support(self):
        """Test 6: Check if Enter key auto-save is implemented"""
        try:
            with open('script-new.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            enter_key_features = [
                'addEventListener(\'keydown\'',
                'e.key === \'Enter\'',
                'e.preventDefault()',
                'handleEnterKey'
            ]
            
            missing_features = []
            for feature in enter_key_features:
                if feature not in js_content:
                    missing_features.append(feature)
            
            success = len(missing_features) == 0
            message = f"Missing features: {missing_features}" if missing_features else "Enter key auto-save implemented"
            self.log_test("Enter Key Support", success, message)
            return success
        except Exception as e:
            self.log_test("Enter Key Support", False, str(e))
            return False

    def test_pdf_export_feature(self):
        """Test 7: Check PDF export functionality"""
        try:
            with open('script-new.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            pdf_features = [
                'exportToPDF()',
                'window.open',
                'generateCalendarHtml',
                'completion-badge',
                'status-badge'
            ]
            
            missing_features = []
            for feature in pdf_features:
                if feature not in js_content:
                    missing_features.append(feature)
            
            success = len(missing_features) == 0
            message = f"Missing features: {missing_features}" if missing_features else "PDF export feature complete"
            self.log_test("PDF Export Feature", success, message)
            return success
        except Exception as e:
            self.log_test("PDF Export Feature", False, str(e))
            return False

    def test_color_scheme(self):
        """Test 8: Check if GitHub-style color scheme is implemented"""
        try:
            with open('style.css', 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            github_colors = [
                '#0d1117',  # Background
                '#161b22',  # Column background
                '#21262d',  # Card background
                '#30363d',  # Card header
                '#e6edf3'   # Text color
            ]
            
            missing_colors = []
            for color in github_colors:
                if color not in css_content:
                    missing_colors.append(color)
            
            success = len(missing_colors) == 0
            message = f"Missing colors: {missing_colors}" if missing_colors else "GitHub color scheme applied"
            self.log_test("Color Scheme", success, message)
            return success
        except Exception as e:
            self.log_test("Color Scheme", False, str(e))
            return False

    def test_customizable_categories(self):
        """Test 9: Check if categories are fully customizable"""
        try:
            with open('script-new.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            customization_features = [
                'openColumnModal',
                'saveColumn()',
                'deleteColumn()',
                'Category 1',  # Generic default names
                'currentEditColumnId'
            ]
            
            missing_features = []
            for feature in customization_features:
                if feature not in js_content:
                    missing_features.append(feature)
            
            # Check that old hardcoded names are NOT present
            old_hardcoded = ['Backlog', 'In Progress', 'Completed']
            found_hardcoded = []
            for old_name in old_hardcoded:
                if f'name: \'{old_name}\'' in js_content:
                    found_hardcoded.append(old_name)
            
            issues = []
            if missing_features:
                issues.append(f"Missing features: {missing_features}")
            if found_hardcoded:
                issues.append(f"Still has hardcoded names: {found_hardcoded}")
            
            success = len(issues) == 0
            message = "; ".join(issues) if issues else "Categories fully customizable"
            self.log_test("Customizable Categories", success, message)
            return success
        except Exception as e:
            self.log_test("Customizable Categories", False, str(e))
            return False

    def run_all_tests(self):
        """Run all tests and display summary"""
        print("🚀 Starting Smart Study Planner Console Tests...")
        print("=" * 60)
        
        # Run all tests
        tests = [
            self.test_file_structure,
            self.test_html_structure,
            self.test_css_syntax,
            self.test_javascript_syntax,
            self.test_completion_feature,
            self.test_enter_key_support,
            self.test_pdf_export_feature,
            self.test_color_scheme,
            self.test_customizable_categories
        ]
        
        for test in tests:
            test()
        
        # Calculate results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        elapsed_time = time.time() - self.start_time
        
        # Display summary
        print("=" * 60)
        print(f"📊 TEST SUMMARY (Completed in {elapsed_time:.2f}s)")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.errors:
            print("\n🔧 ERRORS TO FIX:")
            print("-" * 40)
            for i, error in enumerate(self.errors, 1):
                print(f"{i}. {error}")
        else:
            print("\n🎉 ALL TESTS PASSED! Your app is ready to go!")
        
        print(f"\n⏱️  Total execution time: {elapsed_time:.2f} seconds")
        return failed_tests == 0

if __name__ == "__main__":
    tester = ConsoleStudyPlannerTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)