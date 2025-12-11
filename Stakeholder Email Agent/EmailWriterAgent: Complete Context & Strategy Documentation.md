# EmailWriterAgent: Complete Context & Strategy Documentation

## Overview

The EmailWriterAgent is a specialized AI agent that generates personalized outreach emails to stakeholders using a **Reflection Pattern** (Generate → Evaluate → Refine) for quality assurance.

---

## Input Context

The agent receives a comprehensive task dictionary with the following information:

### Stakeholder Information
- **Name**: Full name of the stakeholder
- **Title**: Professional title/role (e.g., "Chief Medical Officer", "VP of Operations")
- **Details**: Background information extracted from research about their responsibilities, interests, and challenges

### Company Context
- **Company Name**: Name of the target organization
- **Company Summary**: AI-generated summary of the company's business, strategic priorities, and recent developments
- **Relevant Context**: Specific research insights relevant to this stakeholder extracted from the uploaded report

### Generation Configuration
- **Generation Mode**: One of three modes (ai_style, template, custom)
- **Mode Config**: Mode-specific settings (style key, template key, user fields, etc.)

---

## Three-Step Generation Process

### Step 1: Generate Initial Email
Based on the selected generation mode, creates the first draft.

### Step 2: Evaluate Quality
Uses structured evaluation criteria to score the email (0-10 scale):
- **Style Adherence**: Matches requested style?
- **Personalization**: Uses specific stakeholder/company details?
- **Relevance**: Relevant to stakeholder's role and interests?
- **Clarity**: Clear and easy to understand?
- **Call to Action**: Compelling and clear CTA?
- **Professionalism**: Appropriate tone?

**Quality Threshold**: 7.0/10 (emails below this are automatically refined)

### Step 3: Refine (if needed)
If quality score < 7.0, the agent:
1. Reviews evaluation feedback (weaknesses and suggestions)
2. Generates an improved version addressing the issues
3. Maintains strengths from the original draft

---

## Generation Mode 1: AI-Generated Styles

Fully automated email generation using pre-defined style prompts. No user input required beyond selecting the style.

### Available Styles

#### 1. Healthcare Professional
**Target Audience**: Clinical professionals, healthcare executives  
**Tone**: Formal, evidence-based, collegial  
**Key Elements**:
- Clinical terminology and healthcare context
- Focus on patient outcomes and clinical efficacy
- Reference to evidence, data, or best practices
- Regulatory compliance considerations
- Peer-to-peer professional tone
- **Length**: 200-300 words

**Structure**:
1. Professional greeting
2. Clinical context and relevance to their role
3. Solution benefits with focus on patient outcomes
4. Evidence base or supporting data
5. Compliance/regulatory considerations
6. Clear next steps with professional courtesy

---

#### 2. Casual Bro-y
**Target Audience**: Direct decision-makers who appreciate straight talk  
**Tone**: Conversational, urgent, problem-focused  
**Key Elements**:
- Casual greeting (first name, "bro", "hey")
- Short sentences and fragments
- Immediate pain point focus
- Extensive use of "you/your"
- Bullet lists of specific pain points (3-4)
- Arrows (→) for flow
- Direct, almost provocative
- No corporate jargon
- Short timeframe + direct CTA
- **Length**: 150-200 words

**Structure**:
1. Casual opener
2. Immediate problem statement
3. Quick credibility
4. Bullet list of SPECIFIC pain points
5. Solution in plain language
6. How it changes their world
7. Short timeframe + "ready to talk?"

**Example Phrases**:
- "your ED customers are stuck in sepsis alert hell"
- "here's what they're actually struggling with"
- "60 days. ready to talk?"

---

#### 3. Technical and Direct
**Target Audience**: Technical professionals, engineers, IT leaders  
**Tone**: Precise, specification-focused, data-driven  
**Key Elements**:
- Technical terminology used appropriately
- Specifications, capabilities, architecture details
- Technical metrics and performance data
- Integration and compatibility details
- Logical problem → solution → implementation flow
- **Length**: 200-250 words

**Structure**:
1. Direct greeting
2. Technical context and challenge
3. Technical solution with specifications
4. Key capabilities and features
5. Integration or implementation approach
6. Performance or efficiency gains
7. Technical next steps

---

#### 4. Executive Brief
**Target Audience**: C-suite executives, senior leadership  
**Tone**: Concise, strategic, high-level  
**Key Elements**:
- Extremely concise (executives are busy)
- Strategic, high-level perspective
- Business outcomes, not technical details
- ROI, competitive advantage, market position
- Business language: revenue, growth, efficiency, risk
- Get to the point quickly
- **Length**: 150-200 words

**Structure**:
1. Brief, respectful greeting
2. Strategic context (one sentence)
3. Business challenge or opportunity
4. High-level solution and business impact
5. Key outcomes (revenue, efficiency, competitive edge)
6. Executive-appropriate next step
7. Concise closing

---

