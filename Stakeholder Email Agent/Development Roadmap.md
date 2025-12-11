# Development Roadmap

**Project:** Stakeholder Email Outreach System  
**Architecture Reference:** See `ARCHITECTURE.md`

---

## Purpose

This document provides a step-by-step implementation plan designed for agentic coding. Each phase is self-contained with clear inputs, outputs, and success criteria. This structure prevents context window overflow and ensures consistent implementation.

---

## Phase 1: Infrastructure Setup ✓

**Goal:** Create foundational components with no business logic dependencies

### Tasks

#### Task 1.1: LLM API Wrapper
- **File:** `utils/llm_api.py`
- **Dependencies:** None
- **Reference:** ARCHITECTURE.md § Implementation Patterns > Pattern 4
- **Success Criteria:**
  - Can initialize with OpenRouter API key
  - Can make chat completion requests
  - Returns string response or None on error
  - Includes error handling and logging

#### Task 1.2: Base Agent Class
- **File:** `agents/base_agent.py`
- **Dependencies:** `utils/llm_api.py`
- **Reference:** ARCHITECTURE.md § Agent Specifications
- **Success Criteria:**
  - Abstract base class with `run()` method
  - Initializes LLMClient
  - Provides common agent interface

**Status:** ✓ COMPLETED

---

## Phase 2: Prompt Engineering

**Goal:** Define all system prompts before implementing agent logic

### Tasks

#### Task 2.1: Orchestrator Prompts
- **File:** `prompts/orchestrator_prompts.py`
- **Dependencies:** None
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 1
- **Prompts to Create:**
  1. `STAKEHOLDER_EXTRACTION_PROMPT` - Extract stakeholders from report as JSON
  2. `COMPANY_SUMMARY_PROMPT` - Summarize company/customer information

**Success Criteria:**
- Prompts include clear output format specifications
- Include placeholder markers for variable injection (e.g., `{report}`)
- JSON structure matches Data Flow specification

#### Task 2.2: Task Planner Prompts
- **File:** `prompts/task_planner_prompts.py`
- **Dependencies:** None
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 2
- **Prompts to Create:**
  1. `CONTEXT_EXTRACTION_PROMPT` - Extract relevant report sections for specific stakeholder

**Success Criteria:**
- Prompt focuses on relevance filtering
- Maintains context about stakeholder role

#### Task 2.3: Email Writer Prompts
- **File:** `prompts/email_writer_prompts.py`
- **Dependencies:** None
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 3
- **Prompts to Create:**
  1. `EMAIL_GENERATION_PROMPT` - Generate personalized email
  2. `EMAIL_EVALUATION_PROMPT` - Evaluate email quality (reflection pattern)
  3. `EMAIL_REFINEMENT_PROMPT` - Refine email based on evaluation

**Success Criteria:**
- Generation prompt includes style guidelines injection
- Evaluation prompt returns structured feedback with quality score
- Refinement prompt incorporates previous draft and feedback

**Status:** ⏳ IN PROGRESS

---

## Phase 3: Agent Implementation (Bottom-Up)

**Goal:** Implement agents in dependency order (Layer 3 → Layer 2 → Layer 1)

### Task 3.1: Email Writer Agent (Layer 3)
- **File:** `agents/email_writer.py`
- **Dependencies:** 
  - `agents/base_agent.py`
  - `prompts/email_writer_prompts.py`
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 3

**Implementation Steps:**

1. **Create class structure:**
```python
from agents.base_agent import Agent
from prompts.email_writer_prompts import *

class EmailWriterAgent(Agent):
    def __init__(self, name):
        super().__init__(name)
```

2. **Implement `async run(task: Dict) -> Dict`:**
   - Call `_generate_initial_email()`
   - Call `_evaluate_email()`
   - If quality_score < 7.0, call `_refine_email()`
   - Return structured output

3. **Implement helper methods:**
   - `_generate_initial_email(task: Dict) -> str`
   - `_evaluate_email(email: str, task: Dict) -> Dict`
   - `_refine_email(email: str, evaluation: Dict, task: Dict) -> str`

