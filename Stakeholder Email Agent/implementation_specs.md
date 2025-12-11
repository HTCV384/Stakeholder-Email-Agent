# Implementation Specifications & Code Structure

## 1. Introduction

This document provides the detailed implementation specifications and proposed code structure for the automated stakeholder email outreach system. It builds upon the architecture defined in the Architecture Design document and provides a concrete plan for development.

## 2. Technology Stack

- **Programming Language:** Python 3.11+
- **LLM API Provider:** OpenRouter
- **LLM Model:** Google Gemini 2.5 Flash (`google/gemini-2.5-flash`)
- **API Library:** `openai` Python SDK (leveraging OpenAI compatibility)
- **Concurrency:** `asyncio` for managing parallel agent execution

## 3. Project Structure

The project will be organized into the following directory structure to ensure modularity and maintainability:

```
stakeholder_outreach/
├── main.py                 # Main application entry point
├── agents/
│   ├── __init__.py
│   ├── base_agent.py       # Abstract base class for all agents
│   ├── orchestrator.py     # Orchestrator Agent implementation
│   ├── task_planner.py     # Task Planner Agent implementation
│   └── email_writer.py       # Email Writer Agent implementation
├── utils/
│   ├── __init__.py
│   └── llm_api.py          # Wrapper for OpenRouter API calls
├── prompts/
│   ├── __init__.py
│   ├── orchestrator_prompts.py
│   ├── task_planner_prompts.py
│   └── email_writer_prompts.py
├── reports/                  # Directory for input research reports
│   └── sample_report.txt
└── outputs/                  # Directory for generated emails
    └── generated_emails.md
```

## 4. Core Components

### 4.1. OpenRouter API Wrapper (`utils/llm_api.py`)

A simple wrapper will be created to handle interactions with the OpenRouter API. This centralizes API logic and makes it easy to switch models or providers in the future.

```python
# utils/llm_api.py
from openai import OpenAI
import os

class LLMClient:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY")
        )

    def get_completion(self, model, messages, max_tokens=2048):
        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error calling LLM API: {e}")
            return None
```

### 4.2. Agent Base Class (`agents/base_agent.py`)

An abstract base class will define the common interface for all agents.

```python
# agents/base_agent.py
from abc import ABC, abstractmethod
from utils.llm_api import LLMClient

class Agent(ABC):
    def __init__(self, name):
        self.name = name
        self.llm_client = LLMClient()

    @abstractmethod
    async def run(self, *args, **kwargs):
        pass
```

### 4.3. Agent Implementations

Each agent will inherit from the `Agent` base class and implement its specific logic. System prompts will be stored in the `prompts/` directory to keep them separate from the agent code.

**Orchestrator Agent (`agents/orchestrator.py`)**
- Manages the high-level workflow.
- Interacts with the user for input and output.
- Coordinates the Task Planner and Email Writer agents.

**Task Planner Agent (`agents/task_planner.py`)**
- Takes the list of selected stakeholders.
- Gathers context from the research report for each stakeholder.
- Creates structured tasks for the Email Writer agents.

**Email Writer Agent (`agents/email_writer.py`)**
- Receives a single task with stakeholder context and style guidelines.
- Generates a personalized email.
- Uses a reflection step (a second LLM call) to review and refine the email based on quality criteria.

## 5. Communication Protocol

Agents will communicate using simple Python dictionaries, which can be easily serialized to JSON if needed. This ensures a clear and consistent data flow between agents.

**Example Task for Email Writer Agent:**
```json
{
    "stakeholder_name": "Dr. Evelyn Reed",
    "stakeholder_title": "Chief Research Officer",
    "stakeholder_details": "... excerpts from the report about Dr. Reed's work ...",
    "company_name": "InnovateCorp",
    "company_details": "... general information about InnovateCorp from the report ...",
    "email_style": "Formal and direct, focusing on research collaboration."
}
```

## 6. Main Application Logic (`main.py`)

The main entry point will orchestrate the entire process:

1.  Initialize the `OrchestratorAgent`.
2.  Load the research report.
3.  Run the orchestrator, which will:
    a.  Call the LLM to identify stakeholders.
    b.  Prompt the user to select stakeholders.
    c.  Instantiate and run the `TaskPlannerAgent`.
    d.  Instantiate and run the `EmailWriterAgent`s in parallel using `asyncio.gather()`.
    e.  Collect the generated emails.
    f.  (Optional) Run the `QualityReviewAgent`.
    g.  Present the final emails to the user and save them to a file.

## 7. Getting Started

To run the application, the user will need to:

1.  Install the required Python packages: `openai`, `python-dotenv`.
2.  Set the `OPENROUTER_API_KEY` environment variable.
3.  Place the research report in the `reports/` directory.
4.  Run the main script: `python main.py`
