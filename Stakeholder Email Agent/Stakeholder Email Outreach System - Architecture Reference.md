
**Version:** 1.0  
**Last Updated:** December 2025  
**Purpose:** This document serves as the authoritative reference for the system architecture, agent specifications, and implementation patterns. It is designed to be used by AI coding agents to maintain consistency and context throughout development.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architectural Principles](#architectural-principles)
3. [Agent Hierarchy](#agent-hierarchy)
4. [Agent Specifications](#agent-specifications)
5. [Data Flow & Communication Protocol](#data-flow--communication-protocol)
6. [Implementation Patterns](#implementation-patterns)
7. [File Structure Reference](#file-structure-reference)
8. [Development Guidelines](#development-guidelines)

---

## System Overview

### Purpose
Automate personalized email outreach to key stakeholders identified in customer research reports, using a hierarchical multi-agent system powered by Google Gemini 2.5 Flash via OpenRouter.

### Core Workflow
```
User Input → Report Analysis → Stakeholder Identification → User Selection → 
Parallel Email Generation → Quality Review → Final Output
```

### Technology Stack
- **Language:** Python 3.11+
- **LLM Provider:** OpenRouter (https://openrouter.ai/api/v1)
- **Model:** `google/gemini-2.5-flash`
- **SDK:** OpenAI Python SDK (OpenAI-compatible)
- **Concurrency:** asyncio for parallel agent execution
- **File Reading:** LLM native file reading via file_url content type (PDF, HTML), native file I/O (TXT)
- **Web Framework:** Express + tRPC (Node.js/TypeScript)
- **Frontend:** React 19 + Tailwind CSS 4
- **Database:** MySQL/TiDB (via Drizzle ORM)
- **File Storage:** S3-compatible storage

---

## Architectural Principles

### 1. Hierarchical Multi-Agent System (HMAS)
The system follows a three-layer hierarchy inspired by research on hierarchical multi-agent systems: