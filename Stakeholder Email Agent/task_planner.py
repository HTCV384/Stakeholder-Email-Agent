            "relevant_context": relevant_context,
            "generation_mode": generation_mode,
            "mode_config": mode_config,
            "user_id": user_id
        }
        
        return task
    
    def _extract_relevant_context(self, stakeholder: dict, report: str) -> str:
        """
        Extract relevant sections from the report for this stakeholder.
        Uses LLM to identify pertinent information.
        """
        prompt = CONTEXT_EXTRACTION_PROMPT.format(
            stakeholder_name=stakeholder['name'],
            stakeholder_title=stakeholder['title'],
            stakeholder_details=stakeholder['details'],
            report=report
        )
        