**Success Criteria:**
- Agent can process a single task independently
- Implements reflection pattern (generate → evaluate → refine)
- Returns structured output matching specification
- Handles LLM API errors gracefully

**Test Input:**
```python
task = {
    "stakeholder_name": "Dr. Jane Smith",
    "stakeholder_title": "CTO",
    "stakeholder_details": "Leads AI research initiatives...",
    "company_name": "TechCorp",
    "company_summary": "Leading AI company...",
    "relevant_context": "Recent focus on LLM applications...",
    "email_style": "Professional and technical"
}
```

**Expected Output:**
```python
{
    "stakeholder_name": "Dr. Jane Smith",
    "stakeholder_title": "CTO",
    "email_subject": "...",
    "email_body": "...",
    "quality_score": 8.5,
    "reflection_notes": "..."
}
```

---

### Task 3.2: Task Planner Agent (Layer 2)
- **File:** `agents/task_planner.py`
- **Dependencies:**
  - `agents/base_agent.py`
  - `agents/email_writer.py`
  - `prompts/task_planner_prompts.py`
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 2

**Implementation Steps:**

1. **Create class structure:**
```python
from agents.base_agent import Agent
from agents.email_writer import EmailWriterAgent
from prompts.task_planner_prompts import *
import asyncio

class TaskPlannerAgent(Agent):
    def __init__(self, name):
        super().__init__(name)
```

2. **Implement `async run(stakeholders, report, company_summary, email_style) -> List[Dict]`:**
   - For each stakeholder, call `_create_task_for_stakeholder()`
   - Create EmailWriterAgent instances
   - Execute in parallel using `asyncio.gather()`
   - Return aggregated results

3. **Implement helper methods:**
   - `_create_task_for_stakeholder(stakeholder, report, company_summary, email_style) -> Dict`
   - `_extract_relevant_context(stakeholder, report) -> str`

**Success Criteria:**
- Creates correct task structure for each stakeholder
- Executes Email Writer Agents in parallel
- Aggregates results correctly
- Handles partial failures (some agents succeed, others fail)

**Reference Pattern:**
```python
# Pattern 2: Parallel Email Generation (ARCHITECTURE.md)
email_tasks = [
    EmailWriterAgent(f"EmailWriter-{i}").run(task)
    for i, task in enumerate(tasks)
]
emails = await asyncio.gather(*email_tasks)
```

---

### Task 3.3: Orchestrator Agent (Layer 1)
- **File:** `agents/orchestrator.py`
- **Dependencies:**
  - `agents/base_agent.py`
  - `agents/task_planner.py`
  - `prompts/orchestrator_prompts.py`
- **Reference:** ARCHITECTURE.md § Agent Specifications > Agent 1

**Implementation Steps:**

1. **Create class structure:**
```python
from agents.base_agent import Agent
from agents.task_planner import TaskPlannerAgent
from prompts.orchestrator_prompts import *
import json

class OrchestratorAgent(Agent):
    def __init__(self):
        super().__init__("Orchestrator")
```

2. **Implement `async run(report_path: str, email_style: str) -> List[Dict]`:**
   - Load report from file
   - Extract stakeholders using `_extract_stakeholders()`
   - Extract company summary using `_get_company_summary()`
   - Present stakeholders for user selection
   - Instantiate and run TaskPlannerAgent
   - Return final results

3. **Implement helper methods:**
   - `_extract_stakeholders(report: str) -> List[Dict]`
   - `_get_company_summary(report: str) -> str`
   - `_present_stakeholders_for_selection(stakeholders: List[Dict]) -> List[Dict]`

**Success Criteria:**
- Correctly parses JSON from LLM responses
- Handles user input for stakeholder selection
- Coordinates TaskPlannerAgent execution
- Returns complete results with all emails

---

## Phase 4: Integration & Main Application

**Goal:** Create user-facing entry point and documentation

### Task 4.1: Main Application
- **File:** `main.py`
- **Dependencies:** All agents
- **Reference:** ARCHITECTURE.md § Implementation Patterns

**Implementation Steps:**

