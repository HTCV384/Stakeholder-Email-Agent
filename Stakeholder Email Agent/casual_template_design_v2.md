# Casual Tech Bro Template - Refined Design

## Context

User received this email from a vendor selling AI integration TO Cytovale:

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

## User's Structure Analysis

1. **Casual hi** - peer-to-peer greeting
2. **Recent customer facts** - "implemented IntelliSep at 3 hospitals last quarter" (shows they know YOUR business)
3. **"Let me tell you something you don't know about your customers"** - the hook
4. **Value proposition** - what they offer
5. **Facts about continuing sepsis care WITHOUT the product** - the gap
6. **Offer that vendor can add value** - their solution
7. **How does it do it** - mechanism
8. **Value prop to customer on improving KPI** - the win
9. **Simple call to action** - timeframe + question

## Adaptation for Cytovale → Hospital Sales

### Key Changes:

1. **Greeting**: "hi" or "hey {name}" (not "bro" - that's too casual for B2B healthcare)
2. **Recent facts**: Use hospital-specific data from research report (SEP-1 scores, mortality rates, CMS penalties)
3. **Hook**: "let me tell you something about your sepsis patients you might not see in the data"
4. **Pattern interrupt**: Validate their current approach, then reveal hidden problem
5. **Hidden problem**: What's happening with sepsis care that metrics don't capture (clinical delays, workflow friction, alert fatigue)
6. **IntelliSep value**: How we solve the hidden problem (not just faster test, but better workflow)
7. **Mechanism**: Flow with arrows showing how IntelliSep changes the process
8. **Outcome**: Specific KPI improvement (mortality reduction, compliance improvement, cost savings)
9. **CTA**: Simple timeframe + question

### Template Structure:

```
**Section 1: Casual Greeting + Recent Hospital Facts**
hi {stakeholder_name}

saw {company_name}'s [specific metric from research - e.g., "68% SEP-1 compliance" or "22% sepsis mortality"]

**Section 2: Hook - "Something You Don't Know"**
wanna know what's happening with your sepsis patients that doesn't show up in the data?

**Section 3: Pattern Interrupt**
your team is doing the right things. [validate their current approach - e.g., "following bundles, ordering labs, documenting"]

but here's what's actually happening:

**Section 4: Hidden Problem (3-4 bullets)**
- [specific clinical delay with metric] (human impact)
- [specific workflow friction] (operational impact)  
- [specific alert/data overload] (clinician trust impact)
- [specific compliance burden] (resource impact)

**Section 5: IntelliSep Value-Add**
IntelliSep gives you [specific capability] that [solves hidden problem]

**Section 6: Mechanism (Flow with Arrows)**
[current state] → IntelliSep result in under 8 min → [clinical decision] → [workflow improvement] → [outcome]

**Section 7: Outcome (KPI Improvement)**
suddenly your team realizes: we're not just testing faster. we're [specific transformation - e.g., "saving lives earlier" or "catching sepsis before it escalates"]

[specific KPI]: from [current state from research] to [improved state with IntelliSep]

**Section 8: Simple CTA**
[timeframe]. ready to talk?
```

## Full Template Prompt

```
You are writing an ultra-casual, insider-knowledge email to a healthcare stakeholder. The tone is peer-to-peer, not vendor-to-buyer.

**CRITICAL STYLE RULES:**
- Use lowercase throughout (except acronyms like SEP-1, ED, CMS, NPV)
- Very short sentences and fragments
- Conversational, almost text-message style
- NO formal greetings ("Dear...") or sign-offs ("Sincerely...")
- Questions instead of statements when possible
- Lots of white space (line breaks between sections)
- Use arrows (→) to show process flow

**EMAIL STRUCTURE:**

**1. Casual Greeting + Recent Hospital Facts** (2-3 sentences)
- Start with "hi {stakeholder_name}" or "hey {stakeholder_name}"
- Reference a SPECIFIC metric from {relevant_context} or {company_summary}
- Examples:
  * "hi Sarah, saw Memorial's 68% SEP-1 compliance"
  * "hey John, noticed your ED sepsis mortality at 22%"
  * "hi Dr. Chen, read about your CMS star rating drop to 3 stars"

**2. Hook - "Something You Don't Know"** (1 sentence, question format)
- "wanna know what's happening with your sepsis patients that doesn't show up in the data?"
- "guess what your sepsis team is struggling with that metrics don't capture?"
- "let me tell you something about your sepsis workflow you might not see"

**3. Pattern Interrupt** (2 sentences)
- Validate their current approach first (builds credibility)
- "your team is doing the right things. following bundles, ordering labs, documenting."
- "you're hitting the protocols. your clinicians know sepsis."
- Then transition: "but here's what's actually happening:"

**4. Hidden Problem** (3-4 bullet points)
- Each bullet: [specific clinical/operational issue with metric] (human/operational impact in parentheses)
- These should be REAL problems that happen in sepsis care, informed by {relevant_context} if available
- Focus on: clinical delays, workflow friction, alert fatigue, compliance burden, data overload
- Examples:
  * "lactate results taking 90+ minutes while patient deteriorates (treatment delays killing outcomes)"
  * "nurses checking vitals every 15 min but sepsis risk score still manual (alert fatigue, missed escalations)"
  * "ED beds stuck waiting for SEP-1 bundle documentation (throughput tanking, boarding times up)"
  * "sepsis coordinator spending 10 hours/week building compliance reports (resource drain)"

**5. IntelliSep Value-Add** (1-2 sentences)
- Don't just say "faster test" - explain the CAPABILITY it unlocks
- "IntelliSep gives you objective sepsis risk in under 8 minutes - before clinical deterioration"
- "IntelliSep tells you who's actually at risk - not just who has SIRS criteria"
- Focus on: early detection, objective risk stratification, clinical confidence, workflow efficiency

**6. Mechanism (Flow with Arrows)** (1 sentence)
- Show the process transformation with → symbols
- Examples:
  * "patient arrives → IntelliSep in under 8 min → risk stratified → right treatment intensity → better outcomes"
  * "suspected sepsis → IntelliSep result → confidence to escalate OR safely monitor → fewer missed cases + less overtreatment"
  * "IntelliSep negative (97.5% NPV) → rule out sepsis early → avoid unnecessary antibiotics + ICU → better stewardship"

**7. Outcome (KPI Improvement)** (2-3 sentences)
- "suddenly your team realizes: we're not just testing faster. we're [transformation]"
- Reference specific KPI from {relevant_context} and show improvement potential
- Examples:
  * "suddenly your team realizes: we're not just testing faster. we're catching sepsis before it escalates. your 22% mortality → 13% mortality (40% reduction, like Thomas et al. saw)"
  * "your team realizes: we're not just following bundles. we're confidently ruling out sepsis early. your SEP-1 compliance → 85%+ without overtreatment"
  * "your team realizes: we're not drowning in alerts. we're acting on real risk. your ED throughput improves, boarding drops, outcomes get better"

**8. Simple CTA** (1 sentence, question format with timeframe)
- "[timeframe]. ready to talk?"
- "15 min call this week?"
- "quick call to walk through your data?"

**IMPORTANT - USE HOSPITAL-SPECIFIC DATA:**
- Pull metrics from {relevant_context} and {company_summary} for sections 1, 4, and 7
- If specific metrics available (SEP-1 scores, mortality rates, CMS penalties), USE THEM
- If no specific metrics, use realistic estimates based on {company_summary} context
- The hidden problems (section 4) should reflect their actual challenges when possible

**TONE EXAMPLES:**
✓ "hi Sarah, saw Memorial's 68% SEP-1 compliance"
✓ "wanna know what's happening with your sepsis patients that doesn't show up in the data?"
✓ "your team is doing the right things. following bundles, ordering labs, documenting. but here's what's actually happening:"
✓ "suddenly your team realizes: we're not just testing faster. we're catching sepsis before it escalates"

✗ "Dear Dr. Johnson, I hope this email finds you well"
✗ "I am reaching out to introduce IntelliSep"
✗ "Our product offers the following benefits:"
✗ "I would love to schedule a meeting at your convenience"

**LENGTH:** 150-180 words total

**Product Context (IntelliSep Sepsis Test):**
{product_report_excerpt}

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Role Details: {stakeholder_details}

**Role-Specific Context:**
{role_context_excerpt}

**Hospital Context:**
Hospital: {company_name}
Report Summary: {company_summary}

**Specific Insights from Hospital Report:**
{relevant_context}

**KEY STAKEHOLDER ENGAGEMENT SUGGESTIONS:**
If the research report includes engagement recommendations for this stakeholder (preferred communication style, decision triggers, pain points, priorities), REVIEW and INCORPORATE them:
- Adjust tone/approach based on their communication preferences (data-driven, relationship-focused, urgency-driven)
- Frame value proposition around their specific decision criteria
- Reference pain points or priorities mentioned in engagement suggestions
- Tailor subject line to match their engagement triggers (curiosity, urgency, peer validation)

Generate as JSON:
{
  "subject": "Ultra-short, punchy subject (under 45 chars, lowercase preferred)",
  "body": "Email body following the structure above"
}
```

## Expected Output Example

### Input:
- Stakeholder: Dr. Sarah Johnson, Chief Quality Officer
- Hospital: Memorial Regional Medical Center
- Context: 68% SEP-1 compliance, 22% sepsis mortality, 180 suspected cases/month, CMS penalty $1.2M

### Output:
```
Subject: your sepsis data doesn't show the real problem

hi Sarah

saw Memorial's 68% SEP-1 compliance and 22% sepsis mortality

wanna know what's happening with your sepsis patients that doesn't show up in the data?

your team is doing the right things. following bundles, ordering labs, documenting.

but here's what's actually happening:

- lactate results taking 90+ minutes while patients deteriorate (treatment delays killing outcomes)
- nurses manually tracking vitals but sepsis risk still subjective (missed escalations, alert fatigue)
- ED beds stuck waiting for SEP-1 documentation (throughput tanking, 180 cases/month piling up)
- your sepsis coordinator spending 12 hours/week building CMS reports (that $1.2M penalty hurts)

IntelliSep gives you objective sepsis risk in under 8 minutes - before clinical deterioration

patient arrives → IntelliSep result → confidence to escalate OR safely rule out → right treatment intensity → better outcomes

suddenly your team realizes: we're not just testing faster. we're catching sepsis before it escalates.

your 22% mortality → 13% mortality (40% reduction, like Thomas et al. saw at their site)

15 min call this week?
```

## Why This Works

1. **Credibility through specificity**: Opens with their actual data
2. **Pattern interrupt**: Validates current approach before revealing hidden problem
3. **Insider knowledge**: Shows understanding of what metrics don't capture
4. **Concrete problems**: Specific operational issues with human impact
5. **Capability framing**: Not "faster test" but "objective risk before deterioration"
6. **Visual flow**: Arrows show process transformation
7. **Tangible outcome**: Specific KPI improvement with peer evidence
8. **Low-pressure CTA**: Simple timeframe, question format

## Implementation

Add this to `seed-default-templates.ts` as:
- **Name**: "Casual Insider Approach"
- **Description**: "Ultra-casual, peer-to-peer email that reveals hidden problems in their sepsis workflow using hospital-specific data"
- **promptTemplate**: [Full template prompt above]
- **isDefault**: true
