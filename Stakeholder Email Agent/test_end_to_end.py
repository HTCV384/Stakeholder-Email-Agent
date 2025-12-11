        EmailWriterAgent.__init__ = lambda self, name: mock_agent_init(self, name)
        
        # Mock user input
        inputs = iter(["1"])  # Select first stakeholder
        monkeypatch.setattr('builtins.input', lambda _: next(inputs))
        
        # Run workflow
        orchestrator = OrchestratorAgent()
        generation_mode = "template"
        mode_config = {
            "template_key": "problem_solution",
            "user_fields": {
                "subject": "Solving your AI challenges",
                "opening": "I noticed your recent initiatives",
                "benefit_1": "Reduce costs by 50%",
                "benefit_2": "Improve efficiency",
                "benefit_3": "Scale faster",
                "call_to_action": "Let's schedule a call",
                "closing": "Best regards"
            }
        }
        
        emails = await orchestrator.run(report_file, generation_mode, mode_config)
        
        # Verify results
        assert emails is not None
        assert len(emails) == 1
        assert emails[0]["generation_mode"] == "template"
    
    @pytest.mark.asyncio
    async def test_full_workflow_custom_mode(self, report_file, monkeypatch):
        """Test complete workflow with custom prompt mode"""
        # Mock all agents
        def mock_agent_init(self, name=None):
            if name: