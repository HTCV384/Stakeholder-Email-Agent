# Test Catalog - Stakeholder Email Outreach System

**Purpose:** This document provides a complete catalog of all tests with unique IDs for traceability and systematic debugging.

---

## Test Organization

### Test Levels
- **L1: Unit Tests** - Individual component testing
- **L2: Integration Tests** - Agent interaction testing  
- **L3: End-to-End Tests** - Complete workflow testing
- **L4: Live API Tests** - Real API integration testing

### Test ID Format
`[LEVEL]-[MODULE]-[COMPONENT]-[TEST_NUMBER]`

Example: `L1-PROMPT-AI_STYLE-001`

---

## Unit Tests (L1)

### L1-LLM: LLM API Client Tests
**File:** `tests/unit/test_llm_api.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L1-LLM-INIT-001 | test_initialization | Verify client initializes with correct model | Client created with gemini-2.5-flash |
| L1-LLM-CALL-001 | test_get_completion_basic | Test basic completion request | Returns valid string response |
| L1-LLM-CALL-002 | test_get_completion_with_parameters | Test completion with custom params | Accepts and processes parameters |
| L1-LLM-TRACK-001 | test_get_completion_tracks_calls | Verify call counting | Call count increments correctly |
| L1-LLM-TRACK-002 | test_get_completion_stores_last_messages | Verify message storage | Last messages stored correctly |
| L1-LLM-RESET-001 | test_reset | Test client reset functionality | Call count and messages reset |

### L1-PROMPT: Prompt Module Tests
**File:** `tests/unit/test_prompts.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L1-PROMPT-AI_STYLE-001 | test_all_styles_exist | Verify all 5 AI styles defined | All styles present in registry |
| L1-PROMPT-AI_STYLE-002 | test_get_style_prompt | Test style retrieval | Returns complete style config |
| L1-PROMPT-AI_STYLE-003 | test_get_invalid_style | Test invalid style handling | Returns None gracefully |
| L1-PROMPT-AI_STYLE-004 | test_list_available_styles | Test style listing | Returns 5 styles with metadata |
| L1-PROMPT-AI_STYLE-005 | test_casual_broy_style_exists | Verify casual bro-y style | Style properly defined |
| L1-PROMPT-AI_STYLE-006 | test_healthcare_professional_style_exists | Verify healthcare style | Style properly defined |
| L1-PROMPT-AI_STYLE-007 | test_style_prompts_have_placeholders | Verify placeholder presence | All required placeholders present |
| L1-PROMPT-TEMPLATE-001 | test_all_templates_exist | Verify all 3 templates defined | All templates present |
| L1-PROMPT-TEMPLATE-002 | test_get_template | Test template retrieval | Returns complete template config |
| L1-PROMPT-TEMPLATE-003 | test_get_invalid_template | Test invalid template handling | Returns None gracefully |
| L1-PROMPT-TEMPLATE-004 | test_list_available_templates | Test template listing | Returns 3 templates with metadata |
| L1-PROMPT-TEMPLATE-005 | test_casual_broy_template_exists | Verify casual template | Template properly defined |
| L1-PROMPT-TEMPLATE-006 | test_template_user_fields | Verify user fields | Required fields present |
| L1-PROMPT-CUSTOM-001 | test_build_custom_prompt | Test custom prompt building | Prompt built with context |
| L1-PROMPT-CUSTOM-002 | test_validate_custom_prompt_valid | Test valid prompt validation | Returns True |
| L1-PROMPT-CUSTOM-003 | test_validate_custom_prompt_empty | Test empty prompt validation | Returns False with error |
| L1-PROMPT-CUSTOM-004 | test_validate_custom_prompt_too_short | Test short prompt validation | Returns False with error |
| L1-PROMPT-CUSTOM-005 | test_validate_custom_prompt_too_long | Test long prompt validation | Returns False with error |
| L1-PROMPT-CUSTOM-006 | test_get_example_prompts | Test example retrieval | Returns 3 examples |

### L1-AGENT-EMAIL: Email Writer Agent Tests
**File:** `tests/unit/test_email_writer.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L1-AGENT-EMAIL-RUN-001 | test_run_generates_email | Test basic email generation | Returns complete email dict |
| L1-AGENT-EMAIL-MODE-001 | test_run_with_ai_style_mode | Test AI style mode | Generates email in AI style mode |
| L1-AGENT-EMAIL-MODE-002 | test_run_with_template_mode | Test template mode | Generates email in template mode |
| L1-AGENT-EMAIL-MODE-003 | test_run_with_custom_mode | Test custom prompt mode | Generates email in custom mode |
| L1-AGENT-EMAIL-QUALITY-001 | test_quality_threshold_triggers_refinement | Test refinement trigger | Low quality triggers refinement |
| L1-AGENT-EMAIL-ERROR-001 | test_error_handling_for_invalid_mode | Test invalid mode handling | Fallback to ai_style |
| L1-AGENT-EMAIL-FORMAT-001 | test_format_output | Test output formatting | Returns properly formatted dict |
| L1-AGENT-EMAIL-ERROR-002 | test_error_response | Test error response generation | Returns error response |

### L1-AGENT-PLANNER: Task Planner Agent Tests
**File:** `tests/unit/test_task_planner.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L1-AGENT-PLANNER-RUN-001 | test_run_creates_tasks_and_generates_emails | Test task creation and execution | Creates tasks for all stakeholders |
| L1-AGENT-PLANNER-TASK-001 | test_create_task_for_stakeholder | Test single task creation | Task dict properly structured |
| L1-AGENT-PLANNER-CONTEXT-001 | test_extract_relevant_context | Test context extraction | Extracts relevant context string |
| L1-AGENT-PLANNER-PARALLEL-001 | test_parallel_execution | Test parallel processing | All stakeholders processed |

