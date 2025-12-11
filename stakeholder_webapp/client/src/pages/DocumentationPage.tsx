import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Streamdown } from "streamdown";

// Comprehensive guide content (embedded for simplicity)
const COMPREHENSIVE_GUIDE = `# Stakeholder Email Outreach System: Comprehensive Guide

**Version:** 2.0  
**Last Updated:** December 2025

---

## Table of Contents

1.  [System Overview](#system-overview)
2.  [System Architecture](#system-architecture)
3.  [Email Generation System](#email-generation-system)
4.  [Usage Guide](#usage-guide)
5.  [Testing & Quality Assurance](#testing--quality-assurance)
6.  [Development Guide](#development-guide)

---

## System Overview

### Purpose & Core Workflow

This system automates personalized email outreach to key stakeholders identified in customer research reports. It uses a hierarchical multi-agent system to analyze reports, identify stakeholders, and generate high-quality, context-aware emails in parallel.

**Core Workflow:**
\`\`\`
Report Upload → Stakeholder Extraction → User Selection → Style Configuration → Parallel Email Generation → Quality Review → Final Drafts
\`\`\`

### Technology Stack

-   **Language:** Python 3.11+
-   **LLM Provider:** OpenRouter
-   **Core Model:** \`google/gemini-2.5-flash\`
-   **Concurrency:** \`asyncio\`
-   **Web Backend:** FastAPI (Node.js/Express with tRPC)
-   **Web Frontend:** React, TypeScript, TailwindCSS

---

## System Architecture

### Architectural Principles

-   **Hierarchical Multi-Agent System (HMAS):** A three-layer hierarchy (Strategy, Planning, Execution) provides clear separation of concerns.
-   **Concurrent Orchestration:** A fan-out/fan-in pattern enables parallel email generation for multiple stakeholders, maximizing efficiency.
-   **Reflection Pattern:** Each execution agent self-evaluates and refines its output to ensure high quality.

### Agent Hierarchy

The system is composed of three layers of agents:

| Agent | Layer | Responsibilities |
| :--- | :--- | :--- |
| **Orchestrator** | 1 (Strategy) | Manages the end-to-end workflow, user interaction, and coordinates sub-agents. |
| **Task Planner** | 2 (Planning) | Decomposes the main goal into parallel sub-tasks and prepares context for each. |
| **Email Writer** | 3 (Execution) | Executes a single task (email generation) and implements the reflection pattern. |

### Data Flow & Communication

Communication between agents uses JSON-serializable Python dictionaries. The flow is sequential from Layer 1 to 3 and back.

1.  **User Input** is received by the **Orchestrator**.
2.  The **Orchestrator** extracts stakeholders and gets user selection.
3.  It delegates to the **Task Planner**, providing context.
4.  The **Task Planner** creates and dispatches tasks to multiple **Email Writer** agents in parallel.
5.  **Email Writers** execute, refine, and return results.
6.  The **Task Planner** aggregates results and returns them to the **Orchestrator**.
7.  The **Orchestrator** presents the final drafts to the user.

---

## Email Generation System

The system offers three modes for email generation, providing a spectrum of control vs. automation.

### Mode 1: AI-Generated Styles

Fully automated generation based on pre-defined style prompts. The user chooses a style, and the AI handles the rest.

**Available Styles:**
-   **Professional to Healthcare Professional:** Formal, evidence-based, clinical.
-   **Casual Bro-y:** Direct, conversational, urgent.
-   **Technical and Direct:** Specification-focused, data-driven.
-   **Executive Brief:** Strategic, high-level, concise.
-   **Consultative:** Collaborative, problem-solving, question-based.

### Mode 2: User-Editable Templates

A hybrid approach where the user customizes pre-structured templates. The AI fills in context-specific details around the user-provided content.

**Template Structure:**
-   **User-Editable Fields:** Subject, Opening, Key Benefits, Call to Action.
-   **AI-Generated Fields:** Context/Problem Statement, Specific Application to Stakeholder.

### Mode 3: Custom User Prompts

Provides complete user control. The user writes their own detailed prompt, and the system injects contextual variables (\`{stakeholder_name}\`, \`{company_summary}\`, etc.) before sending it to the LLM.

---

## Usage Guide

### Web Application Interface

The web app provides a user-friendly graphical interface for the entire workflow:

1.  **Report Upload:** Drag-and-drop a research report file.
2.  **Stakeholder Selection:** Review the automatically extracted stakeholders and select targets with checkboxes.
3.  **Style Configuration:**
    -   Select one of the three generation modes.
    -   Choose a style, edit a template, or write a custom prompt.
4.  **Draft Review:** View generated emails, quality scores, and reflection notes side-by-side.
5.  **Debug Console:** A console view shows agent logs and error messages with associated test IDs for traceability.
6.  **Export:** Download generated emails as markdown.

---

## Testing & Quality Assurance

### Test Architecture & Strategy

A four-level test pyramid ensures robust quality assurance:
-   **L1: Unit Tests:** Isolate and test individual components.
-   **L2: Integration Tests:** Verify agent interactions.
-   **L3: End-to-End Tests:** Validate the full workflow with mocked APIs.
-   **L4: Live API Tests:** Confirm real-world integration with the Gemini 2.5 Flash model.

### Quality Assurance Process

Each email goes through a reflection pattern:

1. **Generation:** Initial email created using stakeholder context
2. **Evaluation:** Self-assessment against 6 quality criteria:
   - Style adherence
   - Personalization
   - Relevance
   - Clarity
   - Call to action
   - Professionalism
3. **Refinement:** If quality score < 7.0, email is automatically refined

---

## Development Guide

### File Structure

\`\`\`
stakeholder_webapp/
├── client/              # React frontend
│   └── src/
│       ├── pages/      # Page components
│       └── components/ # Reusable UI components
├── server/              # Node.js backend
│   ├── agentic_system/ # Python AI agents
│   ├── routers.ts      # tRPC API routes
│   └── db.ts           # Database queries
└── drizzle/            # Database schema
\`\`\`

### Key Technologies

-   **Frontend:** React 19, TypeScript, TailwindCSS, shadcn/ui
-   **Backend:** Node.js, Express, tRPC
-   **AI System:** Python, asyncio, OpenRouter
-   **Database:** MySQL/TiDB with Drizzle ORM
-   **Storage:** AWS S3 for file uploads

---

## Support & Resources

For issues or questions:
1. Check the debug console for agent logs and test IDs
2. Review error messages for specific test identifiers
3. Verify your OpenRouter API key is configured correctly

**Model Information:**
- Provider: OpenRouter
- Model: google/gemini-2.5-flash
- Documentation: https://openrouter.ai/docs
`;

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Extract headings for table of contents
    const headings = document.querySelectorAll(".markdown-content h2, .markdown-content h3");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  const tocItems = [
    { id: "system-overview", label: "System Overview" },
    { id: "system-architecture", label: "System Architecture" },
    { id: "email-generation-system", label: "Email Generation System" },
    { id: "usage-guide", label: "Usage Guide" },
    { id: "testing--quality-assurance", label: "Testing & Quality Assurance" },
    { id: "development-guide", label: "Development Guide" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold">Documentation</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Contents
                </h3>
                <nav className="space-y-1">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-2 px-3 rounded-md text-sm transition-colors ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {activeSection === item.id && (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="markdown-content prose prose-slate dark:prose-invert max-w-none">
                    <Streamdown>{COMPREHENSIVE_GUIDE}</Streamdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
