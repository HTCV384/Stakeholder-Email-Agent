        }


async def generate_emails(
    report_input: dict,
    selected_stakeholders: list,
    company_summary: str,
    generation_mode: str,
    mode_config: dict,
    logger: WorkflowLogger
):
    """Generate emails for selected stakeholders"""
    try:
        logger.log("info", "Orchestrator", f"Starting email generation for {len(selected_stakeholders)} stakeholders...")
        
        orchestrator = OrchestratorAgent()
        
        # Generate emails for pre-selected stakeholders (non-interactive)
        emails = await orchestrator.generate_emails_for_selected_stakeholders(
            report_input=report_input,
            selected_stakeholders=selected_stakeholders,
            company_summary=company_summary,
            generation_mode=generation_mode,
            mode_config=mode_config
        )
        
        logger.log("info", "Orchestrator", f"Generated {len(emails)} emails")
        
        return {
            "success": True,
            "emails": emails,
            "logs": logger.logs
        }
    except Exception as e:
        logger.log("error", "Orchestrator", f"Generation failed: {str(e)}", test_id="L3-WORKFLOW-001")