1. **Create main entry point:**
```python
import asyncio
from agents.orchestrator import OrchestratorAgent
import os

async def main():
    # Check for API key
    # Get user inputs (report path, email style)
    # Run orchestrator
    # Save results to outputs/
    # Display summary
```

2. **Add CLI interface:**
   - Accept command-line arguments for report path and style
   - Provide helpful error messages
   - Display progress indicators

**Success Criteria:**
- Can run end-to-end workflow
- Saves results to `outputs/` directory
- Provides clear user feedback
- Handles missing API key gracefully

---

### Task 4.2: Documentation
- **Files:** `README.md`, `requirements.txt`
- **Dependencies:** None

**README.md Contents:**
1. Project overview
2. Installation instructions
3. Configuration (API key setup)
4. Usage examples
5. Email style options
6. Troubleshooting

**requirements.txt:**
```
openai>=1.0.0
python-dotenv>=1.0.0
```

**Success Criteria:**
- New user can set up and run the system
- All dependencies documented
- Clear examples provided

---

## Phase 5: Testing & Refinement

**Goal:** Validate system behavior and improve quality

### Task 5.1: Create Sample Report
- **File:** `reports/sample_report.txt`
- **Content:** Realistic customer research report with 3-5 stakeholders

### Task 5.2: End-to-End Testing
- Run with sample report
- Test different email styles
- Verify parallel execution
- Check output quality

### Task 5.3: Error Handling Validation
- Test with invalid API key
- Test with malformed report
- Test with LLM API timeout
- Verify graceful degradation

---

## Implementation Checklist

Use this checklist to track progress:

- [x] Phase 1: Infrastructure Setup
  - [x] Task 1.1: LLM API Wrapper
  - [x] Task 1.2: Base Agent Class

- [ ] Phase 2: Prompt Engineering
  - [x] Task 2.1: Orchestrator Prompts
  - [ ] Task 2.2: Task Planner Prompts
  - [ ] Task 2.3: Email Writer Prompts

- [ ] Phase 3: Agent Implementation
  - [ ] Task 3.1: Email Writer Agent
  - [ ] Task 3.2: Task Planner Agent
  - [ ] Task 3.3: Orchestrator Agent

- [ ] Phase 4: Integration
  - [ ] Task 4.1: Main Application
  - [ ] Task 4.2: Documentation

- [ ] Phase 5: Testing
  - [ ] Task 5.1: Sample Report
  - [ ] Task 5.2: End-to-End Testing
  - [ ] Task 5.3: Error Handling

---

## Context Window Management Strategy

### For AI Coding Agents:

1. **Always start by reading:**
   - `ARCHITECTURE.md` (full context)
   - This file (current phase)
   - Relevant prompt file (if implementing agent)

2. **When implementing a component:**
   - Read only the specific Task section
   - Reference the Agent Specification in ARCHITECTURE.md
   - Check Data Flow section for input/output formats

3. **When stuck:**
   - Re-read the Agent Specifications section
   - Check Implementation Patterns section
   - Review Common Pitfalls section

4. **Before committing code:**
   - Verify against Success Criteria
   - Check that output format matches specification
   - Ensure error handling is present

---

**Current Phase:** Phase 2 (Prompt Engineering)  
**Next Task:** Task 2.2 - Task Planner Prompts

**To continue development, an AI agent should:**
1. Read ARCHITECTURE.md § Agent Specifications > Agent 2
2. Read this file § Phase 2 > Task 2.2
3. Implement prompts in `prompts/task_planner_prompts.py`
4. Update checklist above
5. Move to next task


---

## Phase 6: Web Application Development

**Goal:** Create a modern web interface for the system.

### Task 6.1: Initialize Web Project
- **Tool:** `webdev_init_project`
- **Project Name:** `stakeholder_webapp`
- **Features:** `web-db-user` (for potential future user management)

### Task 6.2: Backend API Implementation
- **Framework:** FastAPI
- **Key Endpoints:**
    - `POST /upload`: Upload research report.
    - `POST /start-workflow`: Initiate the email generation process.
    - `GET /status/{task_id}`: Check the status of a generation task.
    - `GET /results/{task_id}`: Retrieve the final generated emails.
    - `GET /docs`: Serve the comprehensive documentation.