#### 5. Consultative
**Target Audience**: Potential partners, collaborative relationships  
**Tone**: Collaborative, insightful, partnership-oriented  
**Key Elements**:
- Partnership tone, not vendor pitch
- Demonstrate deep understanding of challenges
- Thoughtful questions to engage
- Share insights or observations
- Mutual value creation focus
- Consultative language: "explore", "collaborate", "understand"
- Discovery-oriented CTA
- **Length**: 200-250 words

**Structure**:
1. Warm, professional greeting
2. Demonstrate understanding of their situation
3. Share relevant insight or observation
4. Pose thoughtful question(s) about their challenges
5. Collaborative solution framing
6. Partnership value proposition
7. Discovery-oriented next step (conversation, not sale)

---

## Generation Mode 2: Editable Templates

Hybrid approach combining user-provided content with AI-generated contextual sections.

### How It Works
1. User fills in template fields (e.g., subject, opening, solution description)
2. AI generates contextual sections specific to the stakeholder (e.g., pain points, application details)
3. Template assembles final email by merging user fields + AI sections

### Available Templates

#### Problem-Solution Template
**User Fields**:
- Subject line
- Opening statement
- Your solution description
- Specific benefits
- Call to action

**AI-Generated Sections**:
- Stakeholder-specific pain points
- Application to their context
- Relevant challenges from research

---

#### Casual Bro-y Template
**User Fields**:
- Subject
- Your achievement/credibility
- Your solution
- Timeframe
- Closing

**AI-Generated Sections**:
- Opening pain point statement
- Specific struggle bullets (3-4)
- Application to their situation

---

#### Partnership Template
**User Fields**:
- Subject
- Partnership vision
- Mutual value propositions (3)
- Next step
- Closing

**AI-Generated Sections**:
- Recognition of their work/achievements
- Alignment section (why partnership makes sense)

---

## Generation Mode 3: Custom Prompt

Advanced mode where users provide their own prompt template with placeholders.

### How It Works
1. User writes a custom prompt with placeholders: `{stakeholder_name}`, `{company_name}`, `{stakeholder_details}`, etc.
2. System substitutes placeholders with actual stakeholder data
3. AI generates email based on the custom prompt

### Available Placeholders
- `{stakeholder_name}` - Full name
- `{stakeholder_title}` - Professional title
- `{stakeholder_details}` - Background and responsibilities
- `{company_name}` - Company name
- `{company_summary}` - AI-generated company summary
- `{relevant_context}` - Research insights relevant to this stakeholder

**Example Custom Prompt**:
```
Write a brief email to {stakeholder_name}, who is the {stakeholder_title} at {company_name}.

Based on this research: {relevant_context}

Focus on how our solution addresses their specific challenge with [specific technology/process].

Tone: Professional but approachable
Length: 150 words
Include: One specific pain point, one benefit, one CTA
```

---

## Evaluation Criteria (Reflection Pattern)

After generating the initial email, the agent evaluates it using these criteria:

### 1. Style Adherence (0-10)
Does the email match the requested style (healthcare professional, casual bro-y, etc.)?

### 2. Personalization (0-10)
Does it use specific details about the stakeholder and company from the research?

### 3. Relevance (0-10)
Is the content relevant to the stakeholder's role, interests, and challenges?

### 4. Clarity (0-10)
Is the message clear, easy to understand, and well-structured?

### 5. Call to Action (0-10)
Is there a compelling, clear, and appropriate call to action?

### 6. Professionalism (0-10)
Is the tone appropriate and professional for the context?

### Overall Score
Average of all six criteria. **Threshold: 7.0/10**

### Evaluation Output
- **Strengths**: List of what works well
- **Weaknesses**: List of issues to address
- **Improvement Suggestions**: Specific, actionable recommendations

---

## Refinement Strategy

When quality score < 7.0, the agent refines the email:

### Refinement Process
1. **Review Feedback**: Analyze weaknesses and improvement suggestions
2. **Maintain Strengths**: Keep what's working well
3. **Address Weaknesses**: Fix identified issues
4. **Implement Suggestions**: Apply specific recommendations
5. **Ensure Style Adherence**: Double-check style guidelines
6. **Maintain Length**: Keep within word count limits

### Refinement Prompt Context
- Original email (subject + body)
- Evaluation feedback (score, weaknesses, suggestions)
- Email style requirements
- Stakeholder context (name, title)

---

## Output Format

Every email generation returns a structured dictionary:

```python
{
    "stakeholder_name": "Dr. John Smith",
    "stakeholder_title": "Chief Medical Officer",
    "email_subject": "Improving Patient Outcomes at Memorial Hospital",
    "email_body": "Dear Dr. Smith,\n\n[Full email body]...",
    "quality_score": 8.5,  # 0.0 to 10.0
    "reflection_notes": "Initial quality score: 8.5/10 | Quality acceptable, no refinement needed",
    "generation_mode": "ai_style"
}
```

---

## Key Design Principles

### 1. Quality Over Speed
The Reflection Pattern ensures every email meets quality standards, even if it requires refinement.

