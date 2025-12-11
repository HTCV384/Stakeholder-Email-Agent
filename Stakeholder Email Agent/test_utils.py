"""
Test Utilities for Traceable Testing
Provides logging, debugging, and traceability helpers
"""
import json
import time
from datetime import datetime
from typing import Any, Dict, List
import traceback

class TestLogger:
    """
    Centralized test logging with test ID tracking
    """
    def __init__(self, test_id: str, test_name: str):
        self.test_id = test_id
        self.test_name = test_name
        self.start_time = time.time()
        self.logs = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log a message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        log_entry = f"[{timestamp}] [{self.test_id}] [{level}] {message}"
        self.logs.append(log_entry)
        print(log_entry)
    
    def log_input(self, data: Any):
        """Log test input data"""
        self.log(f"INPUT: {json.dumps(data, indent=2) if isinstance(data, dict) else str(data)}", "INPUT")
    
    def log_output(self, data: Any):
        """Log test output data"""
        self.log(f"OUTPUT: {json.dumps(data, indent=2) if isinstance(data, dict) else str(data)}", "OUTPUT")
    
    def log_assertion(self, assertion: str, passed: bool):
        """Log assertion result"""
        status = "PASS" if passed else "FAIL"
        self.log(f"ASSERTION: {assertion} - {status}", status)
    
    def log_error(self, error: Exception):
        """Log error with traceback"""
        self.log(f"ERROR: {str(error)}", "ERROR")
        self.log(f"TRACEBACK:\n{traceback.format_exc()}", "ERROR")
    
    def finalize(self, passed: bool):
        """Finalize test and log summary"""
        elapsed = time.time() - self.start_time
        status = "PASSED" if passed else "FAILED"
        self.log(f"TEST {status} in {elapsed:.3f}s", status)
        return {
            "test_id": self.test_id,
            "test_name": self.test_name,
            "status": status,
            "duration": elapsed,
            "logs": self.logs
        }

class TestTracker:
    """
    Track test execution across multiple tests
    """
    def __init__(self):
        self.results = []
        self.start_time = time.time()
    
    def add_result(self, result: Dict):
        """Add a test result"""
        self.results.append(result)
    
    def get_summary(self) -> Dict:
        """Get test execution summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASSED")
        failed = total - passed
        elapsed = time.time() - self.start_time
        
        return {
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": (passed / total * 100) if total > 0 else 0,
            "total_duration": elapsed,
            "results": self.results
        }
    
    def print_summary(self):
        """Print formatted summary"""
        summary = self.get_summary()
        print("\n" + "="*60)
        print("TEST EXECUTION SUMMARY")
        print("="*60)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed']}")
        print(f"Failed: {summary['failed']}")
        print(f"Pass Rate: {summary['pass_rate']:.1f}%")
        print(f"Duration: {summary['total_duration']:.2f}s")
        print("="*60)
        
        if summary['failed'] > 0:
            print("\nFAILED TESTS:")
            for result in summary['results']:
                if result['status'] == 'FAILED':
                    print(f"  - {result['test_id']}: {result['test_name']}")
        print()

def assert_with_log(logger: TestLogger, condition: bool, message: str):
    """
    Assert with automatic logging
    """
    logger.log_assertion(message, condition)
    assert condition, f"[{logger.test_id}] {message}"

def compare_dicts(logger: TestLogger, expected: Dict, actual: Dict, path: str = ""):
    """
    Deep compare two dictionaries with detailed logging
    """
    for key in expected:
        current_path = f"{path}.{key}" if path else key
        
        if key not in actual:
            logger.log_assertion(f"Key '{current_path}' exists", False)
            raise AssertionError(f"Missing key: {current_path}")
        
        if isinstance(expected[key], dict) and isinstance(actual[key], dict):
            compare_dicts(logger, expected[key], actual[key], current_path)
        else:
            matches = expected[key] == actual[key]
            logger.log_assertion(f"{current_path} == {expected[key]}", matches)
            if not matches:
                logger.log(f"Expected: {expected[key]}", "ERROR")
                logger.log(f"Actual: {actual[key]}", "ERROR")
                raise AssertionError(f"Value mismatch at {current_path}")

class MockAPICallTracker:
    """
    Track mock API calls for debugging
    """
    def __init__(self):
        self.calls = []
    
    def record_call(self, method: str, args: tuple, kwargs: dict, response: Any):
        """Record an API call"""
        self.calls.append({
            "timestamp": datetime.now().isoformat(),
            "method": method,
            "args": str(args)[:200],  # Truncate long args
            "kwargs": str(kwargs)[:200],
            "response": str(response)[:200]
        })
    
    def get_call_count(self) -> int:
        """Get total number of calls"""
        return len(self.calls)
    
    def get_calls_by_method(self, method: str) -> List[Dict]:
        """Get all calls to a specific method"""
        return [c for c in self.calls if c["method"] == method]
    
    def print_call_history(self):
        """Print formatted call history"""
        print("\n" + "="*60)
        print("API CALL HISTORY")
        print("="*60)
        for i, call in enumerate(self.calls, 1):
            print(f"\nCall {i}:")
            print(f"  Method: {call['method']}")
            print(f"  Time: {call['timestamp']}")
            print(f"  Args: {call['args']}")
            print(f"  Response: {call['response']}")
        print("="*60 + "\n")

def create_test_report(test_id: str, test_name: str, status: str, 
                       duration: float, error: str = None) -> Dict:
    """
    Create a standardized test report
    """
    report = {
        "test_id": test_id,
        "test_name": test_name,
        "status": status,
        "duration_seconds": duration,
        "timestamp": datetime.now().isoformat(),
        "error": error
    }
    return report

def save_test_report(report: Dict, output_dir: str = "test_reports"):
    """
    Save test report to file
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{report['test_id']}_{report['timestamp'].replace(':', '-')}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w') as f:
        json.dump(report, f, indent=2)
    
    return filepath

# Pytest fixtures for traceable testing
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "test_id(id): mark test with a unique test ID for traceability"
    )

class TestIDMarker:
    """
    Decorator to add test IDs to test functions
    """
    @staticmethod
    def mark(test_id: str):
        """Mark a test with an ID"""
        def decorator(func):
            func.test_id = test_id
            return func
        return decorator

# Example usage in tests:
"""
from tests.test_utils import TestLogger, assert_with_log, TestIDMarker

@TestIDMarker.mark("L1-AGENT-EMAIL-RUN-001")
def test_example():
    logger = TestLogger("L1-AGENT-EMAIL-RUN-001", "test_example")
    
    try:
        logger.log("Starting test")
        logger.log_input({"key": "value"})
        
        # Your test logic
        result = some_function()
        
        logger.log_output(result)
        assert_with_log(logger, result is not None, "Result should not be None")
        
        logger.finalize(True)
    except Exception as e:
        logger.log_error(e)
        logger.finalize(False)
        raise
"""
