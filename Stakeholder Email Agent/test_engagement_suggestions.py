#!/usr/bin/env python3.11
"""
Test EmailWriterAgent's ability to incorporate stakeholder engagement suggestions
into email generation (subject line and body).
"""

import sys
import os
import asyncio

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.email_writer import EmailWriterAgent

async def test_engagement_suggestions():
    """Test that EmailWriterAgent incorporates engagement suggestions."""
    
    print("=" * 80)
    print("Testing Engagement Suggestion Incorporation")
    print("=" * 80)
    
    # Initialize agent
    agent = EmailWriterAgent(name="EmailWriterAgent_EngagementTest")
    
    # Sample task with engagement suggestions in relevant_context
    task = {
        "stakeholder_name": "Dr. Michael Chen",
        "stakeholder_title": "Chief Medical Officer",
        "stakeholder_details": "Oversees clinical quality, patient safety, and medical staff. Leading hospital-wide sepsis mortality reduction initiative. Published researcher on emergency medicine protocols.",
        "company_name": "St. Mary's Regional Medical Center",
        "company_summary": "450-bed community hospital with Level II trauma center. Recent CMS star rating drop from 3 to 2 stars. Focus on improving sepsis outcomes and ED throughput.",
        "relevant_context": """
HOSPITAL PERFORMANCE DATA:
- Current SEP-1 compliance: 71% (below national average of 78%)
- Sepsis mortality rate: 19.2% (target: <15%)
- ED sepsis patient volume: ~850 cases/year
- Average time to antibiotics: 4.2 hours (goal: <3 hours)
- Recent CMS quality penalty: $1.2M for sepsis-related readmissions

STAKEHOLDER ENGAGEMENT SUGGESTIONS FOR DR. CHEN:
- Communication Style: Data-driven and evidence-based. Prefers peer-reviewed studies and clinical trial results over anecdotal success stories.
- Decision Triggers: Responds to quality metrics, patient outcome improvements, and regulatory compliance risks. Values solutions that reduce clinical variation.
- Pain Points: Frustrated with current sepsis protocol adherence rates. Concerned about CMS penalties impacting hospital budget. Wants objective tools to support clinical decision-making.
- Engagement Approach: Lead with specific performance gaps (SEP-1 compliance, mortality rate). Reference published clinical evidence. Frame solution as clinical decision support, not replacement of physician judgment.
- Subject Line Preference: Prefers direct, metric-focused subject lines over curiosity-driven headlines. Example: "Improving SEP-1 Compliance at St. Mary's" vs "A New Approach to Sepsis"
""",
        "generation_mode": "ai_style",
        "mode_config": {
            "style_key": "healthcare_professional"
        }
    }
    
    print("\n[Test] Generating email with engagement suggestions...")
    print(f"Stakeholder: {task['stakeholder_name']} ({task['stakeholder_title']})")
    print(f"Style: {task['mode_config']['style_key']}")
    print("\nEngagement Suggestions Present:")
    print("  ✓ Communication Style: Data-driven, evidence-based")
    print("  ✓ Decision Triggers: Quality metrics, patient outcomes, compliance")
    print("  ✓ Pain Points: SEP-1 adherence, CMS penalties, clinical variation")
    print("  ✓ Subject Line Preference: Direct, metric-focused")
    print()
    
    result = await agent.run(task)
    
    if result:
        print("\n" + "=" * 80)
        print("GENERATED EMAIL")
        print("=" * 80)
        print(f"\nSubject: {result.get('email_subject', 'N/A')}")
        print(f"\nBody:\n{result.get('email_body', 'N/A')}")
        print(f"\nQuality Score: {result.get('quality_score', 0)}/10")
        print(f"\nReflection Notes:\n{result.get('reflection_notes', 'N/A')}")
        
        # Analyze engagement suggestion incorporation
        print("\n" + "=" * 80)
        print("ENGAGEMENT SUGGESTION ANALYSIS")
        print("=" * 80)
        
        subject = result.get('email_subject', '').lower()
        body = result.get('email_body', '').lower()
        combined = subject + " " + body
        
        checks = {
            "Uses specific metrics (71%, 19.2%, SEP-1)": any(metric in combined for metric in ['71%', '19.2%', 'sep-1', 'sepsis mortality']),
            "References clinical evidence/data": any(term in combined for term in ['study', 'trial', 'evidence', 'data', 'npv', 'sensitivity', 'pooled analysis']),
            "Addresses pain points (compliance, penalties, variation)": any(pain in combined for pain in ['compliance', 'adherence', 'penalty', 'variation', 'cms', 'quality']),
            "Frames as clinical decision support": any(term in combined for term in ['decision support', 'objective', 'risk stratification', 'clinical tool']),
            "Subject line is metric-focused": any(metric in subject for metric in ['sep-1', 'compliance', 'mortality', '%', 'improving', 'reducing'])
        }
        
        passed = sum(checks.values())
        total = len(checks)
        
        print(f"\nEngagement Alignment Score: {passed}/{total}")
        for check, result in checks.items():
            status = "✓" if result else "✗"
            print(f"  {status} {check}")
        
        if passed >= 4:
            print(f"\n✓ PASS: Email successfully incorporates engagement suggestions ({passed}/{total} checks)")
            return True
        else:
            print(f"\n✗ FAIL: Email does not adequately incorporate engagement suggestions ({passed}/{total} checks)")
            return False
    else:
        print("\n✗ FAIL: Email generation failed")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_engagement_suggestions())
    sys.exit(0 if success else 1)
