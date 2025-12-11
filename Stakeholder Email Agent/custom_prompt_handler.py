"""
Custom Prompt Handler (Mode 3)
Allows users to provide their own email generation prompts
"""

CUSTOM_PROMPT_TEMPLATE = """You are generating a cold email for healthcare outreach based on custom user instructions.

**CRITICAL REQUIREMENTS (apply to ALL custom emails):**
1. **Healthcare Language**: Use "patients" NOT "customers" - this is healthcare, not retail
2. **Report Specificity**: Reference SPECIFIC challenges, metrics, or opportunities from the hospital report
3. **Brevity**: Keep under 150 words unless user explicitly requests longer
4. **Directness**: Get to the point quickly, no preamble
5. **Data-Driven**: Include specific metrics when relevant
6. **Clear CTA**: Simple, actionable next step

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Role Details: {stakeholder_details}

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
- Tailor subject line and messaging to match their engagement triggers (curiosity, urgency, peer validation)

**User's Custom Instructions:
{custom_instructions}

**Instructions:**
1. Follow the user's custom instructions above
2. MUST use healthcare-appropriate language (patients, clinical outcomes, quality metrics)
3. MUST reference specific insights from the hospital report
4. Use the stakeholder's role and priorities to personalize
5. Keep it concise and direct (cold email best practices)

Generate an email following the user's custom instructions while adhering to the critical requirements. Format as JSON:
{{
    "subject": "Email subject line",
    "body": "Email body"
}}

Return ONLY the JSON, no additional text."""

CUSTOM_PROMPT_EXAMPLE_1 = """Example Custom Prompt:

You are a senior account executive at a healthcare AI company. Write an email that:
1. Opens with a specific reference to their recent presentation at AWS re:Invent
2. Mentions the challenge of LLM inference costs that they discussed
3. Positions our solution as a way to reduce costs by 60% while improving response times
4. Uses a professional but warm tone
5. Ends with an invitation to a 20-minute technical deep-dive call

Keep it under 200 words."""

CUSTOM_PROMPT_EXAMPLE_2 = """Example Custom Prompt:

Write an email in the style of a technical peer reaching out for a collaboration discussion. 
- Reference their work on distributed systems
- Mention you saw their team is hiring engineers for the AI Assistant project
- Suggest our inference optimization platform could help them scale faster
- Use technical language but keep it conversational
- Propose a technical whiteboarding session

Length: 150-200 words."""

CUSTOM_PROMPT_EXAMPLE_3 = """Example Custom Prompt:

Casual, founder-to-founder email:
- Start with "saw you closed Series C - congrats"
- Mention the challenge of AI feature costs eating into margins
- Share that we helped 3 similar companies reduce AI costs 50-70%
- Very brief, very direct
- End with "15 min call this week?"

Max 100 words, super casual."""

def build_custom_prompt(custom_instructions: str, stakeholder_context: dict) -> str:
    """
    Build the full prompt for custom email generation.
    
    Args:
        custom_instructions: User's custom prompt instructions
        stakeholder_context: Dictionary with stakeholder and company context
        
    Returns:
        Complete prompt string ready for LLM
    """
    return CUSTOM_PROMPT_TEMPLATE.format(
        stakeholder_name=stakeholder_context.get("stakeholder_name", ""),
        stakeholder_title=stakeholder_context.get("stakeholder_title", ""),
        stakeholder_details=stakeholder_context.get("stakeholder_details", ""),
        company_name=stakeholder_context.get("company_name", ""),
        company_summary=stakeholder_context.get("company_summary", ""),
        relevant_context=stakeholder_context.get("relevant_context", ""),
        custom_instructions=custom_instructions
    )

def get_example_prompts() -> list:
    """
    Get example custom prompts to show users.
    
    Returns:
        List of example prompt strings
    """
    return [
        CUSTOM_PROMPT_EXAMPLE_1,
        CUSTOM_PROMPT_EXAMPLE_2,
        CUSTOM_PROMPT_EXAMPLE_3
    ]

def validate_custom_prompt(custom_instructions: str) -> tuple:
    """
    Validate user's custom prompt.
    
    Args:
        custom_instructions: User's custom prompt
        
    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    if not custom_instructions or not custom_instructions.strip():
        return False, "Custom prompt cannot be empty"
    
    if len(custom_instructions.strip()) < 20:
        return False, "Custom prompt is too short (minimum 20 characters)"
    
    if len(custom_instructions) > 2000:
        return False, "Custom prompt is too long (maximum 2000 characters)"
    
    return True, None