### 2. Context-Driven Personalization
Every email uses specific details from the research report, not generic templates.

### 3. Style Flexibility
Five distinct AI styles + templates + custom prompts support diverse outreach strategies.

### 4. Stakeholder-Centric
Focus on the stakeholder's challenges, role, and interests—not just product features.

### 5. Measurable Quality
Structured evaluation with six specific criteria provides transparency and consistency.

---

## Example: Complete Generation Flow

### Input Task
```python
{
    "stakeholder_name": "Dr. Sarah Johnson",
    "stakeholder_title": "Chief Medical Officer",
    "stakeholder_details": "Oversees clinical operations and quality improvement initiatives. Focused on reducing sepsis mortality rates and improving ED efficiency.",
    "company_name": "Memorial Hospital",
    "company_summary": "500-bed academic medical center with Level 1 trauma center. Strategic priorities include sepsis protocol optimization and ED throughput improvement.",
    "relevant_context": "Recent sepsis mortality audit showed 15% higher rates than national benchmark. ED average wait time 4.2 hours, causing patient satisfaction issues.",
    "generation_mode": "ai_style",
    "mode_config": {
        "style_key": "healthcare_professional"
    }
}
```

### Step 1: Generate Initial Email
**Prompt**: Healthcare Professional style prompt with stakeholder context  
**Output**:
```json
{
    "subject": "Evidence-Based Sepsis Protocol Optimization for Memorial Hospital",
    "body": "Dear Dr. Johnson,\n\nAs Chief Medical Officer at Memorial Hospital, your focus on reducing sepsis mortality rates and improving clinical outcomes aligns directly with recent advances in early detection protocols...\n\n[Full email body]"
}
```

### Step 2: Evaluate
**Evaluation**:
- Style Adherence: 9/10
- Personalization: 8/10
- Relevance: 9/10
- Clarity: 8/10
- Call to Action: 7/10
- Professionalism: 9/10
- **Overall Score: 8.3/10**

**Feedback**:
- Strengths: Clinical terminology, evidence-based focus, personalized context
- Weaknesses: CTA could be more specific
- Suggestions: Include specific timeframe for follow-up

### Step 3: Decision
Quality score 8.3 > 7.0 threshold → **No refinement needed**

### Final Output
```python
{
    "stakeholder_name": "Dr. Sarah Johnson",
    "stakeholder_title": "Chief Medical Officer",
    "email_subject": "Evidence-Based Sepsis Protocol Optimization for Memorial Hospital",
    "email_body": "[Full email body]",
    "quality_score": 8.3,
    "reflection_notes": "Initial quality score: 8.3/10 | Quality acceptable, no refinement needed",
    "generation_mode": "ai_style"
}
```

---

## Technical Implementation Notes

### Error Handling
- If initial generation fails → return error response
- If evaluation fails → return initial email with quality score 0.0
- If refinement fails → return initial email with note about refinement failure

### JSON Parsing
- Strips markdown code blocks (```json ... ```) before parsing
- Handles LLM responses that wrap JSON in formatting

### Quality Threshold
- Default: 7.0/10
- Configurable per agent instance
- Ensures minimum quality standards

### Parallel Execution
- Multiple EmailWriterAgents run in parallel (one per stakeholder)
- Coordinated by TaskPlannerAgent (Layer 2)
- Each agent is independent and stateless

---

## Usage Recommendations

### When to Use AI-Generated Styles
- High-volume outreach campaigns
- Consistent tone across multiple emails
- Time-sensitive campaigns
- When you trust AI to handle personalization

### When to Use Editable Templates
- Brand voice control is critical
- Specific messaging requirements
- Hybrid approach (user + AI collaboration)
- Regulatory or compliance constraints

### When to Use Custom Prompts
- Unique outreach scenarios
- Experimental messaging approaches
- Highly specialized industries
- Advanced users who want full control

---

## Future Enhancement Opportunities

1. **A/B Testing**: Generate multiple variants and track performance
2. **Learning from Feedback**: Incorporate response rates into quality scoring
3. **Industry-Specific Styles**: Healthcare, finance, tech, etc.
4. **Multi-Language Support**: Generate emails in different languages
5. **Tone Adjustment**: Fine-tune formality level within styles
6. **Length Variants**: Short (100 words), Medium (200 words), Long (300 words)
7. **Follow-Up Sequences**: Generate multi-touch email sequences
8. **Sentiment Analysis**: Ensure appropriate emotional tone

---

## Summary

The EmailWriterAgent combines:
- **Rich Context**: Stakeholder details, company insights, research findings
- **Multiple Strategies**: 5 AI styles + templates + custom prompts
- **Quality Assurance**: Reflection pattern with structured evaluation
- **Personalization**: Every email uses specific research insights
- **Flexibility**: Supports diverse outreach approaches and use cases

This comprehensive approach ensures high-quality, personalized emails that resonate with stakeholders and drive engagement.
