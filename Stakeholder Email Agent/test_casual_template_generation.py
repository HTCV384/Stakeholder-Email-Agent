#!/usr/bin/env python3.11
"""Test Casual Insider template email generation"""

import sys
import os
import json

# Add paths
sys.path.insert(0, '/home/ubuntu/stakeholder_webapp/server/agentic_system')
sys.path.insert(0, '/home/ubuntu/stakeholder_outreach')

from agents.email_writer import EmailWriterAgent

# Test task
task = {
    'stakeholder_name': 'Kim Schwenk, MSN, RN',  # Should extract 'kim' as first name
    'stakeholder_title': 'Vice President of Nursing and Chief Nursing Officer',
    'stakeholder_details': 'Oversees nursing operations and quality improvement initiatives',
    'company_name': 'MedStar Franklin Square Medical Center',
    'company_summary': 'MedStar Franklin Square is a 350-bed acute care facility with focus on quality improvement',
    'relevant_context': 'Hospital has 26% SEP-1 compliance, working to improve sepsis outcomes',
    'generation_mode': 'template',
    'mode_config': {
        'template_id': 6,  # Casual Insider Approach template ID (correct one)
    },
    'user_id': 1
}

print("Creating EmailWriterAgent...")
agent = EmailWriterAgent(name="EmailWriter")

print("\nGenerating email...")
try:
    result = agent._generate_template_email(task)
    print("\n=== RESULT ===")
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"\n=== ERROR ===")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
