"""
Mock LLM client for testing without actual API calls
"""
from tests.fixtures.test_data import (
    MOCK_STAKEHOLDER_EXTRACTION_RESPONSE,
    MOCK_COMPANY_SUMMARY_RESPONSE,
    MOCK_EMAIL_GENERATION_RESPONSE,
    MOCK_EMAIL_EVALUATION_RESPONSE,
    MOCK_EMAIL_REFINEMENT_RESPONSE
)

class MockLLMClient:
    """
    Mock LLM client that returns predefined responses for testing.
    """
    def __init__(self, model="google/gemini-2.5-flash"):
        self.model = model
        self.call_count = 0
        self.last_messages = None
        
    def get_completion(self, messages, max_tokens=2048, temperature=0.7):
        """
        Return mock responses based on the prompt content.
        """
        self.call_count += 1
        self.last_messages = messages
        
        # Extract user message content
        user_message = ""
        for msg in messages:
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        
        # Return appropriate mock response based on prompt content
        if "extract" in user_message.lower() and "stakeholder" in user_message.lower():
            return MOCK_STAKEHOLDER_EXTRACTION_RESPONSE
        
        elif ("summary" in user_message.lower() or "summarize" in user_message.lower()) and "company" in user_message.lower():
            return MOCK_COMPANY_SUMMARY_RESPONSE
        
        elif "evaluate" in user_message.lower() or "evaluation" in user_message.lower() or "quality" in user_message.lower():
            return MOCK_EMAIL_EVALUATION_RESPONSE
        
        elif "refine" in user_message.lower() or "improve" in user_message.lower():
            return MOCK_EMAIL_REFINEMENT_RESPONSE
        
        elif "pain_points_section" in user_message.lower() or "application_section" in user_message.lower():
            # Template AI context generation
            return '{"pain_points_section": "Organizations struggle with high costs and complexity.", "application_section": "This directly addresses your current initiatives."}'
        
        elif "opening_pain" in user_message.lower() or "struggle_bullets" in user_message.lower():
            # Casual bro-y template
            return '{"opening_pain": "your team is stuck dealing with high costs", "struggle_bullets": ["cost overruns", "slow performance", "complex integration"], "application": "this changes everything for your use case"}'
        
        elif "recognition_section" in user_message.lower() or "alignment_section" in user_message.lower():
            # Partnership template
            return '{"recognition_section": "Your recent work has been impressive.", "alignment_section": "This aligns perfectly with your strategic goals."}'
        
        else:
            # Default to email generation response
            return MOCK_EMAIL_GENERATION_RESPONSE
    
    def reset(self):
        """Reset call count and last messages."""
        self.call_count = 0
        self.last_messages = None