### Task 6.3: Frontend UI Implementation
- **Framework:** React, TypeScript
- **Key Components:**
    - `ReportUploader`: Drag-and-drop file upload.
    - `StakeholderSelector`: Interactive list for stakeholder selection.
    - `StyleConfigurator`: Tabbed interface for the three generation modes.
    - `DraftViewer`: Side-by-side view of email drafts and metadata.
    - `DebugConsole`: Real-time log and error display.
    - `DocsViewer`: Markdown renderer for documentation.

### Task 6.4: Integration
- Connect frontend components to backend API endpoints.
- Ensure seamless data flow and state management.

---

## Phase 7: Final Testing & Delivery

**Goal:** Deliver a fully tested and documented web application.

- **Task 7.1:** End-to-end testing of the web application.
- **Task 7.2:** Finalize all documentation.
- **Task 7.3:** Package the complete system for delivery.


---

## Implementation Status Update (December 10, 2025)

### Completed Phases

**Phase 1: Infrastructure Setup** ✅  
**Phase 2: Prompt Engineering** ✅  
**Phase 3: Agent Implementation** ✅  
**Phase 4: Integration** ✅  
**Phase 5: Testing & Refinement** ✅

All original phases have been completed successfully. The Python-based agentic system is fully functional with verified LLM file reading capability.

---

## Phase 6: Web Application Development ✅

**Goal:** Create a modern web interface for the agentic workflow

### Task 6.1: Project Initialization
- **Status:** ✅ COMPLETED
- **Technology:** React 19 + Tailwind 4 + Express 4 + tRPC 11
- **Features:** Manus OAuth, MySQL/TiDB database, S3 storage

### Task 6.2: Database Schema
- **Status:** ✅ COMPLETED
- **Tables:** workflows, stakeholders, emails, logs
- **ORM:** Drizzle ORM with MySQL

### Task 6.3: Backend API (tRPC Procedures)
- **Status:** ✅ COMPLETED
- **Endpoints:**
  - `workflow.uploadReport` - Upload file to S3
  - `workflow.startExtraction` - Start stakeholder extraction
  - `workflow.getWorkflow` - Get workflow status
  - `workflow.updateStakeholderSelection` - Update selections
  - `workflow.generateEmails` - Generate emails
  - `workflow.getEmails` - Get generated emails
  - `workflow.getLogs` - Get debug logs
  - `workflow.exportEmails` - Export to markdown

### Task 6.4: Python Bridge
- **Status:** ✅ COMPLETED
- **Implementation:** Node.js spawn subprocess with stdin/stdout JSON communication
- **Features:** Environment isolation, error handling, log streaming

### Task 6.5: Frontend UI Components
- **Status:** ✅ COMPLETED
- **Components:**
  - File upload interface with drag-and-drop
  - Workflow progress tracker
  - Stakeholder selection interface
  - Email generation mode selector (AI styles, templates, custom)
  - Email draft review interface
  - Debug console
  - Documentation viewer

### Task 6.6: Integration Testing
- **Status:** ⚠️ IN PROGRESS
- **Completed:**
  - LLM file reading verified
  - File upload to S3 working
  - Frontend-backend communication working
- **Pending:**
  - Complete end-to-end workflow test
  - Fix workflow completion issue
  - Fix log streaming

---

## Phase 7: LLM File Reading Enhancement ✅

**Goal:** Replace text extraction with native LLM file reading

### Task 7.1: Update LLMClient
- **Status:** ✅ COMPLETED
- **Changes:** Added support for multimodal content with `file_url` type

### Task 7.2: Update Agents
- **Status:** ✅ COMPLETED
- **Changes:**
  - OrchestratorAgent accepts `report_input` (file URL or text)
  - TaskPlannerAgent passes file URLs through workflow
  - EmailWriterAgent uses conversation history

### Task 7.3: Update Workflow Router
- **Status:** ✅ COMPLETED
- **Changes:** Upload files to S3 and pass URLs to Python bridge

