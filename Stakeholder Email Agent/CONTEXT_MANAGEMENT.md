# Context Management Architecture

## Overview

This document describes the context management system that maintains conversation history across the multi-agent workflow to improve coherence and allow agents to reference earlier analysis.

## Design Principles

**1. Workflow-Level Context**
- Each workflow maintains a single conversation thread
- Context accumulates as agents process the workflow
- All agents share access to the same conversation history

**2. Message Structure**
- Standard OpenAI message format: `{role: "system" | "user" | "assistant", content: string}`
- System messages set agent behavior
- User messages contain inputs (report, stakeholder info)
- Assistant messages contain agent outputs

**3. Context Flow**

```
Workflow Start
    ↓
[System: Orchestrator instructions]
[User: Full report text]
    ↓
Orchestrator extracts stakeholders
    ↓
[Assistant: Stakeholder list + Company summary]
    ↓
User selects stakeholders
    ↓
[User: Selected stakeholders for email generation]
    ↓
Task Planner creates parallel tasks
    ↓
[Assistant: Task plan with stakeholder contexts]
    ↓
Email Writers generate emails (parallel, each with full context)
    ↓
[Assistant: Generated emails with quality scores]
    ↓
Workflow Complete
```

## Implementation

### 1. Context Storage

**Database Table: `conversation_messages`**
```sql
CREATE TABLE conversation_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflowId INT NOT NULL,
  role ENUM('system', 'user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  agent VARCHAR(50), -- orchestrator, task_planner, email_writer
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES workflows(id)
);
```

### 2. LLMClient Updates

**Current (Stateless)**
```python
async def chat_completion(self, messages: list) -> dict:
    response = await self.client.chat.completions.create(
        model=self.model,
        messages=messages
    )
    return response
```

**New (Context-Aware)**
```python
async def chat_completion(
    self, 
    messages: list,
    conversation_history: list = None
) -> dict:
    # Merge conversation history with new messages
    full_context = (conversation_history or []) + messages
    
    response = await self.client.chat.completions.create(
        model=self.model,
        messages=full_context
    )
    return response
```

### 3. Agent Updates

**OrchestratorAgent**
- Receives: Empty or minimal context
- Adds: System prompt + report analysis
- Returns: Stakeholder list + company summary + updated context

**TaskPlannerAgent**
- Receives: Full context from orchestrator
- Adds: Selected stakeholders + task planning
- Returns: Task assignments + updated context

**EmailWriterAgent**
- Receives: Full context from task planner
- Adds: Stakeholder-specific email generation
- Returns: Generated email + updated context

### 4. Context Management Strategy

**Token Budget Management**
- Monitor total context tokens
- Implement context summarization if approaching limits
- Gemini 2.5 Flash: 1M token context window (very large)

**Context Pruning (if needed)**
1. Keep all system messages
2. Keep final stakeholder extraction results
3. Keep company summary
4. Summarize intermediate reasoning
5. Keep current stakeholder context for email generation

## Benefits

**1. Improved Coherence**
- Email writer can reference company analysis from orchestrator
- Consistent terminology across all generated emails
- Better understanding of stakeholder relationships

**2. Better Quality**
- LLM has full context when evaluating email quality
- Refinement can reference original analysis
- More accurate quality scores

**3. Debugging**
- Full conversation history stored in database
- Can replay entire workflow
- Easier to identify where issues occur

**4. Future Enhancements**
- User can ask follow-up questions about generated emails
- System can explain its reasoning
- Can implement "regenerate with changes" feature

## Trade-offs

**Advantages:**
- Better coherence and quality
- Richer debugging information
- Enables future conversational features

**Disadvantages:**
- Higher token costs (context accumulates)
- Slightly slower (more tokens to process)
- More complex state management

## Token Cost Estimation

**Example Workflow:**
- Report: 10,000 tokens
- Stakeholder extraction: 2,000 tokens
- Company summary: 500 tokens
- 4 stakeholders × 1,000 tokens each: 4,000 tokens
- **Total context per email: ~16,500 tokens**

With 4 stakeholders:
- Input tokens: 16,500 × 4 = 66,000 tokens
- Output tokens: ~2,000 × 4 = 8,000 tokens
- **Total: ~74,000 tokens per workflow**

Gemini 2.5 Flash pricing:
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- **Cost per workflow: ~$0.008 (less than 1 cent)**

## Implementation Plan

1. ✅ Design architecture
2. Update database schema with conversation_messages table
3. Update LLMClient to accept conversation_history parameter
4. Update OrchestratorAgent to build initial context
5. Update TaskPlannerAgent to append to context
6. Update EmailWriterAgent to use full context
7. Update bridge.py to manage context across steps
8. Update workflowRouter to store/retrieve context from DB
9. Test complete workflow
10. Update documentation

## Testing Strategy

**Unit Tests:**
- Test context merging in LLMClient
- Test context building in each agent
- Test context storage/retrieval from DB

**Integration Tests:**
- Test full workflow with context enabled
- Verify context accumulates correctly
- Compare email quality with/without context

**Manual Testing:**
- Review generated emails for coherence
- Check if emails reference company analysis
- Verify debug console shows context history
