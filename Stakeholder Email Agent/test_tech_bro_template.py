#!/usr/bin/env python3
"""
Test the Tech Bro Reality Check template with sample data
"""
import sys
import os

# Add stakeholder_outreach to path
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from agents.email_writer_agent import EmailWriterAgent

# Sample stakeholder data
SAMPLE_DATA = {
    "stakeholder_name": "Dr. Sarah Johnson",
    "stakeholder_title": "Chief Quality Officer",
    "stakeholder_details": "Oversees quality improvement initiatives, sepsis protocols, and CMS compliance reporting. Published research on ED sepsis management.",
    "company_name": "Memorial Regional Medical Center",
    "company_summary": "450-bed academic medical center with Level II trauma center. Focus on improving sepsis outcomes and ED efficiency.",
    "relevant_context": "Memorial Regional has 68% SEP-1 compliance (below national average of 75%), 22% sepsis mortality rate, and handles approximately 180 suspected sepsis cases monthly. Recent CMS star rating dropped from 4 to 3 stars, resulting in $1.2M penalty. ED throughput challenged by sepsis protocol documentation requirements.",
    "generation_mode": "template",
    "template_id": None  # Will be fetched from database
}

def test_tech_bro_template():
    """Test Tech Bro template generation"""
    print("=" * 80)
    print("Testing Tech Bro Reality Check Template")
    print("=" * 80)
    print()
    
    # Initialize agent
    agent = EmailWriterAgent("EmailWriterAgent_TechBroTest")
    
    # Generate email using template
    print(f"Stakeholder: {SAMPLE_DATA['stakeholder_name']}, {SAMPLE_DATA['stakeholder_title']}")
    print(f"Hospital: {SAMPLE_DATA['company_name']}")
    print()
    print("Generating email...")
    print()
    
    result = agent.run(SAMPLE_DATA)
    
    if result.get("success"):
        email = result.get("email", {})
        
        print("✓ Email Generated Successfully")
        print()
        print("-" * 80)
        print(f"SUBJECT: {email.get('email_subject', 'N/A')}")
        print("-" * 80)
        print()
        print(email.get('email_body', 'N/A'))
        print()
        print("-" * 80)
        print(f"Quality Score: {email.get('quality_score', 0)}/10")
        print("-" * 80)
        print()
        print("REFLECTION NOTES:")
        print(email.get('reflection_notes', 'N/A'))
        print()
        
        # Check for key characteristics
        body = email.get('email_body', '')
        subject = email.get('email_subject', '')
        
        print("=" * 80)
        print("STYLE ANALYSIS:")
        print("=" * 80)
        
        checks = {
            "Lowercase style": body.count('\n\n') > 3 and any(line.islower() or line.startswith('-') for line in body.split('\n') if line.strip()),
            "Contains arrows (→)": '→' in body or '->' in body,
            "Has bullet points": body.count('-') >= 3 or body.count('*') >= 3,
            "Short subject": len(subject) < 50,
            "Question format": '?' in body,
            "Casual tone words": any(word in body.lower() for word in ['bro', 'wanna', 'hey', 'yo', 'guess what']),
            "Pattern interrupt": 'not the test' in body.lower() or 'not the' in body.lower(),
            "Transformation language": 'suddenly' in body.lower() or 'realize' in body.lower() or 'stickiness' in body.lower(),
        }
        
        for check, passed in checks.items():
            status = "✓" if passed else "✗"
            print(f"{status} {check}")
        
        print()
        passed_count = sum(checks.values())
        total_count = len(checks)
        print(f"Style Match: {passed_count}/{total_count} checks passed")
        
        if passed_count >= 6:
            print("✓ EXCELLENT - Strong tech bro style match")
        elif passed_count >= 4:
            print("~ GOOD - Decent tech bro style")
        else:
            print("✗ NEEDS IMPROVEMENT - Style doesn't match target")
            
    else:
        print("✗ Email Generation Failed")
        print(f"Error: {result.get('error', 'Unknown error')}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_tech_bro_template()
    sys.exit(0 if success else 1)
