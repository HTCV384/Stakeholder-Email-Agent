# Tech Bro Template Analysis

## User's Example Email Analysis

### Structure Breakdown:
```
bro

implemented IntelliSep at 3 hospitals last quarter?

wanna know what they're actually struggling with?

not the test. the test works. they're struggling with:

- 47 sepsis alerts per shift but only 3 are real (alert fatigue killing clinician trust)
- manually cross-referencing your test with vital signs + lactate + blood cultures
- ED throughput tanking because beds stuck waiting for compliance documentation
- compliance officer spending 12 hours/week building SEP-1 reports

we build the AI layer that makes your test WORTH using

intelliSep result comes in → AI validates against other signals → routes to right person → auto-documents compliance bundle → updates ED dashboard

suddenly your customers realize: we didn't just buy a better test. we bought a better hospital.

your stickiness goes from "test they use" to "system they can't live without"

60 days. ready to talk?
```

### Key Characteristics:

1. **Ultra-Casual Tone**
   - Opening: "bro" (single word greeting)
   - Questions instead of statements: "wanna know what they're actually struggling with?"
   - Lowercase throughout (except acronyms)
   - No formal salutations or closings
   - Conversational fragments: "not the test. the test works."

2. **Hook Strategy**
   - Social proof first: "implemented IntelliSep at 3 hospitals last quarter"
   - Curiosity gap: "wanna know what they're actually struggling with?"
   - Pattern interrupt: "not the test. the test works."

3. **Problem Presentation**
   - Real customer pain points (not hospital research data)
   - Specific, visceral details with numbers
   - 4 bullet points showing operational chaos
   - Each bullet has concrete metric + human impact
   - Format: [metric] + (parenthetical insight)

4. **Solution Framing**
   - Not about the product itself, about the "AI layer"
   - System-level value: "makes your test WORTH using"
   - Visual flow diagram with arrows: "→"
   - Transformation narrative: "suddenly your customers realize..."
   - Value shift: "test they use" → "system they can't live without"

5. **Call to Action**
   - Ultra-simple: "60 days. ready to talk?"
   - Timeframe implies speed/urgency
   - Question format (not command)

6. **Length & Pacing**
   - ~150 words
   - Very short sentences and fragments
   - Lots of white space (line breaks between sections)
   - Punchy rhythm

### Psychological Tactics:

1. **Insider Knowledge**: "what they're actually struggling with" (implies you know the real problems)
2. **Contrarian Positioning**: "not the test. the test works" (unexpected, builds credibility)
3. **Specificity = Credibility**: "47 sepsis alerts per shift but only 3 are real"
4. **Emotional Resonance**: "alert fatigue killing clinician trust"
5. **Reframing**: From product feature to business transformation
6. **Urgency Without Pressure**: "60 days" (specific but not pushy)

---

## Current "direct_urgent" AI Style Analysis

### Current Implementation:
- **Tone**: Professional but urgent
- **Structure**: Problem Hook → Solution + Proof → CTA
- **Length**: Under 120 words
- **Focus**: Hospital-specific research data (SEP-1 scores, mortality rates)
- **Evidence**: Requires specific facts from hospital report
- **Style**: Still somewhat formal, uses complete sentences

### Gap Analysis:

| Aspect | User's Example | Current direct_urgent |
|--------|----------------|----------------------|
| **Greeting** | "bro" (ultra-casual) | Formal name/title |
| **Opening** | Social proof + curiosity | Problem statement |
| **Problem Source** | Real customer pain points | Hospital research data |
| **Problem Format** | Bulleted list with metrics + insights | Narrative paragraph |
| **Solution Focus** | System transformation | Product features |
| **Tone** | Lowercase, fragments, casual | Professional, complete sentences |
| **CTA** | "60 days. ready to talk?" | "Brief call to discuss" |
| **Pacing** | Punchy, lots of breaks | Flowing paragraphs |

### Key Differences:

1. **Data Source**: User's example uses **customer implementation pain points** (what happened after they bought), not **prospect research data** (their current metrics)

2. **Value Proposition**: User's example sells **system-level transformation** ("better hospital"), not **product benefits** ("faster test results")

3. **Credibility**: User's example builds trust through **insider knowledge of real implementations**, not **citing prospect's own data back to them**

4. **Tone**: User's example is **peer-to-peer** ("bro"), not **vendor-to-buyer**

---

## Design Recommendation: Two Approaches

### Option 1: New Default Template (Recommended)
**Name**: "Tech Bro / Implementation Reality Check"

**Why Template vs AI Style?**
- This approach is very specific and structured
- Users may want to customize the customer pain points
- Not everyone will want this ultra-casual tone
- Templates allow users to see/edit the exact structure

**Template Structure**:
```
{casual_greeting}

{social_proof_statement}

{curiosity_hook_question}

{pattern_interrupt}

{customer_pain_points_list}

{solution_reframe}

{transformation_narrative}

{simple_cta}
```

### Option 2: Update "direct_urgent" AI Style
**Pros**: 
- Available immediately in AI Styles dropdown
- No user template creation needed

**Cons**:
- Replaces existing style that some users may prefer
- Less customizable
- Harder to see the exact structure

---

## Recommended Implementation: Option 1 (New Template)

### Template Design:

**Name**: "Tech Bro Reality Check"

**Description**: "Ultra-casual, insider-knowledge email that leads with real customer implementation struggles (not prospect data) and reframes value as system transformation"

