"""
User-Editable Email Templates (Mode 2)
Templates with user-editable sections and AI-generated context
"""

# Template 1: Problem-Solution
TEMPLATE_PROBLEM_SOLUTION = {
    "name": "Problem-Solution",
    "description": "Focus on specific challenges and your solution",
    "user_fields": {
        "subject": "Your compelling subject about their specific challenge",
        "opening": "Opening that demonstrates understanding",
        "benefit_1": "Key benefit 1",
        "benefit_2": "Key benefit 2",
        "benefit_3": "Key benefit 3",
        "call_to_action": "Your specific ask",
        "closing": "Your closing and signature"
    },
    "structure": """Subject: {subject}

{stakeholder_name},

{opening}

Here's what we're seeing at similar organizations:
[AI_CONTEXT: Pain points and challenges from research]

What if you could:
- {benefit_1}
- {benefit_2}
- {benefit_3}

[AI_CONTEXT: How this specifically applies to their role and organization]

{call_to_action}

{closing}""",
    "generation_prompt": """You are filling in the AI-generated context sections of a cold email template for healthcare outreach.

**CRITICAL: Use healthcare-appropriate language. Say "patients" NOT "customers". Reference specific challenges from the hospital report.**

User has provided:
- Subject: {subject}
- Opening: {opening}
- Benefits: {benefit_1}, {benefit_2}, {benefit_3}
- Call to Action: {call_to_action}
- Closing: {closing}

Your task: Generate the two [AI_CONTEXT] sections:

1. "Here's what we're seeing at similar hospitals:" 
   - Extract 2-3 SPECIFIC challenges from the hospital report
   - Use clinical/operational terminology (sepsis metrics, patient outcomes, TAT, etc.)
   - Reference actual data or situations from the report
   - 2-3 sentences, direct and specific

2. "How this specifically applies to their role and organization:"
   - Connect the user's benefits to SPECIFIC initiatives or challenges from the report
   - Reference their exact role and priorities
   - Use healthcare language (patients, clinical outcomes, quality metrics)
   - 2-3 sentences

Stakeholder Information:
Name: {stakeholder_name}
Title: {stakeholder_title}
Background: {stakeholder_details}

Company Context:
Company: {company_name}
Summary: {company_summary}

Relevant Research Insights:
{relevant_context}

**KEY STAKEHOLDER ENGAGEMENT SUGGESTIONS:**
If the research report includes engagement recommendations for this stakeholder (preferred communication style, decision triggers, pain points, priorities), REVIEW and INCORPORATE them:
- Adjust tone/approach based on their communication preferences (data-driven, relationship-focused, urgency-driven)
- Frame value proposition around their specific decision criteria
- Reference pain points or priorities mentioned in engagement suggestions
- Tailor messaging to match their engagement triggers (curiosity, urgency, peer validation)

Generate the AI context sections using healthcare-appropriate language. Format as JSON:
{{
    "pain_points_section": "Text for 'Here's what we're seeing...' (specific to their hospital)",
    "application_section": "Text for 'How this specifically applies...' (reference report insights)"
}}

Return ONLY the JSON, no additional text."""
}

# Template 2: Casual Bro-y
TEMPLATE_CASUAL_BROY = {
    "name": "Casual Bro-y Template",
    "description": "Direct, problem-focused casual style",
    "user_fields": {
        "subject": "direct problem statement",
        "your_achievement": "What you implemented/achieved",
        "your_solution": "Your solution description in plain language",
        "timeframe": "Timeframe (e.g., '60 days', '2 weeks')"
    },
    "structure": """Subject: {subject}

{stakeholder_first_name}

[AI_CONTEXT: Their biggest pain point]

{your_achievement}

here's what they're actually struggling with:

[AI_CONTEXT: 3-4 specific pain points as bullets]

{your_solution}

[AI_CONTEXT: Specific application to their situation]

{timeframe}. ready to talk?""",
    "generation_prompt": """You are filling in the AI-generated context sections of a direct, urgent cold email template for healthcare outreach.

**CRITICAL: Use healthcare language. Say "patients" NOT "customers". Reference SPECIFIC challenges from the hospital report.**

User has provided:
- Subject: {subject}
- Achievement: {your_achievement}
- Solution: {your_solution}
- Timeframe: {timeframe}

Your task: Generate the three [AI_CONTEXT] sections in a direct, urgent style:

1. Opening pain point (1-2 sentences):
   - Their single biggest challenge from the hospital report
   - Make it specific with data if available (metrics, timelines, volumes)
   - Direct language, but healthcare-appropriate

2. Bullet list of struggles (3-4 bullets):
   - SPECIFIC challenges from the hospital report
   - Use actual numbers/details from the report
   - Format: "- [specific problem with data]"
   - Clinical/operational focus (patient outcomes, TAT, compliance, etc.)

3. Application to their situation (2-3 sentences):
   - How the solution addresses their specific report findings
   - Connect to their exact role and priorities
   - Use healthcare terminology (patients, clinical outcomes, quality metrics)
   - Make the impact concrete and measurable

Stakeholder Information:
Name: {stakeholder_name}
Title: {stakeholder_title}
Background: {stakeholder_details}

Company Context:
Company: {company_name}
Summary: {company_summary}

Relevant Research Insights:
{relevant_context}

**KEY STAKEHOLDER ENGAGEMENT SUGGESTIONS:**
If the research report includes engagement recommendations for this stakeholder (preferred communication style, decision triggers, pain points, priorities), REVIEW and INCORPORATE them:
- Adjust tone/approach based on their communication preferences (data-driven, relationship-focused, urgency-driven)
- Frame value proposition around their specific decision criteria
- Reference pain points or priorities mentioned in engagement suggestions
- Tailor messaging to match their engagement triggers (curiosity, urgency, peer validation)

Generate the AI context sections using healthcare-appropriate language. Format as JSON:
{{
    "opening_pain": "Their biggest challenge from the report (specific)",
    "struggle_bullets": ["specific challenge 1 with data", "specific challenge 2", "specific challenge 3", "specific challenge 4"],
    "application": "How solution applies to their specific situation"
}}

Return ONLY the JSON, no additional text."""
}

