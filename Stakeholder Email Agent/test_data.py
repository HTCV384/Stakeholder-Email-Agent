"""
Test fixtures and mock data for testing
"""

# Sample stakeholder data
SAMPLE_STAKEHOLDERS = [
    {
        "name": "Dr. Jane Smith",
        "title": "Chief Technology Officer",
        "details": "Leading AI transformation initiatives with focus on LLM integration. Background in distributed systems from Stanford."
    },
    {
        "name": "Michael Chen",
        "title": "VP of Product Management",
        "details": "Responsible for product roadmap and competitive differentiation. Focused on user experience and AI features."
    }
]

# Sample company summary
SAMPLE_COMPANY_SUMMARY = """TechCorp Solutions: A mid-sized enterprise software company specializing in cloud-based project management tools. Recently raised $45M Series C to expand AI capabilities and enter Asian markets."""

# Sample research report
SAMPLE_RESEARCH_REPORT = """
CUSTOMER RESEARCH REPORT: TECHCORP SOLUTIONS

Company Overview:
TechCorp Solutions is a mid-sized enterprise software company based in San Francisco, specializing in cloud-based project management and collaboration tools. Founded in 2015, the company has grown to 350 employees and serves over 2,000 enterprise clients.

Recent Developments:
TechCorp recently announced a $45M Series C funding round, with plans to expand their AI-powered features and enter the Asian market in Q2 2026.

Key Stakeholders:

1. Dr. Jane Smith - Chief Technology Officer
Dr. Smith joined TechCorp in 2022 after leading engineering teams at major tech companies. She holds a Ph.D. in Computer Science from Stanford and is spearheading the AI transformation initiative. She recently spoke at AWS re:Invent about building scalable AI features for enterprise SaaS.

Dr. Smith has expressed concerns about the computational costs of running LLM inference at scale and is actively exploring optimization strategies. Her team of 85 engineers is currently working on a new "AI Assistant" feature.

2. Michael Chen - VP of Product Management
Michael Chen has been with TechCorp since its early days. He is responsible for the product roadmap and works closely with the largest enterprise customers. Michael has been vocal about the importance of user experience and competitive differentiation.

Recently, Michael has been focused on how AI features can become a key differentiator for TechCorp. He is exploring how remote and hybrid teams are evolving their collaboration practices post-pandemic.
"""

# Sample task for email writer
SAMPLE_TASK = {
    "stakeholder_name": "Dr. Jane Smith",
    "stakeholder_title": "Chief Technology Officer",
    "stakeholder_details": "Leading AI transformation initiatives with focus on LLM integration",
    "company_name": "TechCorp Solutions",
    "company_summary": SAMPLE_COMPANY_SUMMARY,
    "relevant_context": "Dr. Smith is concerned about LLM inference costs and is exploring optimization strategies.",
    "generation_mode": "ai_style",
    "mode_config": {"style_key": "technical_direct"}
}

# Sample email output
SAMPLE_EMAIL = {
    "subject": "Optimizing LLM Inference Costs for Enterprise Scale",
    "body": """Dr. Smith,

I noticed your recent presentation at AWS re:Invent on building scalable AI features. Your concerns about LLM inference costs at enterprise scale resonated with challenges we've helped similar companies address.

Our platform reduces inference costs by 60% through intelligent caching, model optimization, and dynamic batching - without sacrificing response quality. For a company serving 2,000+ enterprise clients, this translates to significant operational savings.

Given your team's work on the AI Assistant feature, I'd welcome the opportunity to discuss how we've helped other SaaS platforms scale their AI capabilities efficiently.

Would you be open to a brief technical discussion next week?

Best regards"""
}

# Sample evaluation result
SAMPLE_EVALUATION = {
    "style_adherence": 8.5,
    "personalization": 9.0,
    "relevance": 8.0,
    "clarity": 9.0,
    "call_to_action": 8.0,
    "professionalism": 9.0,
    "overall_score": 8.6,
    "strengths": ["Strong personalization", "Clear technical focus"],
    "weaknesses": ["Could be more specific about implementation"],
    "improvement_suggestions": "Add specific metrics or case study reference"
}

# Mock LLM responses
MOCK_STAKEHOLDER_EXTRACTION_RESPONSE = '[{"name": "Dr. Jane Smith", "title": "Chief Technology Officer", "details": "Leading AI transformation initiatives with focus on LLM integration. Background in distributed systems from Stanford."}, {"name": "Michael Chen", "title": "VP of Product Management", "details": "Responsible for product roadmap and competitive differentiation. Focused on user experience and AI features."}]'

MOCK_COMPANY_SUMMARY_RESPONSE = """TechCorp Solutions: A mid-sized enterprise software company specializing in cloud-based project management tools. Recently raised $45M Series C to expand AI capabilities and enter Asian markets."""

MOCK_EMAIL_GENERATION_RESPONSE = """{
    "subject": "Optimizing LLM Inference Costs for Enterprise Scale",
    "body": "Dr. Smith,\\n\\nI noticed your recent presentation at AWS re:Invent on building scalable AI features. Your concerns about LLM inference costs at enterprise scale resonated with challenges we've helped similar companies address.\\n\\nOur platform reduces inference costs by 60% through intelligent caching, model optimization, and dynamic batching - without sacrificing response quality. For a company serving 2,000+ enterprise clients, this translates to significant operational savings.\\n\\nGiven your team's work on the AI Assistant feature, I'd welcome the opportunity to discuss how we've helped other SaaS platforms scale their AI capabilities efficiently.\\n\\nWould you be open to a brief technical discussion next week?\\n\\nBest regards"
}"""

MOCK_EMAIL_EVALUATION_RESPONSE = """{
    "style_adherence": 8.5,
    "personalization": 9.0,
    "relevance": 8.0,
    "clarity": 9.0,
    "call_to_action": 8.0,
    "professionalism": 9.0,
    "overall_score": 8.6,
    "strengths": ["Strong personalization", "Clear technical focus"],
    "weaknesses": ["Could be more specific about implementation"],
    "improvement_suggestions": "Add specific metrics or case study reference"
}"""

MOCK_EMAIL_REFINEMENT_RESPONSE = """{
    "subject": "Optimizing LLM Inference Costs for Enterprise Scale - 60% Cost Reduction",
    "body": "Dr. Smith,\\n\\nI noticed your recent presentation at AWS re:Invent on building scalable AI features. Your concerns about LLM inference costs at enterprise scale resonated with challenges we've helped similar companies address.\\n\\nOur platform reduces inference costs by 60% through intelligent caching, model optimization, and dynamic batching - without sacrificing response quality. For example, we helped a similar SaaS company reduce their monthly AI infrastructure costs from $180K to $72K while improving response times by 40%.\\n\\nGiven your team's work on the AI Assistant feature for 2,000+ enterprise clients, I'd welcome the opportunity to discuss specific optimization strategies that could accelerate your rollout.\\n\\nWould you be open to a 20-minute technical discussion next week?\\n\\nBest regards"
}"""
