"""
Integration tests for Orchestrator Agent
"""
import pytest
import asyncio
import sys
import os
import tempfile

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from agents.orchestrator import OrchestratorAgent
from tests.fixtures.mock_llm import MockLLMClient
from tests.fixtures.test_data import SAMPLE_RESEARCH_REPORT

class TestOrchestratorIntegration:
    """Integration test suite for OrchestratorAgent"""
    
    @pytest.fixture
    def agent(self):
        """Create an OrchestratorAgent with mock LLM client"""
        agent = OrchestratorAgent()
        agent.llm_client = MockLLMClient()
        return agent
    
    @pytest.fixture
    def report_file(self):
        """Create a temporary report file"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            f.write(SAMPLE_RESEARCH_REPORT)
            temp_path = f.name
        
        yield temp_path
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    def test_extract_stakeholders(self, agent):
        """Test stakeholder extraction from report"""
        stakeholders = agent._extract_stakeholders(SAMPLE_RESEARCH_REPORT)
        
        assert stakeholders is not None
        assert isinstance(stakeholders, list)
        assert len(stakeholders) > 0
        
        # Check structure
        for stakeholder in stakeholders:
            assert "name" in stakeholder
            assert "title" in stakeholder
            assert "details" in stakeholder
    
    def test_get_company_summary(self, agent):
        """Test company summary generation"""
        summary = agent._get_company_summary(SAMPLE_RESEARCH_REPORT)
        
        assert summary is not None
        assert isinstance(summary, str)
        assert len(summary) > 0
    
    def test_present_stakeholders_for_selection(self, agent, monkeypatch):
        """Test stakeholder selection interface"""
        stakeholders = [
            {"name": "Jane Smith", "title": "CTO", "details": "Leading AI"},
            {"name": "John Doe", "title": "VP", "details": "Product management"}
        ]
        
        # Mock user input to select all stakeholders
        inputs = iter(["1,2"])
        monkeypatch.setattr('builtins.input', lambda _: next(inputs))
        
        selected = agent._present_stakeholders_for_selection(stakeholders)
        
        assert len(selected) == 2
        assert selected[0]["name"] == "Jane Smith"
        assert selected[1]["name"] == "John Doe"
    
    def test_present_stakeholders_select_subset(self, agent, monkeypatch):
        """Test selecting subset of stakeholders"""
        stakeholders = [
            {"name": "Jane Smith", "title": "CTO", "details": "Leading AI"},
            {"name": "John Doe", "title": "VP", "details": "Product management"},
            {"name": "Alice Brown", "title": "Director", "details": "Engineering"}
        ]
        
        # Mock user input to select first and third
        inputs = iter(["1,3"])
        monkeypatch.setattr('builtins.input', lambda _: next(inputs))
        
        selected = agent._present_stakeholders_for_selection(stakeholders)
        
        assert len(selected) == 2
        assert selected[0]["name"] == "Jane Smith"
        assert selected[1]["name"] == "Alice Brown"
    
    @pytest.mark.asyncio
    async def test_run_end_to_end_mock(self, agent, report_file, monkeypatch):
        """Test end-to-end workflow with mocked components"""
        # Mock user input for stakeholder selection
        inputs = iter(["1,2"])  # Select both stakeholders
        monkeypatch.setattr('builtins.input', lambda _: next(inputs))
        
        # Mock the task planner to avoid actual agent spawning
        from agents.task_planner import TaskPlannerAgent
        original_run = TaskPlannerAgent.run
        
        async def mock_task_planner_run(self, stakeholders, report, company_summary, generation_mode, mode_config):
            # Return mock emails for each stakeholder
            return [
                {
                    "stakeholder_name": s["name"],
                    "stakeholder_title": s["title"],
                    "email_subject": f"Test email for {s['name']}",
                    "email_body": f"Email body for {s['name']}",
                    "quality_score": 8.5,
                    "reflection_notes": "Test notes",
                    "generation_mode": generation_mode
                }
                for s in stakeholders
            ]
        
        TaskPlannerAgent.run = mock_task_planner_run
        
        try:
            generation_mode = "ai_style"
            mode_config = {"style_key": "technical_direct"}
            
            emails = await agent.run(report_file, generation_mode, mode_config)
            
            assert emails is not None
            assert isinstance(emails, list)
            assert len(emails) == 2
            
            # Verify email structure
            for email in emails:
                assert "stakeholder_name" in email
                assert "email_subject" in email
                assert "email_body" in email
                assert "quality_score" in email
        
        finally:
            # Restore original method
            TaskPlannerAgent.run = original_run

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
