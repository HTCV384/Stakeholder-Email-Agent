# Testing Guide - Stakeholder Email Outreach System

**Version:** 1.0  
**Last Updated:** December 2025  
**Purpose:** Comprehensive guide for testing the stakeholder email outreach system with traceable, systematic debugging

---

## Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [Test Catalog](#test-catalog)
5. [Debugging Failed Tests](#debugging-failed-tests)
6. [Web Application Integration](#web-application-integration)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

### Test Philosophy

Our testing approach is designed for:
- **Traceability**: Every test has a unique ID for systematic debugging
- **Isolation**: Tests can run independently at any level
- **Speed**: Quick feedback loops for development
- **Reliability**: Consistent results across environments

### Test Statistics

- **Total Tests:** 46+ tests across 4 levels
- **Coverage Target:** 90% overall
- **Execution Time:** ~30 seconds (without live API tests)
- **Model Verified:** ✅ Google Gemini 2.5 Flash via OpenRouter

---

## Test Architecture

### Four-Level Test Pyramid

```
        L4: Live API (7 tests)
       /                      \
      L3: End-to-End (4 tests)
     /                          \
    L2: Integration (9 tests)
   /                              \
  L1: Unit Tests (26+ tests)
```

### Test Levels

| Level | Type | Purpose | Speed | API Calls |
|-------|------|---------|-------|-----------|
| **L1** | Unit | Component testing | Fast (~15s) | No (mocked) |
| **L2** | Integration | Agent interaction | Medium (~10s) | No (mocked) |
| **L3** | End-to-End | Full workflow | Medium (~5s) | No (mocked) |
| **L4** | Live API | Real API integration | Slow (~60s) | Yes (real) |

---

## Running Tests

### Prerequisites

```bash
# Install test dependencies
pip install -r requirements.txt

# Set API key for live tests (optional)
export OPENROUTER_API_KEY='your-api-key'
```

### Quick Reference

```bash
# Quick development tests (L1 only)
./run_tests.sh quick

# Standard pre-commit tests (L1, L2, L3)
./run_tests.sh all

# Full test suite including live API (L1, L2, L3, L4)
./run_tests.sh live

# Verify Gemini 2.5 Flash integration
./run_tests.sh gemini

# Run specific test level
./run_tests.sh unit
./run_tests.sh integration

# Run with coverage report
./run_tests.sh coverage

# Debug mode (verbose output)
./run_tests.sh debug
```

### Manual Test Execution

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/unit/test_email_writer.py -v

# Run specific test class
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent -v

# Run specific test
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_generates_email -v

# Run with verbose output and print statements
pytest tests/unit/test_email_writer.py -v -s

# Run with specific markers
pytest tests/ -v -m "not live"  # Exclude live API tests
pytest tests/ -v -m "live"      # Only live API tests
```

---

## Test Catalog

See [TEST_CATALOG.md](tests/TEST_CATALOG.md) for complete test inventory with IDs.

### Test ID Format

`[LEVEL]-[MODULE]-[COMPONENT]-[NUMBER]`

**Examples:**
- `L1-AGENT-EMAIL-RUN-001`: Unit test for email agent run method
- `L2-ORCHESTRATOR-EXTRACT-001`: Integration test for stakeholder extraction
- `L4-API-MODEL-001`: Live API test for model verification

### Quick Test Lookup

| Test ID Pattern | Location | Purpose |
|----------------|----------|---------|
| L1-LLM-* | tests/unit/test_llm_api.py | LLM client tests |
| L1-PROMPT-* | tests/unit/test_prompts.py | Prompt module tests |
| L1-AGENT-EMAIL-* | tests/unit/test_email_writer.py | Email writer tests |
| L1-AGENT-PLANNER-* | tests/unit/test_task_planner.py | Task planner tests |
| L2-ORCHESTRATOR-* | tests/integration/test_orchestrator.py | Orchestrator integration |
| L3-WORKFLOW-* | tests/integration/test_end_to_end.py | End-to-end workflow |
| L4-API-* | tests/integration/test_live_api.py | Live API integration |

---

## Debugging Failed Tests

### Step-by-Step Debugging Process

#### 1. Identify the Test ID

When a test fails, note the test ID from the output:

```
FAILED tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode
```

Map to Test ID: `L1-AGENT-EMAIL-MODE-001`

#### 2. Look Up Test Details

Check [TEST_CATALOG.md](tests/TEST_CATALOG.md) for:
- Test purpose
- Expected result
- Related components

#### 3. Run Test in Isolation

```bash
# Run with verbose output
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode -v -s

# Run with debugger
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode -v -s --pdb

# Run with full traceback
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode -v --tb=long
```

#### 4. Check Related Tests

If one test fails, check related tests:

```bash
# Run all tests for the same component
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent -v

# Run all tests for the same module
pytest tests/unit/test_email_writer.py -v
```

#### 5. Verify Dependencies

Check if the failure is due to dependencies:

```bash
# Test the LLM client
pytest tests/unit/test_llm_api.py -v

# Test the prompts
pytest tests/unit/test_prompts.py -v
```

### Common Failure Patterns

#### Pattern 1: Mock Response Mismatch

**Symptom:** JSON parsing errors, KeyError  
**Location:** tests/fixtures/mock_llm.py  
**Fix:** Update mock responses to match expected format

```python
# Check mock LLM client
pytest tests/unit/test_llm_api.py -v -s
```

#### Pattern 2: Missing Generation Mode

**Symptom:** KeyError: 'generation_mode'  
**Location:** agents/email_writer.py, agents/task_planner.py  
**Fix:** Ensure all response dicts include generation_mode

#### Pattern 3: Template Field Errors

**Symptom:** KeyError on user_fields  
**Location:** prompts/editable_templates.py  
**Fix:** Verify template structure and required fields

### Debugging Tools

#### Test Logger

Use the TestLogger for traceable debugging:

```python
from tests.test_utils import TestLogger, assert_with_log

def test_example():
    logger = TestLogger("L1-TEST-001", "test_example")
    
    logger.log("Starting test")
    logger.log_input({"key": "value"})
    
    result = some_function()
    
    logger.log_output(result)
    assert_with_log(logger, result is not None, "Result should not be None")
    
    logger.finalize(True)
```

#### Mock API Call Tracker

Track mock API calls for debugging:

```python
from tests.test_utils import MockAPICallTracker

tracker = MockAPICallTracker()
# ... run tests ...
tracker.print_call_history()
```

---

## Web Application Integration

### Error Reporting with Test IDs

When integrating into a web application, include test IDs in error messages:

```python
try:
    email = await email_writer.run(task)
except Exception as e:
    error_message = {
        "error": str(e),
        "test_id": "L1-AGENT-EMAIL-RUN-001",
        "component": "Email Writer Agent",
        "file": "agents/email_writer.py",
        "debug_command": "pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_generates_email -v -s"
    }
    return error_message
```

### Monitoring and Alerting

Track test failures in production:

```python
# Example monitoring integration
def log_test_failure(test_id: str, error: Exception):
    """Log test failure for monitoring"""
    logger.error(f"Test {test_id} failed in production", extra={
        "test_id": test_id,
        "error": str(error),
        "traceback": traceback.format_exc()
    })
    
    # Send to monitoring service
    monitoring_service.track_event("test_failure", {
        "test_id": test_id,
        "component": test_id.split("-")[1]
    })
```

### Health Check Endpoint

Create a health check endpoint that runs critical tests:

```python
@app.get("/health/tests")
async def health_check_tests():
    """Run critical tests and return status"""
    results = {
        "L4-API-MODEL-001": await test_gemini_integration(),
        "L1-AGENT-EMAIL-RUN-001": await test_email_generation(),
        "L2-ORCHESTRATOR-EXTRACT-001": await test_stakeholder_extraction()
    }
    
    all_passed = all(results.values())
    status_code = 200 if all_passed else 503
    
    return JSONResponse(content=results, status_code=status_code)
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run unit tests (L1)
        run: ./run_tests.sh unit
  
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run integration tests (L2, L3)
        run: ./run_tests.sh integration
  
  live-api-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Verify Gemini integration (L4)
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
        run: ./run_tests.sh gemini
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running tests before commit..."
./run_tests.sh quick

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

echo "Tests passed. Proceeding with commit."
```

---

## Best Practices

### For Developers

1. **Run quick tests frequently** during development
2. **Run all tests** before committing
3. **Add test IDs** to new tests following the format
4. **Update TEST_CATALOG.md** when adding tests
5. **Use TestLogger** for traceable debugging

### For CI/CD

1. **Run L1-L3 tests** on every commit
2. **Run L4 tests** only on main branch
3. **Cache dependencies** to speed up builds
4. **Fail fast** on test failures
5. **Report test IDs** in failure notifications

### For Production

1. **Monitor test failures** in production
2. **Include test IDs** in error messages
3. **Create health check endpoints** with critical tests
4. **Set up alerts** for test failures
5. **Review failed tests** regularly

---

## Troubleshooting

### Tests Hang or Timeout

```bash
# Check for infinite loops or blocking calls
pytest tests/ -v --timeout=30
```

### Import Errors

```bash
# Verify Python path
export PYTHONPATH=/path/to/stakeholder_outreach:$PYTHONPATH

# Or run from project root
cd /path/to/stakeholder_outreach
pytest tests/ -v
```

### API Key Issues

```bash
# Verify API key is set
echo $OPENROUTER_API_KEY

# Run without live tests
pytest tests/ -v -m "not live"
```

### Mock Response Issues

```bash
# Test mock LLM client
pytest tests/unit/test_llm_api.py -v -s

# Check mock responses
python3 -c "from tests.fixtures.test_data import *; print(MOCK_EMAIL_GENERATION_RESPONSE)"
```

---

## Maintenance

### Updating Tests

When modifying code:

1. Update affected tests
2. Update TEST_CATALOG.md
3. Run full test suite
4. Update this guide if needed

### Adding New Tests

1. Choose appropriate test level (L1-L4)
2. Assign unique test ID
3. Add to TEST_CATALOG.md
4. Follow naming conventions
5. Add docstrings with purpose
