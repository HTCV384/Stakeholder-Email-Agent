**HOSPITAL-SPECIFIC EVIDENCE REQUIREMENT:**
You MUST lead with a SPECIFIC fact from the hospital research report:
- SEP-1 compliance gaps or sepsis mortality data
- Quality measure scores that need improvement
- CMS star rating changes or quality penalties
- Specific operational challenges (ED overcrowding, lab delays, etc.)
- Recent quality improvement initiatives or goals
- Stakeholder-specific pain points mentioned in the report
- Published data showing performance gaps

**Email Structure:**
1. **Problem Hook (1 sentence)**: State the SPECIFIC challenge from their report with a concrete fact
2. **Solution + Proof (2-3 sentences)**: IntelliSep's impact with real data
3. **Call to Action (1 sentence)**: Simple next step with timeframe

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

**Instructions:**
1. CAREFULLY READ the hospital report for specific performance data or challenges
2. FIND the most urgent, measurable problem: SEP-1 score, mortality rate, quality gap, or operational bottleneck
3. LEAD with that specific fact to show you've done your research
4. Show how IntelliSep solves it with 1 concrete metric
5. Keep it under 120 words
6. End with a direct ask and timeframe

**EXAMPLE OPENINGS (use the actual facts from the report, not these examples):**
- "[Hospital]'s SEP-1 compliance at [X%] means [Y] patients per month face delayed treatment..."
- "With [Hospital]'s ED sepsis mortality at [X%], every hour of delay costs lives..."
- "I saw [Hospital] was flagged for [specific quality measure] - IntelliSep can help..."

Generate a direct, urgent cold email. Format as JSON:
{{
    "subject": "Direct problem statement with specific metric (under 50 characters)",
    "body": "Email body (under 120 words)"
}}

Return ONLY the JSON, no additional text."""
}

# Style 3: Technical and Data-Driven
STYLE_TECHNICAL_DIRECT = {
    "name": "Technical and Data-Driven",
    "description": "Concise, specification-focused cold email with clinical data",
    "generation_prompt": """You are writing a technical cold email to a healthcare professional who values data and specifics. Be precise and evidence-based.

**CRITICAL COLD EMAIL RULES:**
- Maximum 150 words
- Lead with a specific clinical or operational metric from the report
- Use precise clinical terminology
- Include 2-3 specific IntelliSep performance metrics
- Use "patients" NOT "customers"
- Focus on measurable outcomes
- Clear, simple call to action

**HOSPITAL-SPECIFIC EVIDENCE REQUIREMENT:**
You MUST reference SPECIFIC quantitative data from the hospital research report:
- Exact SEP-1 scores, sepsis bundle compliance percentages
- Mortality rates, readmission rates, or length of stay data
- Lab turnaround times or diagnostic delays
- ED throughput metrics or patient volumes
- Published study results or quality improvement data
- Specific performance gaps vs. benchmarks
- Operational metrics (blood culture contamination rates, etc.)

**Email Structure:**
1. **Data Hook (1 sentence)**: Reference a SPECIFIC metric or clinical challenge from their report
2. **Technical Solution (3-4 sentences)**: IntelliSep's clinical performance with specific data
3. **Call to Action (1 sentence)**: Offer to share detailed data or validation studies

**Product Context (IntelliSep Sepsis Test):**
{product_report_excerpt}

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Role Details: {stakeholder_details}
