#!/bin/bash
# Test runner script for stakeholder outreach system
# Provides easy commands for running different test suites

set -e

echo "========================================"
echo "Stakeholder Outreach System - Test Runner"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    print_error "pytest is not installed. Installing..."
    pip3 install pytest pytest-asyncio
fi

# Parse command line arguments
TEST_SUITE=${1:-all}

case $TEST_SUITE in
    unit)
        print_info "Running unit tests only..."
        pytest tests/unit/ -v -m "not live"
        ;;
    
    integration)
        print_info "Running integration tests (without live API calls)..."
        pytest tests/integration/ -v -m "not live"
        ;;
    
    live)
        print_info "Running live API tests (requires OPENROUTER_API_KEY)..."
        if [ -z "$OPENROUTER_API_KEY" ]; then
            print_error "ERROR: OPENROUTER_API_KEY environment variable not set"
            exit 1
        fi
        pytest tests/integration/test_live_api.py -v -s
        ;;
    
    quick)
        print_info "Running quick tests (unit tests only)..."
        pytest tests/unit/ -v -m "not live and not slow"
        ;;
    
    all)
        print_info "Running all tests (excluding live API tests)..."
        pytest tests/ -v -m "not live"
        ;;
    
    coverage)
        print_info "Running tests with coverage report..."
        if ! command -v pytest-cov &> /dev/null; then
            print_error "pytest-cov is not installed. Installing..."
            pip3 install pytest-cov
        fi
        pytest tests/ -v -m "not live" --cov=agents --cov=prompts --cov=utils --cov-report=html --cov-report=term
        print_success "Coverage report generated in htmlcov/index.html"
        ;;
    
    debug)
        print_info "Running tests in debug mode..."
        pytest tests/ -v -s -m "not live" --tb=long
        ;;
    
    gemini)
        print_info "Testing Gemini 2.5 Flash integration..."
        if [ -z "$OPENROUTER_API_KEY" ]; then
            print_error "ERROR: OPENROUTER_API_KEY environment variable not set"
            exit 1
        fi
        pytest tests/integration/test_live_api.py::TestLiveAPIIntegration::test_model_name_verification -v -s
        pytest tests/integration/test_live_api.py::TestLiveAPIIntegration::test_simple_completion -v -s
        ;;
    
    help|--help|-h)
        echo "Usage: ./run_tests.sh [TEST_SUITE]"
        echo ""
        echo "Available test suites:"
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests (no live API)"
        echo "  live        - Run live API tests (requires API key)"
        echo "  quick       - Run quick tests (unit tests, no slow tests)"
        echo "  all         - Run all tests except live API (default)"
        echo "  coverage    - Run tests with coverage report"
        echo "  debug       - Run tests in debug mode with verbose output"
        echo "  gemini      - Test Gemini 2.5 Flash integration specifically"
        echo "  help        - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh unit"
        echo "  ./run_tests.sh live"
        echo "  ./run_tests.sh gemini"
        exit 0
        ;;
    
    *)
        print_error "Unknown test suite: $TEST_SUITE"
        echo "Run './run_tests.sh help' for usage information"
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    print_success "✓ All tests passed!"
else
    print_error "✗ Some tests failed"
    exit 1
fi