# Template 3: Partnership Proposal
TEMPLATE_PARTNERSHIP = {
    "name": "Partnership Proposal",
    "description": "Collaborative partnership opportunity",
    "user_fields": {
        "subject": "Partnership opportunity subject",
        "partnership_vision": "Your vision for the partnership",
        "mutual_value_1": "Value point 1",
        "mutual_value_2": "Value point 2",
        "mutual_value_3": "Value point 3",
        "next_step": "Proposed next step",
        "closing": "Closing and signature"
    },
    "structure": """Subject: {subject}

{stakeholder_name},

[AI_CONTEXT: Recognition of their work and strategic position]

{partnership_vision}

I see potential for mutual value in several areas:
- {mutual_value_1}
- {mutual_value_2}
- {mutual_value_3}

[AI_CONTEXT: How partnership aligns with their current initiatives]

{next_step}

{closing}""",
    "generation_prompt": """You are filling in the AI-generated context sections of a consultative cold email template for healthcare outreach.

**CRITICAL: Use healthcare language. Say "patients" NOT "customers". Reference SPECIFIC initiatives or challenges from the hospital report.**

User has provided:
- Subject: {subject}
- Partnership Vision: {partnership_vision}
- Value Points: {mutual_value_1}, {mutual_value_2}, {mutual_value_3}
- Next Step: {next_step}
- Closing: {closing}

Your task: Generate the two [AI_CONTEXT] sections:

1. Recognition of their work (2-3 sentences):
   - Acknowledge SPECIFIC initiatives, challenges, or priorities from the hospital report
   - Show you understand their clinical/operational context
   - Use healthcare-appropriate terminology
   - Professional, respectful tone

2. Partnership alignment (2-3 sentences):
   - Connect the partnership vision to SPECIFIC findings from the report
   - Reference actual challenges, metrics, or goals mentioned in the report
   - Show how collaboration addresses their specific situation
   - Use clinical language (patient outcomes, quality metrics, operational efficiency)

Stakeholder Information:
Name: {stakeholder_name}
Title: {stakeholder_title}
Background: {stakeholder_details}

Company Context:
Company: {company_name}
Summary: {company_summary}

Relevant Research Insights:
{relevant_context}

**KEY STAKEHOLDER ENGAGEMENT SUGGESTIONS:**
If the research report includes engagement recommendations for this stakeholder (preferred communication style, decision triggers, pain points, priorities), REVIEW and INCORPORATE them:
- Adjust tone/approach based on their communication preferences (data-driven, relationship-focused, urgency-driven)
- Frame value proposition around their specific decision criteria
- Reference pain points or priorities mentioned in engagement suggestions
- Tailor messaging to match their engagement triggers (curiosity, urgency, peer validation)

Generate the AI context sections using healthcare-appropriate language. Format as JSON:
{{
    "recognition_section": "Recognition of their specific work/initiatives from report",
    "alignment_section": "Partnership alignment with their specific challenges/goals"
}}

Return ONLY the JSON, no additional text."""
}

# Template registry
EDITABLE_TEMPLATES = {
    "problem_solution": TEMPLATE_PROBLEM_SOLUTION,
    "casual_broy": TEMPLATE_CASUAL_BROY,
    "partnership": TEMPLATE_PARTNERSHIP
}

def get_template(template_key: str) -> dict:
    """
    Get a template configuration by key.
    
    Args:
        template_key: One of the template keys in EDITABLE_TEMPLATES
        
    Returns:
        Dictionary with template configuration
    """
    return EDITABLE_TEMPLATES.get(template_key)

def list_available_templates() -> list:
    """
    Get list of available template names and descriptions.
    
    Returns:
        List of tuples (key, name, description)
    """
    return [
        (key, template["name"], template["description"])
        for key, template in EDITABLE_TEMPLATES.items()
    ]
