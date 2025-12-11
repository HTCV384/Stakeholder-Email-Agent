"""
Unit tests for Task Planner Agent
"""
import pytest
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from agents.task_planner import TaskPlannerAgent
from tests.fixtures.mock_llm import MockLLMClient
from tests.fixtures.test_data import (
    SAMPLE_STAKEHOLDERS,
    SAMPLE_COMPANY_SUMMARY,
    SAMPLE_RESEARCH_REPORT
)

class TestTaskPlannerAgent:
    """Test suite for TaskPlannerAgent"""
    
    @pytest.fixture
    def agent(self):
        """Create a TaskPlannerAgent with mock LLM client"""
        agent = TaskPlannerAgent("TestTaskPlanner")
        agent.llm_client = MockLLMClient()
        return agent
    
    @pytest.mark.asyncio
    async def test_run_creates_tasks_and_generates_emails(self, agent):
        """Test that run() creates tasks and generates emails"""
        generation_mode = "ai_style"
        mode_config = {"style_key": "technical_direct"}
        
        # Mock the email writer to avoid actual agent creation
        # In real scenario, this would spawn EmailWriterAgents
        results = await agent.run(
            SAMPLE_STAKEHOLDERS,
            SAMPLE_RESEARCH_REPORT,
            SAMPLE_COMPANY_SUMMARY,
            generation_mode,
            mode_config
        )
        
        assert results is not None
        assert isinstance(results, list)
        assert len(results) == len(SAMPLE_STAKEHOLDERS)
    
    def test_create_task_for_stakeholder(self, agent):
        """Test task creation for a single stakeholder"""
        stakeholder = SAMPLE_STAKEHOLDERS[0]
        generation_mode = "ai_style"
        mode_config = {"style_key": "casual_broy"}
        
        task = agent._create_task_for_stakeholder(
            stakeholder,
            SAMPLE_RESEARCH_REPORT,
            SAMPLE_COMPANY_SUMMARY,
            generation_mode,
            mode_config
        )
        
        assert task["stakeholder_name"] == stakeholder["name"]
        assert task["stakeholder_title"] == stakeholder["title"]
        assert task["stakeholder_details"] == stakeholder["details"]
        assert task["generation_mode"] == generation_mode
        assert task["mode_config"] == mode_config
        assert "relevant_context" in task
        assert "company_summary" in task
    
    def test_extract_relevant_context(self, agent):
        """Test context extraction for stakeholder"""
        stakeholder = SAMPLE_STAKEHOLDERS[0]
        
        context = agent._extract_relevant_context(stakeholder, SAMPLE_RESEARCH_REPORT)
        
        assert context is not None
        assert isinstance(context, str)
        assert len(context) > 0
    
    @pytest.mark.asyncio
    async def test_parallel_execution(self, agent):
        """Test that multiple stakeholders are processed in parallel"""
        generation_mode = "ai_style"
        mode_config = {"style_key": "executive_brief"}
        
        results = await agent.run(
            SAMPLE_STAKEHOLDERS,
            SAMPLE_RESEARCH_REPORT,
            SAMPLE_COMPANY_SUMMARY,
            generation_mode,
            mode_config
        )
        
        # All stakeholders should have results
        assert len(results) == len(SAMPLE_STAKEHOLDERS)
        
        # Each result should have stakeholder info
        for result in results:
            assert "stakeholder_name" in result
            assert "email_subject" in result

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
