"""
Unit tests for Email Writer Agent
"""
import pytest
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from agents.email_writer import EmailWriterAgent
from tests.fixtures.mock_llm import MockLLMClient
from tests.fixtures.test_data import SAMPLE_TASK, SAMPLE_EMAIL

class TestEmailWriterAgent:
    """Test suite for EmailWriterAgent"""
    
    @pytest.fixture
    def agent(self):
        """Create an EmailWriterAgent with mock LLM client"""
        agent = EmailWriterAgent("TestEmailWriter")
        agent.llm_client = MockLLMClient()
        return agent
    
    @pytest.mark.asyncio
    async def test_run_generates_email(self, agent):
        """Test that run() generates an email successfully"""
        result = await agent.run(SAMPLE_TASK)
        
        assert result is not None
        assert "stakeholder_name" in result
        assert "email_subject" in result
        assert "email_body" in result
        assert "quality_score" in result
        assert result["stakeholder_name"] == SAMPLE_TASK["stakeholder_name"]
    
    @pytest.mark.asyncio
    async def test_run_with_ai_style_mode(self, agent):
        """Test email generation with AI style mode"""
        task = SAMPLE_TASK.copy()
        task["generation_mode"] = "ai_style"
        task["mode_config"] = {"style_key": "technical_direct"}
        
        result = await agent.run(task)
        
        assert result["generation_mode"] == "ai_style"
        assert result["quality_score"] > 0
    
    @pytest.mark.asyncio
    async def test_run_with_template_mode(self, agent):
        """Test email generation with template mode"""
        task = SAMPLE_TASK.copy()
        task["generation_mode"] = "template"
        task["mode_config"] = {
            "template_key": "problem_solution",
            "user_fields": {
                "subject": "Test Subject",
                "opening": "Test Opening",
                "benefit_1": "Benefit 1",
                "benefit_2": "Benefit 2",
                "benefit_3": "Benefit 3",
                "call_to_action": "Let's talk",
                "closing": "Best regards"
            }
        }
        
        result = await agent.run(task)
        
        assert result["generation_mode"] == "template"
        assert "Test Subject" in result["email_subject"] or result["email_subject"] != ""
    
    @pytest.mark.asyncio
    async def test_run_with_custom_mode(self, agent):
        """Test email generation with custom prompt mode"""
        task = SAMPLE_TASK.copy()
        task["generation_mode"] = "custom"
        task["mode_config"] = {
            "custom_instructions": "Write a brief, friendly email introducing our AI optimization platform."
        }
        
        result = await agent.run(task)
        
        assert result["generation_mode"] == "custom"
        assert result["email_body"] != ""
    
    @pytest.mark.asyncio
    async def test_quality_threshold_triggers_refinement(self, agent):
        """Test that low quality scores trigger refinement"""
        # Set a high threshold to force refinement
        agent.quality_threshold = 10.0
        
        result = await agent.run(SAMPLE_TASK)
        
        # Check that refinement was attempted
        assert "refined" in result["reflection_notes"].lower() or "refine" in result["reflection_notes"].lower()
    
    @pytest.mark.asyncio
    async def test_error_handling_for_invalid_mode(self, agent):
        """Test error handling for invalid generation mode"""
        task = SAMPLE_TASK.copy()
        task["generation_mode"] = "invalid_mode"
        
        result = await agent.run(task)
        
        # Should fallback to ai_style and still generate
        assert result is not None
        assert result["email_body"] != ""
    
    def test_format_output(self, agent):
        """Test output formatting"""
        email = {"subject": "Test", "body": "Test body"}
        result = agent._format_output(SAMPLE_TASK, email, 8.5, "Test notes")
        
        assert result["stakeholder_name"] == SAMPLE_TASK["stakeholder_name"]
        assert result["email_subject"] == "Test"
        assert result["email_body"] == "Test body"
        assert result["quality_score"] == 8.5
        assert result["reflection_notes"] == "Test notes"
    
    def test_error_response(self, agent):
        """Test error response generation"""
        result = agent._error_response(SAMPLE_TASK, "Test error")
        
        assert result["email_subject"] == "ERROR"
        assert "Test error" in result["email_body"]
        assert result["quality_score"] == 0.0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