### Task 7.4: Verification Testing
- **Status:** ✅ COMPLETED
- **Results:** Gemini 2.5 Flash successfully reads PDF from S3 URL and extracts structured JSON

---

## Phase 8: Context Management Implementation ✅

**Goal:** Implement multi-turn conversation context for improved coherence

### Task 8.1: Design Context Architecture
- **Status:** ✅ COMPLETED
- **Document:** `CONTEXT_MANAGEMENT.md`

### Task 8.2: Update LLMClient
- **Status:** ✅ COMPLETED
- **Changes:** Added `conversation_history` parameter

### Task 8.3: Update Agents
- **Status:** ✅ COMPLETED
- **Changes:**
  - OrchestratorAgent builds initial context
  - TaskPlannerAgent inherits and extends context
  - EmailWriterAgent uses full conversation history

---

## Phase 9: Bug Fixes & Stabilization (Current Phase)

**Goal:** Resolve remaining issues and ensure reliable workflow completion

### Task 9.1: Fix Workflow Completion
- **Status:** ⏳ IN PROGRESS
- **Issue:** Extraction completes but doesn't update database status
- **Action Items:**
  - Debug Python bridge response handling
  - Add comprehensive error logging
  - Test with MedStar Franklin PDF

### Task 9.2: Resolve Python Environment
- **Status:** ⏳ IN PROGRESS
- **Issue:** SRE module mismatch with uv Python 3.13
- **Current Workaround:** Explicit Python 3.11 path + PYTHONPATH
- **Action Items:**
  - Consider containerization
  - Or use virtual environment with explicit activation

### Task 9.3: Implement Log Streaming
- **Status:** ⏳ IN PROGRESS
- **Issue:** Agent logs not propagating to frontend debug console
- **Action Items:**
  - Implement proper log streaming from Python to Node.js
  - Update database log insertion
  - Test debug console display

### Task 9.4: Error Handling Improvements
- **Status:** ⏳ IN PROGRESS
- **Action Items:**
  - Better error messages for users
  - Graceful handling of rate limits
  - Retry logic for transient failures

---

## Phase 10: Enhancement Features (Future)

**Goal:** Add advanced features for improved user experience

### Task 10.1: Workflow History Dashboard
- **Status:** 📋 PLANNED
- **Features:**
  - List all past workflows
  - Filter and search functionality
  - Resume or duplicate workflows
  - Usage statistics

### Task 10.2: Email Draft Editing
- **Status:** 📋 PLANNED
- **Features:**
  - Inline editor for subject and body
  - Regenerate individual emails
  - Save edited versions

### Task 10.3: A/B Testing
- **Status:** 📋 PLANNED
- **Features:**
  - Generate multiple variants per stakeholder
  - Compare quality scores
  - Select best version

### Task 10.4: Batch Processing
- **Status:** 📋 PLANNED
- **Features:**
  - Upload multiple reports
  - Parallel processing
  - Queue management
  - Bulk export

---

## Development Best Practices

### Architecture-First Approach

Before making any code changes:
1. Review `ARCHITECTURE.md` for current system design
2. Review `DEVELOPMENT_ROADMAP.md` for implementation plan
3. Update architecture documents with proposed changes
4. Implement changes following documented patterns
5. Update documentation to reflect actual implementation

See `DEVELOPMENT_PROCESS.md` for detailed workflow.

### Context Window Management

To prevent context loss during agentic coding:
- Keep each task focused and self-contained
- Reference architecture documents for specifications
- Use bottom-up implementation (Layer 3 → Layer 2 → Layer 1)
- Test each component independently before integration
- Document all design decisions in architecture files

### Testing Strategy

- **Unit Tests:** Test individual components in isolation
- **Integration Tests:** Test agent interactions and workflows
- **End-to-End Tests:** Test complete workflow from upload to export
- **Performance Tests:** Test with large files and multiple stakeholders

See `TESTING_GUIDE.md` for comprehensive testing documentation.

---

*This roadmap is maintained as a living document and updated as the project evolves. All completed phases are marked with ✅, in-progress phases with ⏳, and planned phases with 📋.*