---

## Integration Tests (L2)

### L2-ORCHESTRATOR: Orchestrator Agent Integration Tests
**File:** `tests/integration/test_orchestrator.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L2-ORCHESTRATOR-EXTRACT-001 | test_extract_stakeholders | Test stakeholder extraction | Returns list of stakeholders |
| L2-ORCHESTRATOR-SUMMARY-001 | test_get_company_summary | Test company summary generation | Returns summary string |
| L2-ORCHESTRATOR-SELECT-001 | test_present_stakeholders_for_selection | Test selection interface | Returns selected stakeholders |
| L2-ORCHESTRATOR-SELECT-002 | test_present_stakeholders_select_subset | Test subset selection | Returns correct subset |
| L2-ORCHESTRATOR-E2E-001 | test_run_end_to_end_mock | Test full workflow with mocks | Generates emails for selected stakeholders |

---

## End-to-End Tests (L3)

### L3-WORKFLOW: Complete Workflow Tests
**File:** `tests/integration/test_end_to_end.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L3-WORKFLOW-AI_STYLE-001 | test_full_workflow_ai_style_mode | Test complete AI style workflow | End-to-end success with AI styles |
| L3-WORKFLOW-TEMPLATE-001 | test_full_workflow_template_mode | Test complete template workflow | End-to-end success with templates |
| L3-WORKFLOW-CUSTOM-001 | test_full_workflow_custom_mode | Test complete custom workflow | End-to-end success with custom prompts |
| L3-WORKFLOW-PARALLEL-001 | test_parallel_email_generation | Test parallel execution | Multiple emails generated concurrently |

---

## Live API Tests (L4)

### L4-API: Live OpenRouter/Gemini Tests
**File:** `tests/integration/test_live_api.py`

| Test ID | Test Name | Purpose | Expected Result |
|---------|-----------|---------|-----------------|
| L4-API-INIT-001 | test_client_initialization | Verify real client init | Client created with correct config |
| L4-API-BASIC-001 | test_simple_completion | Test basic API call | Returns response from Gemini 2.5 Flash |
| L4-API-JSON-001 | test_json_output | Test JSON generation | Returns valid JSON structure |
| L4-API-STAKEHOLDER-001 | test_stakeholder_extraction_prompt | Test stakeholder extraction | Extracts stakeholders correctly |
| L4-API-EMAIL-001 | test_email_generation_prompt | Test email generation | Generates email with subject/body |
| L4-API-MODEL-001 | test_model_name_verification | Verify Gemini 2.5 Flash usage | Confirms correct model |
| L4-API-ERROR-001 | test_error_handling_invalid_api_key | Test error handling | Returns None on auth error |

---

## Test Execution Matrix

### Quick Test (Development)
```bash
./run_tests.sh quick
```
**Runs:** L1-* (Unit tests only)  
**Duration:** ~15 seconds  
**Use Case:** Rapid development iteration

### Standard Test (Pre-commit)
```bash
./run_tests.sh all
```
**Runs:** L1-*, L2-*, L3-* (All except live API)  
**Duration:** ~30 seconds  
**Use Case:** Before committing code

### Full Test (CI/CD)
```bash
./run_tests.sh live
```
**Runs:** L1-*, L2-*, L3-*, L4-* (All tests including live API)  
**Duration:** ~60 seconds  
**Use Case:** CI/CD pipeline, release validation

### Gemini Verification
```bash
./run_tests.sh gemini
```
**Runs:** L4-API-MODEL-001, L4-API-BASIC-001  
**Duration:** ~5 seconds  
**Use Case:** Verify Gemini 2.5 Flash integration

---

## Debugging Guide

### When a Test Fails

1. **Identify the Test ID** from the failure output
2. **Look up the test** in this catalog
3. **Check the test file** and line number
4. **Review the purpose** and expected result
5. **Run the specific test** in isolation:
   ```bash
   pytest tests/[file].py::[TestClass]::[test_name] -v -s
   ```

### Example Debugging Session

```bash
# Test fails: L1-AGENT-EMAIL-MODE-001
# 1. Look up in catalog: tests/unit/test_email_writer.py
# 2. Run in isolation with verbose output
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode -v -s

# 3. Add breakpoint if needed
pytest tests/unit/test_email_writer.py::TestEmailWriterAgent::test_run_with_ai_style_mode -v -s --pdb

# 4. Check mock LLM responses
pytest tests/unit/test_llm_api.py -v -s
```

---

## Test Coverage Requirements

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| agents/ | 90% | ✓ Implemented |
| prompts/ | 95% | ✓ Implemented |
| utils/ | 85% | ✓ Implemented |
| Overall | 90% | ✓ Target Met |

---

## Web Application Integration Notes

### Test IDs in Web UI
When implementing the web application, use test IDs for:
- **Error reporting**: Include test ID in error messages
- **Monitoring**: Track which tests fail in production
- **Debugging**: Quick identification of failure points

### Example Error Message
```
Error in email generation (L1-AGENT-EMAIL-MODE-001 failed)
Component: Email Writer Agent
Issue: AI style mode generation failed
Check: tests/unit/test_email_writer.py line 45
```

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Run Unit Tests
  run: ./run_tests.sh unit
  id: L1_tests

- name: Run Integration Tests  
  run: ./run_tests.sh integration
  id: L2_L3_tests

- name: Verify Gemini Integration
  run: ./run_tests.sh gemini
  id: L4_gemini_test
```

---

## Maintenance

**Last Updated:** December 2025  
**Test Count:** 37 tests across 4 levels  
**Update Frequency:** Update this catalog when adding/modifying tests  
**Owner:** Development Team
