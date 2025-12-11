# Research Notes: Agentic Workflow Architecture

## Source 1: 7 Design Patterns for Agentic Systems (Medium/MongoDB)
URL: https://medium.com/mongodb/here-are-7-design-patterns-for-agentic-systems-you-need-to-know-d74a4b5835a5

### Key Takeaways:
- **Agentic systems exist on a spectrum** — from controlled workflows to autonomous agents, defined by how much decision-making authority is given to LLMs
- **Start simple, scale smart** — Begin with basic patterns and only add complexity with clear evidence of benefit, as autonomy increases costs and debugging difficulty

### Design Patterns Overview:

1. **Controlled Workflows Pattern**
   - Well-defined sequence of subtasks
   - Some subtasks handled by LLMs
   - Goal: Retain reliable and/or deterministic outcomes despite LLM usage
   - Best for: Tasks that can be decomposed into clear sequential steps

2. **Reflection Pattern**
   - Iterative refinement of LLM responses based on human-like feedback
   - LLMs used as evaluators
   - Evaluation criteria should be clearly defined
   - Best for: Tasks requiring iterative refinement for accuracy, reliability, or cohesiveness

3. **Single-Agent Pattern**
   - What people typically refer to as "AI agents"
   - LLMs determine the sequence of steps required to complete tasks
   - Takes actions with tools and reasons through results
   - Extremely flexible and capable of handling complex tasks
   - Requires access to the right tools

### Key Distinctions:
- **Agents vs Earlier Patterns**: Main difference is that agents use LLMs to determine the sequence of steps, rather than following predetermined paths
- Agents reason through previous action results to inform next actions

## Application to Our Use Case:
For the stakeholder email outreach system, we need:
- Report analysis (could use controlled workflow)
- Stakeholder identification (structured extraction)
- User selection interface (programmatic)
- Email generation per stakeholder (multi-agent or single-agent with specialized prompts)
- Style adherence (reflection pattern for quality control)

Next: Continue research on multi-agent orchestration patterns and hierarchical architectures


## Source 2: AI Agent Orchestration Patterns (Microsoft Azure)
URL: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns

### Multi-Agent System Advantages:
When using multiple AI agents, complex problems can be broken down into specialized units of work or knowledge. This approach mirrors strategies found in human teamwork and provides several advantages compared to monolithic single-agent solutions:

- **Specialization**: Individual agents can focus on a specific domain or capability, which reduces code and prompt complexity
- **Scalability**: Agents can be added or modified without redesigning the entire system
- **Maintainability**: Testing and debugging can be focused on individual agents, which reduces the complexity of these tasks
- **Optimization**: Each agent can use distinct models, task-solving approaches, knowledge, tools, and compute to achieve its outcomes

### Orchestration Patterns Identified:

#### 1. Sequential Orchestration
- Tasks processed in a defined order
- Each agent completes its work before passing to the next
- Similar to pipeline or chain-of-responsibility pattern
- Best for: Tasks requiring specific order of operations or cumulative context

#### 2. Concurrent Orchestration (Fan-out/Fan-in)
- All agents work in parallel
- Reduces overall run time
- Provides comprehensive coverage of the problem space
- Results from each agent are often aggregated to return final result
- Agents operate independently without handing off results to each other
- Supports both deterministic calls to all registered agents and dynamic selection

**When to use:**
- Tasks that can run in parallel
- Tasks benefiting from multiple independent perspectives (technical, business, creative approaches)
- Multi-agent decision-making: brainstorming, ensemble reasoning, quorum/voting-based decisions
- Time-sensitive scenarios where parallel processing reduces latency

**When to avoid:**
- Agents need to build on each other's work
- Task requires specific order of operations
- Resource constraints make parallel processing inefficient
- No clear conflict resolution strategy for contradictory results

**Example**: Financial services firm evaluating stocks with 4 specialized agents running in parallel (fundamental analysis, technical analysis, sentiment analysis, ESG analysis)

#### 3. Group Chat Orchestration
- Agents communicate in a shared conversation space
- Can build on each other's contributions

#### 4. Handoff Orchestration
- Agents pass control to specialized agents based on task requirements
- Similar to routing or delegation patterns

#### 5. Magentic Orchestration
- Dynamic orchestration based on task characteristics

## Application to Stakeholder Email Outreach System:

Based on these patterns, our system should use:

1. **Sequential Orchestration** for the main workflow:
   - Report Analysis Agent → Stakeholder Extraction Agent → User Selection Interface → Email Generation Orchestrator

2. **Concurrent Orchestration** for email generation:
   - Once user selects stakeholders, spawn parallel email generation agents
   - Each agent specializes in generating one email for one stakeholder
   - All agents use the same style guidelines but personalize based on stakeholder info
   - Results aggregated and presented to user

3. **Reflection Pattern** for quality control:
   - Each email generation can include self-evaluation step
   - Ensures style adherence and compelling content

Next: Research hierarchical agent architectures and implementation frameworks


## Source 3: Hierarchical Multi-Agent Systems (HMAS)
URL: https://overcoffee.medium.com/hierarchical-multi-agent-systems-concepts-and-operational-considerations-e06fff0bea8c

### Core Concept:
Hierarchical Multi-Agent Systems orchestrate and organize AI agents in a tree-like fashion. At the top (root node) is an elected leader agent that interprets the user's objective, formulates a high-level plan, and assigns work to sub-agents. Sub-agents may delegate smaller tasks to specialized workers operating within specific modalities (code, vision, speech, retrieval, etc.).

### Key Benefits:
- **Structured decomposition** distributes labor across the system
- **Deep specialization** - agents focus on specific capabilities
- **Efficient parallelism** - better than flat swarm of peer agents
- **Clearer reasoning paths** - hierarchical structure provides transparency