**Prompt Template**:
```
You are writing an ultra-casual, peer-to-peer email that sounds like insider advice, not a sales pitch.

**CRITICAL STYLE RULES:**
- Use lowercase throughout (except acronyms like SEP-1, ED, CMS)
- Very short sentences and fragments
- Conversational, almost text-message style
- NO formal greetings or sign-offs
- Questions instead of statements when possible
- Lots of white space (line breaks between sections)

**EMAIL STRUCTURE:**

1. **Casual Greeting** (1 word or short phrase)
   - Examples: "bro", "hey", "{stakeholder_name}", "yo"

2. **Social Proof Hook** (1-2 sentences)
   - Reference real implementations or customer count
   - Examples: "implemented IntelliSep at 3 hospitals last quarter", "talked to 12 sepsis coordinators this month"

3. **Curiosity Question** (1 sentence)
   - "wanna know what they're actually struggling with?"
   - "guess what the real bottleneck is?"

4. **Pattern Interrupt** (1 short sentence)
   - Contrarian statement that builds credibility
   - "not the test. the test works."
   - "it's not [expected problem]. it's [unexpected problem]."

5. **Customer Pain Points** (4 bullet points)
   - Each bullet: [specific metric] + (human impact in parentheses)
   - These should be IMPLEMENTATION pain points (what happens after they buy a sepsis test), NOT their current hospital metrics
   - Focus on operational chaos, workflow friction, alert fatigue, manual work
   - Examples:
     * "47 sepsis alerts per shift but only 3 are real (alert fatigue killing clinician trust)"
     * "manually cross-referencing test results with vital signs + lactate + blood cultures"
     * "ED throughput tanking because beds stuck waiting for compliance documentation"
     * "compliance officer spending 12 hours/week building SEP-1 reports"

6. **Solution Reframe** (1-2 sentences)
   - Don't sell the product, sell the "layer" or "system" that makes it work
   - "we build the AI layer that makes your test WORTH using"
   - "we're the integration that turns [product] into [transformation]"

7. **Visual Flow** (1 sentence with arrows)
   - Show the system flow with → symbols
   - "test result comes in → AI validates → routes to right person → auto-documents → updates dashboard"

8. **Transformation Narrative** (2 sentences)
   - "suddenly your customers realize: [realization]"
   - Value shift: "from [commodity] to [strategic asset]"
   - "your stickiness goes from 'test they use' to 'system they can't live without'"

9. **Simple CTA** (1 sentence, question format)
   - Include timeframe
   - "60 days. ready to talk?"
   - "15 min call this week?"

**IMPORTANT - PAIN POINTS MUST BE IMPLEMENTATION STRUGGLES:**
Do NOT use {relevant_context} or {company_summary} for the pain points section. Those are about the hospital's current state.

Instead, the pain points should be GENERIC operational struggles that happen when hospitals implement sepsis testing WITHOUT our AI integration layer:
- Alert fatigue from too many false positives
- Manual data cross-referencing across systems
- Workflow bottlenecks waiting for documentation
- Compliance reporting taking hours of manual work
- Test results not reaching the right clinician fast enough
- ED throughput suffering due to sepsis protocol delays

Use the product report context to understand what problems our solution solves, then describe those problems as customer pain points.

**TONE EXAMPLES:**
✓ "bro, your customers are drowning in alerts"
✓ "wanna know the real problem?"
✓ "not the test. the test works."
✓ "suddenly they realize: we didn't just buy a better test. we bought a better hospital."

✗ "Dear {stakeholder_name}, I hope this email finds you well"
✗ "I noticed that {company_name} has a SEP-1 score of X%"
✗ "Our product offers the following benefits:"

**LENGTH:** 140-170 words total

**Product Context (to understand what problems we solve):**
{product_report_excerpt}

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Role Details: {stakeholder_details}

**Hospital Context (for personalization only, NOT for pain points):**
Hospital: {company_name}
You can reference {company_name} in the email to show it's personalized, but the pain points should be generic implementation struggles, not their specific metrics.

Generate as JSON:
{
  "subject": "Ultra-short, punchy subject (under 40 chars, lowercase preferred)",
  "body": "Email body following the structure above"
}
```

### Why This Design Works:

1. **Maintains User's Voice**: Captures the ultra-casual, insider tone
2. **Structured but Flexible**: Clear sections but LLM can adapt
3. **Solves Data Problem**: Uses generic implementation pain points (don't need hospital research)
4. **Reusable**: Works for any stakeholder at any hospital
5. **Distinctive**: Very different from other templates
6. **High Impact**: Pattern interrupt + transformation narrative = memorable

### Implementation Steps:

1. Add this template to `seed-default-templates.ts`
2. Run seed script to add to database
3. Test with sample stakeholder data
4. Verify tone, length, and structure match user's example

### Expected Output Example:

```
Subject: your sepsis test + our AI = stickiness

hey Sarah

implemented IntelliSep at 3 hospitals last quarter?

wanna know what they're actually struggling with?

not the test. the test works. they're struggling with:

- 47 sepsis alerts per shift but only 3 are real (alert fatigue killing clinician trust)
- manually cross-referencing test results with vital signs + lactate + blood cultures  
- ED throughput tanking because beds stuck waiting for compliance documentation
- compliance officer spending 12 hours/week building SEP-1 reports

we build the AI layer that makes your test WORTH using

test result → AI validates against other signals → routes to right person → auto-documents compliance → updates ED dashboard

suddenly your customers realize: we didn't just buy a better test. we bought a better hospital.

your stickiness goes from "test they use" to "system they can't live without"

60 days. ready to talk?
```

This matches the user's example while being adaptable to different stakeholders and hospitals.
