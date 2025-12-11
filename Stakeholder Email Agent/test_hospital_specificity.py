"""
Test script to validate that EmailWriterAgent uses hospital-specific facts
from research reports in generated emails.

This test verifies the enhanced prompts correctly extract and reference:
- SEP-1 scores and sepsis performance metrics
- Mortality rates and quality measures
- Recent news, publications, or initiatives
- Stakeholder-specific projects
- Hospital grading changes
"""

import asyncio
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.email_writer import EmailWriterAgent

# Sample hospital data with specific facts
SAMPLE_HOSPITAL_DATA = {
    "stakeholder_name": "Dr. Sarah Martinez",
    "stakeholder_title": "Chief Quality Officer",
    "stakeholder_details": "Leads quality improvement initiatives including sepsis bundle compliance. Recently published abstract on reducing ED sepsis mortality. Oversees SEP-1 reporting and CMS quality measures.",
    "company_name": "Memorial Regional Medical Center",
    "company_summary": "450-bed community hospital with Level II trauma center. Current SEP-1 compliance: 68% (below national average of 75%). Recent CMS star rating dropped from 3 to 2 stars due to sepsis mortality rates. ED sees approximately 180 suspected sepsis cases per month. Hospital leadership has made sepsis care improvement a top strategic priority for 2025.",
    "relevant_context": """
Key Facts from Hospital Report:
- SEP-1 bundle compliance: 68% (target: 85%)
- Sepsis mortality rate: 22% (national average: 18%)
- Average time to antibiotics: 4.2 hours (goal: <3 hours)
- Blood culture contamination rate: 4.8% (benchmark: <3%)
- Recent CMS quality penalty: $1.2M for sepsis outcomes
- Dr. Martinez published abstract at ACEP 2024: "Reducing Sepsis Mortality Through Early Recognition"
- Hospital recently launched "Code Sepsis" rapid response team
- ED throughput: 180 suspected sepsis cases/month, 45 confirmed
- Lab blood culture TAT: 18-24 hours (delays antibiotic de-escalation)
"""
}

async def test_hospital_specificity():
    """Test that generated emails include hospital-specific facts."""
    
    print("=" * 80)
    print("TESTING: Hospital-Specific Fact Extraction in EmailWriterAgent")
    print("=" * 80)
    print()
    
    # Initialize agent
    agent = EmailWriterAgent("EmailWriterAgent_Test")
    
    # Test all 5 AI styles
    styles = [
        "healthcare_professional",
        "direct_urgent",
        "technical_direct",
        "executive_brief",
        "consultative"
    ]
    
    results = []
    
    for style in styles:
        print(f"\n{'=' * 80}")
        print(f"Testing Style: {style.upper()}")
        print(f"{'=' * 80}\n")
        
        # Prepare task
        task = {
            **SAMPLE_HOSPITAL_DATA,
            "generation_mode": "ai_style",
            "mode_config": {"style_key": style}
        }
        
        # Generate email
        result = await agent.run(task)
        
        # EmailWriterAgent returns the email directly, not wrapped in {status: success, email: ...}
        if "email_subject" in result and "email_body" in result:
            subject = result.get("email_subject", "")
            body = result.get("email_body", "")
            quality_score = result.get("quality_score", 0)
            
            print(f"Subject: {subject}")
            print(f"\nBody:\n{body}")
            print(f"\nQuality Score: {quality_score}/10")
            
            # Check for hospital-specific facts
            hospital_facts_found = []
            
            # Check for specific metrics from the report
            fact_indicators = [
                ("SEP-1", "SEP-1 compliance metric"),
                ("68%", "Current SEP-1 compliance percentage"),
                ("22%", "Sepsis mortality rate"),
                ("4.2 hours", "Time to antibiotics"),
                ("CMS", "CMS quality measures"),
                ("2 stars", "CMS star rating"),
                ("$1.2M", "Quality penalty amount"),
                ("ACEP", "Published abstract reference"),
                ("Code Sepsis", "Rapid response team initiative"),
                ("180", "Monthly sepsis case volume"),
                ("18-24 hours", "Blood culture TAT"),
                ("Memorial Regional", "Hospital name"),
            ]
            
            combined_text = subject + " " + body
            
            for indicator, description in fact_indicators:
                if indicator.lower() in combined_text.lower():
                    hospital_facts_found.append(description)
            
            print(f"\nHospital-Specific Facts Referenced:")
            if hospital_facts_found:
                for fact in hospital_facts_found:
                    print(f"  ✓ {fact}")
            else:
                print("  ✗ NO HOSPITAL-SPECIFIC FACTS FOUND")
            
            # Evaluate specificity
            specificity_score = len(hospital_facts_found)
            if specificity_score >= 2:
                specificity_grade = "EXCELLENT"
            elif specificity_score == 1:
                specificity_grade = "GOOD"
            else:
                specificity_grade = "POOR - NEEDS IMPROVEMENT"
            
            print(f"\nSpecificity Grade: {specificity_grade} ({specificity_score} facts)")
            
            results.append({
                "style": style,
                "quality_score": quality_score,
                "specificity_score": specificity_score,
                "facts_found": hospital_facts_found,
                "grade": specificity_grade
            })
        else:
            print(f"ERROR: {result.get('error_message', 'Unknown error')}")
            results.append({
                "style": style,
                "error": result.get('error_message', 'Unknown error')
            })
    
    # Summary
    print(f"\n\n{'=' * 80}")
    print("TEST SUMMARY")
    print(f"{'=' * 80}\n")
    
    successful_tests = [r for r in results if "error" not in r]
    
    if successful_tests:
        avg_quality = sum(r["quality_score"] for r in successful_tests) / len(successful_tests)
        avg_specificity = sum(r["specificity_score"] for r in successful_tests) / len(successful_tests)
        
        print(f"Successful Tests: {len(successful_tests)}/{len(results)}")
        print(f"Average Quality Score: {avg_quality:.1f}/10")
        print(f"Average Specificity Score: {avg_specificity:.1f} facts per email")
        print()
        
        for result in successful_tests:
            print(f"{result['style']:25} | Quality: {result['quality_score']}/10 | Facts: {result['specificity_score']} | {result['grade']}")
        
        # Overall assessment
        print()
        if avg_specificity >= 2:
            print("✓ PASS: Emails consistently reference hospital-specific facts")
        elif avg_specificity >= 1:
            print("⚠ PARTIAL: Some hospital-specific facts used, but could be improved")
        else:
            print("✗ FAIL: Emails lack hospital-specific evidence")
    else:
        print("✗ ALL TESTS FAILED")
        for result in results:
            print(f"{result['style']}: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    asyncio.run(test_hospital_specificity())