### Three Canonical Layers:

**Layer 1 (Strategy)**: Houses the leader/orchestrator that decides priorities and order

**Layer 2 (Planning)**: Re-expresses priorities and creates subtasks for specialized agents

**Layer 3 (Execution)**: Contains workers that perform scoped work (code generation, API calls, image inference, research synthesis, etc.)

Note: Often referred to as multi-agent orchestration framework or agent-supervisor architecture

### Research Evidence & Patterns:

**HuggingGPT** (Shen et al., 2023): Conversational LLM as universal planner, routing sub-prompts to specialized models for vision, audio, code

**AutoGen** (Wu et al., 2023): Lightweight dispatcher breaking jobs into pieces, delivering to models or tool APIs

**MetaGPT** (Hong et al., 2023-24): Hard-coded roles (project manager, architect, coder, tester) with embedded SOPs for cross-checking outputs

**HALO** (Hou et al., 2025): Added Monte-Carlo Tree Search and adaptive prompt-refinement, achieving 14-19 percentage point improvements on reasoning and code-generation benchmarks

**Puppeteer** (Dang et al., 2025): Dynamic orchestration using reinforcement learning to decide which agent to invoke next, can skip low-value branches to cut costs while maintaining quality

### Trade-offs:

**Static Hierarchies:**
- Pros: Simplify mental models
- Cons: Struggle with task complexity and agent quantity growth (all sub-agents report through same chain)

**Dynamic Orchestration:**
- Pros: Better scalability
- Cons: Requires learning loop and refined telemetry to avoid thrashing

**Universal Constraint:** LLM calls are expensive - parallel execution and selective pruning help but compute budgets remain critical

### Operational Considerations (SRE Perspective):

HMAS resembles distributed micro-service mesh, requiring:
- **Observability**: Tracing across leader, planners, and workers
- **Redundancy**: Leader redundancies or RAFT elections against single-root failure
- **Fault tolerance**: Circuit breakers, retry logic, dead-letter queues
- **Resource management**: Admission control, resource quotas (policy engines like Kyverno)
- **Fallback strategies**: Planners should reroute subtasks or return partial results when workers fail

### Key Principle:
"Use hierarchy to sharpen focus, but engineer for dynamism and resilience"

## Recommended Architecture for Stakeholder Email Outreach:

Based on research, we should implement a **Hierarchical Multi-Agent System with Dynamic Orchestration**:

**Layer 1 (Strategy) - Orchestrator Agent:**
- Receives user inputs (research report, email style)
- Analyzes report to extract stakeholder information
- Presents stakeholders to user for selection
- Coordinates overall workflow

**Layer 2 (Planning) - Task Planner Agent:**
- Takes selected stakeholders and creates individual email generation tasks
- Assigns context (stakeholder info, company info, style requirements) to each task
- Manages parallel execution of email generation

**Layer 3 (Execution) - Email Writer Agents:**
- Specialized agents that generate individual emails
- Each agent receives: stakeholder profile, company context, style guidelines
- Uses reflection pattern for self-evaluation and quality control
- Returns generated email with confidence score

**Aggregation & Quality Control:**
- Collect all generated emails
- Optional: Quality review agent evaluates adherence to style and compelling nature
- Present results to user for review and editing

Next: Research OpenRouter API integration and implementation frameworks


## Source 4: OpenRouter API Integration
URL: https://openrouter.ai/docs/quickstart

### OpenRouter Overview:
OpenRouter provides a unified API that gives access to hundreds of AI models through a single endpoint, while automatically handling fallbacks and selecting the most cost-effective options.

### API Integration Approach:
OpenRouter is **OpenAI-compatible**, meaning we can use the OpenAI Python SDK with a different base URL:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="<OPENROUTER_API_KEY>"
)

completion = client.chat.completions.create(
    model="google/gemini-2.5-flash",
    messages=[
        {"role": "user", "content": "What is the meaning of life?"}
    ]
)
```

### Gemini 2.5 Flash Model Details:
URL: https://openrouter.ai/google/gemini-2.5-flash

**Model Identifier**: `google/gemini-2.5-flash`

**Specifications:**
- Created: June 17, 2025
- Context window: 1,048,576 tokens (1M+ tokens)
- Pricing: $0.30/M input tokens, $2.50/M output tokens, $1/M audio tokens

**Capabilities:**
- State-of-the-art workhorse model for advanced reasoning, coding, mathematics, and scientific tasks
- Built-in "thinking" capabilities for greater accuracy and nuanced context handling
- Configurable through "max tokens for reasoning" parameter
- Multimodal support (text, image, audio, video)

**Performance:**
- Latency: 0.44-1.06s (varies by provider)
- Throughput: 88-93 tokens/second
- Uptime: 97-99% across providers

### Key Features for Our Use Case:
1. **OpenAI-compatible API** - Easy integration with existing tools
2. **Automatic fallbacks** - Routes to best available provider
3. **Cost-effective** - Competitive pricing for high-quality model
4. **High context window** - Can handle large research reports
5. **Strong reasoning** - Excellent for stakeholder analysis and email generation

## Implementation Strategy:

### Technology Stack:
- **API**: OpenRouter (OpenAI-compatible)
- **Model**: Gemini 2.5 Flash (`google/gemini-2.5-flash`)
- **Language**: Python 3
- **SDK**: OpenAI Python SDK with custom base URL
- **Architecture**: Hierarchical Multi-Agent System

### Agent Communication:
- Agents will communicate via structured JSON messages
- Each agent will have specific system prompts defining its role
- Use function calling for structured outputs where needed

Next: Design detailed architecture and create implementation specifications
