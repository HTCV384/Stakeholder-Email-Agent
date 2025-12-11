#!/usr/bin/env python3.11
"""
Test template preview with raw promptTemplate to reproduce the error.
"""

import sys
import os
import asyncio

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.email_writer import EmailWriterAgent

async def test_template_preview():
    """Test template preview with raw promptTemplate."""
    
    print("=" * 80)
    print("Testing Template Preview with Raw PromptTemplate")
    print("=" * 80)
    
    # Initialize agent
    agent = EmailWriterAgent(name="EmailWriterAgent_TemplateTest")
    
    # Sample task with raw promptTemplate (simulating user template preview)
    task = {
        "stakeholder_name": "Dr. Sarah Johnson",
        "stakeholder_title": "Chief Quality Officer",
        "stakeholder_details": "Oversees quality metrics, patient safety, and regulatory compliance. Leading sepsis mortality reduction initiative.",
        "company_name": "Memorial Regional Hospital",
        "company_summary": "450-bed community hospital. SEP-1 compliance: 68%. Sepsis mortality: 22%. Recent CMS quality penalty.",
        "relevant_context": "Hospital struggling with SEP-1 compliance (68% vs 78% national average). Sepsis mortality rate of 22% above target. Recent $800K CMS penalty for sepsis readmissions.",
        "generation_mode": "template",
        "mode_config": {
            "promptTemplate": """You are writing a professional cold email to a healthcare leader about IntelliSep sepsis test.

**Email Requirements:**
- Keep under 150 words
- Reference specific hospital challenges from the context
- Include 1-2 concrete data points about IntelliSep (97.5% NPV, 78-min TAT, 40% mortality reduction)
- End with clear call to action
- Use healthcare language: "patients" not "customers"

**Stakeholder Information:**
Name: {stakeholder_name}
Title: {stakeholder_title}
Details: {stakeholder_details}

**Hospital Context:**
Hospital: {company_name}
Summary: {company_summary}
Challenges: {relevant_context}

Generate a concise, professional email. Format as JSON:
{{
    "subject": "Email subject line (under 60 characters)",
    "body": "Email body (under 150 words)"
}}

Return ONLY the JSON, no additional text."""
        }
    }
    
    print("\n[Test] Generating template preview...")
    print(f"Stakeholder: {task['stakeholder_name']} ({task['stakeholder_title']})")
    print(f"Mode: {task['generation_mode']}")
    print(f"PromptTemplate length: {len(task['mode_config']['promptTemplate'])} chars")
    print()
    
    try:
        result = await agent.run(task)
        
        if result:
            print("\n" + "=" * 80)
            print("GENERATED EMAIL")
            print("=" * 80)
            print(f"\nSubject: {result.get('email_subject', 'N/A')}")
            print(f"\nBody:\n{result.get('email_body', 'N/A')}")
            print(f"\nQuality Score: {result.get('quality_score', 0)}/10")
            print(f"\nReflection Notes:\n{result.get('reflection_notes', 'N/A')}")
            
            # Check for error
            if result.get('email_subject') == 'ERROR':
                print("\n✗ FAIL: Template preview returned ERROR")
                print(f"Error message: {result.get('email_body', 'Unknown error')}")
                return False
            else:
                print("\n✓ PASS: Template preview generated successfully")
                return True
        else:
            print("\n✗ FAIL: Email generation returned None")
            return False
            
    except Exception as e:
        print(f"\n✗ FAIL: Exception during template preview: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_template_preview())
    sys.exit(0 if success else 1)
