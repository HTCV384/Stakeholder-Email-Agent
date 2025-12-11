        
        Returns:
            List of generated email dictionaries
        """
        print(f"[{self.name}] Starting email generation for {len(selected_stakeholders)} pre-selected stakeholders...")
        print(f"[{self.name}] Generation Mode: {generation_mode}")
        
        # Load report content for context
        try:
            report = self._load_report(report_input)
            print(f"[{self.name}] Report loaded successfully ({len(report)} characters)")
        except Exception as e:
            print(f"[{self.name}] ERROR: Failed to load report: {e}")
            return []
        
        # Delegate to Task Planner Agent
        print(f"[{self.name}] Delegating to Task Planner Agent...")
        task_planner = TaskPlannerAgent()
        emails = await task_planner.run(
            selected_stakeholders,
            self.report_content,
            company_summary,
            generation_mode,
            mode_config,
            user_id
        )
        
        print(f"[{self.name}] Email generation complete. Generated {len(emails)} emails.")
        return emails
    
    def _load_report(self, report_input: dict) -> str:
        """
        Load report content from either file URL or text content.
        
        Args:
            report_input: Dictionary with 'type' and either 'url' or 'content'
        
        Returns:
            Report content as string
        """
        if self.report_content:
            return self.report_content
            
        if report_input['type'] == 'file_url':
            # Download and extract text from PDF/HTML files
            url = report_input['url']
            print(f"[{self.name}] Downloading and extracting text from: {url}")
            
            try:
                if url.lower().endswith('.pdf'):
                    text_content = extract_text_from_pdf_url(url)
                elif url.lower().endswith(('.html', '.htm')):
                    text_content = extract_text_from_html_url(url)
                else:
                    # Try PDF extraction as default
                    text_content = extract_text_from_pdf_url(url)
                
                print(f"[{self.name}] Extracted {len(text_content)} characters from file")
                self.report_content = text_content
                return text_content