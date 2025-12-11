# Stakeholder Email Outreach - Feature Documentation

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Overview

This document provides detailed descriptions of all features available in the Stakeholder Email Outreach application, including usage instructions, best practices, and tips for maximizing effectiveness.

---

## Core Workflow Features

### 1. Research Report Upload

**Description**

The upload feature accepts research reports in multiple formats (PDF, HTML, TXT) containing information about healthcare organizations and their stakeholders. The system stores uploaded files securely in S3 and prepares them for AI-powered analysis.

**Supported File Types**

- **PDF** - Portable Document Format files up to 10MB
- **HTML** - Web pages saved as HTML files
- **TXT** - Plain text files with UTF-8 encoding

**Usage Instructions**

Navigate to the Upload step and either drag a file onto the upload area or click "Choose File" to browse your file system. The system will validate the file type and size before accepting the upload. Once uploaded, the file is immediately stored in S3 and the workflow advances to the Extract step automatically.

**Best Practices**

For optimal stakeholder extraction, ensure your research reports include clear sections identifying key personnel with their titles and roles. Reports with structured formatting (headings, bullet points, tables) produce better extraction results than unstructured narrative text. If your report includes multiple organizations, consider uploading separate reports for each organization to maintain clear context boundaries.

**Troubleshooting**

If upload fails, verify that your file is under the 10MB size limit and in a supported format. PDF files with complex formatting or scanned images may take longer to process. For scanned PDFs, consider using OCR software to convert to searchable text before uploading.

### 2. Stakeholder Extraction

**Description**

The extraction feature uses AI-powered natural language processing to identify key stakeholders from uploaded research reports. The system analyzes the document structure, identifies names and titles, and extracts relevant context about each stakeholder's role and responsibilities.

**Extraction Process**

The research agent scans the uploaded document for patterns indicating stakeholder information, such as organizational charts, leadership sections, and contact directories. The agent uses named entity recognition to identify person names and applies contextual analysis to determine job titles and roles. The extraction process typically completes within 30-60 seconds depending on document length.

**Extracted Information**

For each stakeholder, the system extracts:

- **Full Name** - First and last name, including credentials (MD, PhD, RN, etc.)
- **Job Title** - Official position title within the organization
- **Role Details** - Responsibilities, department, and organizational level
- **Context** - Additional information relevant to outreach (initiatives, priorities, etc.)

**Usage Instructions**

After uploading a report, click "Upload & Extract Stakeholders" to begin the extraction process. The system will display a loading indicator while processing. Once complete, the workflow automatically advances to the Select step where you can review the extracted stakeholders. If the extraction produces unexpected results, you can return to the Upload step and try a different report format.

**Best Practices**

Review all extracted stakeholders before proceeding to ensure accuracy. The AI extraction is highly accurate but may occasionally misidentify names or titles in documents with unusual formatting. You can manually adjust stakeholder information by editing the database records if needed, though this requires technical access.

**Troubleshooting**

If extraction produces too few stakeholders, your report may lack clear stakeholder sections. Try uploading a more detailed report or a different document from the same organization. If extraction produces too many stakeholders (including non-relevant individuals), use the Select step to filter to only decision-makers and key influencers.

### 3. Stakeholder Selection

**Description**

The selection feature provides a multi-select interface for choosing which extracted stakeholders should receive personalized emails. Selections are persisted to the database immediately, ensuring no loss of state when navigating between workflow steps.

**Selection Interface**

Each stakeholder is displayed in a card format showing their name, title, and role details. Checkboxes allow individual selection, and the "Select All" button in the header enables bulk selection of all extracted stakeholders. The Continue button at the bottom shows the current selection count and is disabled until at least one stakeholder is selected.

**Select All Functionality**

The Select All button intelligently toggles between selecting all stakeholders and deselecting all stakeholders based on the current state. When clicked, the button updates the database for all stakeholders in parallel, providing instant feedback through a success toast notification. This ensures selections persist even if you navigate away from the page or refresh your browser.

**Usage Instructions**

Review each extracted stakeholder and check the box next to those you want to target with personalized emails. For large stakeholder lists, use the Select All button to select everyone, then uncheck individuals you want to exclude. The selection count in the Continue button updates in real-time as you make changes. Click Continue when your selection is complete to advance to the Configure step.

**Best Practices**

Focus your selection on decision-makers and key influencers who have the authority to act on your outreach. For healthcare organizations, this typically includes C-suite executives, department directors, and clinical leaders. Avoid selecting administrative staff or individuals outside your target audience, as this dilutes your campaign effectiveness and wastes generation resources.

**Troubleshooting**

If selections appear to reset when returning to the Select step, this indicates a database persistence issue. Verify that you're using the Select All button or individual checkboxes (which trigger database updates) rather than any custom selection method. If the issue persists, check the debug console for error messages related to the updateSelectionMutation.

### 4. Email Template Configuration

**Description**

The configuration feature provides a unified dropdown for selecting email templates that guide the AI generation process. Templates define the tone, structure, and content approach for generated emails, ranging from ultra-casual peer-to-peer outreach to formal executive communications.

**Template Types**

The system includes seven pre-built templates:

**Casual Insider Approach** - Ultra-casual, peer-to-peer tone using first names only and lowercase style. Ideal for reaching out to clinical leaders and operational managers who prefer direct, authentic communication. This template focuses on revealing hidden problems in current workflows and positioning your solution as a system transformation rather than a product sale.

**Product Introduction** - Professional introduction to IntelliSep with balanced technical detail and business value. Suitable for initial outreach to stakeholders who are unfamiliar with your solution. This template emphasizes the problem being solved, the unique approach, and clear next steps.

**Value Proposition** - ROI-focused template with specific metrics and financial impact. Best for CFOs, finance directors, and other stakeholders who make decisions based on quantifiable business outcomes. This template includes cost-benefit analysis and implementation timeline.

**Follow-up / Re-engagement** - Designed for stakeholders who have been contacted previously but haven't responded. This template references the previous outreach, provides new information or context, and offers flexible engagement options.

**Executive Summary** - Brief, high-level overview suitable for C-suite executives with limited time. This template delivers key points in under 150 words with a single clear call-to-action.

**Clinical Evidence** - Data-driven template with research citations and clinical outcomes. Ideal for Chief Medical Officers, clinical directors, and other stakeholders who prioritize evidence-based decision making. This template includes peer-reviewed study references and patient outcome data.

**Partnership Opportunity** - Collaboration-focused template that positions the outreach as a mutual opportunity rather than a sales pitch. Suitable for stakeholders interested in innovation partnerships, pilot programs, or co-development initiatives.

**Template Selection**

The template dropdown shows all available templates sorted by last usage, with recently used templates appearing at the top. System templates (created by administrators) are accessible to all users, while custom templates (created by individual users) appear only for their creator. Each template includes a description to help you choose the appropriate tone and approach.

**Template Preview**

Click the "Preview Template" button to see how the selected template will render with actual stakeholder data from your workflow. The preview uses real names, titles, and company information to give you an accurate representation of the final email. If you're not satisfied with the preview, select a different template and preview again before generating.

**Usage Instructions**

In the Configure step, open the template dropdown and select the template that best matches your outreach goals and target audience. Review the template description to understand its tone and structure. Click "Preview Template" to see a sample email with your actual stakeholder data. When satisfied with your selection, click "Generate Emails" to begin the generation process.

**Best Practices**

Match template tone to stakeholder seniority and communication style. C-suite executives typically prefer brief, high-level summaries, while operational managers and clinical leaders often engage better with detailed, problem-focused content. When in doubt, start with the Product Introduction template for initial outreach, then use more specialized templates for follow-ups based on stakeholder response patterns.

**Troubleshooting**

If the template preview shows placeholder data instead of your actual stakeholder information, verify that you have a valid workflowId and have completed the Select step. The preview requires at least one selected stakeholder to generate realistic sample content. If all templates produce similar output despite different prompts, check the debug console for LLM errors or truncation issues.

### 5. Email Generation

**Description**

The generation feature creates personalized emails for all selected stakeholders using the chosen template and AI-powered content generation. The system processes stakeholders in parallel, adapting content to each individual's role, title, and organizational context.

**Generation Process**

When you click "Generate Emails," the backend spawns a Python agent for each selected stakeholder. Each agent receives the stakeholder's information, the company summary, and the selected template prompt. The agent constructs a detailed prompt for the LLM that includes all context and instructions, then requests a completion from OpenRouter. The LLM generates a personalized email with subject line and body, which the agent parses and saves to the database.

**Generation Time**

Generation typically takes 10-30 seconds per stakeholder, depending on template complexity and LLM response time. The system processes multiple stakeholders concurrently, so generating emails for 10 stakeholders takes approximately the same time as generating for 3-4 stakeholders. The workflow displays a loading indicator during generation and automatically advances to the Review step when complete.

**Personalization**

Each generated email is personalized based on:

- **Stakeholder Name** - First name extraction for casual templates, full name for formal templates
- **Job Title** - Role-specific language and priorities
- **Organizational Context** - Company-specific metrics and challenges
- **Template Tone** - Consistent voice and structure per template
- **Dynamic Variables** - Hospital name, metrics, and contextual data

**Usage Instructions**

After selecting a template in the Configure step, click "Generate Emails" to begin the generation process. The system will display a loading indicator with a message that generation may take a few moments. Do not navigate away from the page during generation, as this may interrupt the process. When generation completes, the workflow automatically advances to the Review step where you can see all generated emails.

**Best Practices**

Generate emails during off-peak hours if you have large stakeholder lists (20+ individuals) to ensure optimal LLM response times. Review the debug console during generation to monitor progress and identify any errors early. If generation fails for specific stakeholders, note the error messages and adjust your template or stakeholder data before retrying.

**Troubleshooting**

If generation fails with "JSON Parse Error," this indicates the LLM response was truncated. This issue has been resolved in version 1.0.0 by increasing max_tokens to 1536, but may still occur with extremely long templates. If generation produces generic content that lacks personalization, verify that your stakeholder data includes sufficient context in the details field. If generation hangs indefinitely, check your network connection and OpenRouter API status.

### 6. Email Review and Export

**Description**

The review feature presents all generated emails in an editable interface where you can refine content before exporting. Each email is displayed with the stakeholder's context, allowing you to verify personalization and make final adjustments.

**Review Interface**

The review panel shows each stakeholder's name, title, and organization at the top, followed by the email subject line and body. The template name used for generation is displayed in the panel header, helping you verify that the correct template was applied. Each email is editable in-place, with changes automatically saved to the database as you type.

**Editing Capabilities**

You can edit both the subject line and email body directly in the review interface. The subject line is a single-line input field, while the email body is a multi-line textarea that preserves formatting. Changes are saved automatically with a debounce delay, so you can type continuously without triggering excessive database updates. There is no explicit "Save" button—all changes persist immediately.

**Template Tracking**

The review panel displays which template was used to generate each email, helping you understand why certain emails have different tones or structures. This is particularly useful when troubleshooting generation issues or comparing template effectiveness across stakeholders.

**CSV Export**

Click the "Export to CSV" button to download all emails in a format suitable for import into email clients or CRM systems. The CSV includes columns for recipient name, title, company, email subject, and email body. The export preserves all formatting and line breaks, though you may need to adjust formatting when importing into specific platforms.

**Usage Instructions**

Review each generated email for accuracy and personalization. Make any necessary edits to subject lines or body content. Pay particular attention to stakeholder names, company-specific metrics, and calls-to-action. When satisfied with all emails, click "Export to CSV" to download the file. Save the CSV to your preferred location and import into your email platform or CRM system.

**Best Practices**

Read each email aloud to catch awkward phrasing or unnatural language that the AI may have generated. Verify that all stakeholder names are spelled correctly and titles are accurate. Check that company-specific data (metrics, initiatives, etc.) is current and correct. Add personal touches to high-priority stakeholders, such as references to recent news or shared connections. Before exporting, do a final pass to ensure consistent tone and messaging across all emails.

**Troubleshooting**

If edits don't seem to save, check your network connection and verify that you're not in an offline state. If the CSV export produces malformed data, verify that your email bodies don't contain unescaped special characters. If you need to regenerate specific emails after editing, you'll need to return to the Configure step and generate again, which will overwrite your edits.

---

## Template Management Features

### Creating Custom Templates

**Description**

The template creation feature allows users to define their own email generation prompts, enabling customization of tone, structure, and content beyond the pre-built system templates.

**Template Editor**

The template editor provides a form with three fields:

- **Template Name** - A descriptive name for easy identification in the dropdown
- **Description** - A brief explanation of when to use this template
- **Prompt Template** - The detailed AI prompt that guides email generation

**Prompt Engineering**

The prompt template field accepts natural language instructions that will be sent to the LLM along with stakeholder context. Effective prompts include:

- **Tone Guidelines** - Specify formal, casual, or conversational tone
- **Structure Requirements** - Define sections, length, and format
- **Content Focus** - Emphasize specific topics or value propositions
- **Style Rules** - Capitalization, punctuation, and formatting preferences
- **Examples** - Provide sample emails to guide the AI

**Dynamic Variables**

Templates support dynamic variable insertion using curly brace syntax:

- `{stakeholder_name}` - Full name of the stakeholder
- `{stakeholder_title}` - Job title
- `{company_name}` - Organization name
- `{company_summary}` - Extracted company context
- `{relevant_context}` - Stakeholder-specific details

**Usage Instructions**

Navigate to the Configure step and click "Create New Template" to open the template editor. Enter a descriptive name and explanation of when to use this template. In the prompt template field, write detailed instructions for the AI, including tone, structure, and content requirements. Use dynamic variables to insert stakeholder-specific data. Click "Save Template" to add it to your template library. The new template will appear at the top of the template dropdown for immediate use.

**Best Practices**

Start with a system template and modify it rather than creating from scratch. This ensures you include all necessary elements like tone guidelines and structure requirements. Test new templates with a small stakeholder sample before using them for large campaigns. Include explicit examples in your prompt to guide the AI toward your desired output. Keep prompts focused—overly complex prompts with conflicting instructions produce inconsistent results.

**Troubleshooting**

If your custom template produces generic output, add more specific instructions and examples to the prompt. If the AI ignores certain instructions, rephrase them more explicitly or move them to the beginning of the prompt. If generation fails with custom templates, verify that your prompt doesn't exceed reasonable length limits (aim for under 2000 characters).

### Editing Templates

**Description**

The template editing feature allows modification of custom templates you've created. System templates cannot be edited, ensuring consistent baseline options for all users.

**Edit Interface**

Click the edit icon next to any custom template in your template list to open the editor with the current template content pre-filled. Make your changes to the name, description, or prompt template, then click "Save Changes" to update the template. All future uses of this template will use the updated version.

**Version Control**

Template edits are not versioned—the updated template replaces the previous version immediately. If you want to preserve the old version, create a new template with a different name before editing the original.

**Usage Instructions**

Navigate to the template management section and locate the template you want to edit. Click the edit icon to open the editor. Make your desired changes to any of the three fields. Click "Save Changes" to apply the updates. Test the updated template with a sample generation to verify it produces the expected results.

**Best Practices**

Before editing a template that's been used successfully in the past, consider creating a copy with a new name to preserve the working version. Document your changes in the template description so you can track what was modified and why. After editing, test the template with diverse stakeholder types to ensure it works well across different roles and seniority levels.

### Deleting Templates

**Description**

The template deletion feature allows removal of custom templates that are no longer needed. System templates cannot be deleted.

**Deletion Process**

Click the delete icon next to any custom template to remove it permanently from your template library. The system will prompt for confirmation before deleting. Once deleted, the template cannot be recovered—you'll need to recreate it if needed later.

**Impact on Existing Emails**

Deleting a template does not affect emails that were previously generated using that template. The emails remain in the database with their content intact. However, you won't be able to see which template was used for those emails if the template has been deleted.

**Usage Instructions**

Navigate to the template management section and locate the template you want to delete. Click the delete icon and confirm the deletion when prompted. The template will be removed immediately from your template library and will no longer appear in the template dropdown.

**Best Practices**

Before deleting a template, verify that you have no ongoing campaigns that rely on it. Consider archiving templates instead of deleting them by adding "[ARCHIVED]" to the name and moving them to the bottom of your list. This preserves the template for reference while making it clear it's no longer in active use.

---

## Advanced Features

### Debug Console

**Description**

The debug console provides real-time visibility into AI agent operations, including prompt construction, LLM requests, and response parsing. This feature is essential for troubleshooting generation issues and understanding how the system processes your data.

**Console Output**

The debug console displays:

- **Agent Initialization** - Confirmation that agents have started
- **Prompt Construction** - The full prompt sent to the LLM
- **LLM Requests** - Token limits and model parameters
- **LLM Responses** - Raw response content and parsing results
- **Error Messages** - Detailed error information when generation fails
- **Timing Information** - How long each operation takes

**Usage Instructions**

Click "Show" next to the Debug Console header to expand the console panel. The console updates in real-time during email generation, showing each step of the process. Scroll through the output to find specific information about stakeholder processing or error messages. Click "Hide" to collapse the console when not needed.

**Best Practices**

Keep the debug console open during your first few generations to understand the normal operation flow. When generation fails, immediately check the debug console for error messages before retrying. Copy relevant error messages when contacting support to help diagnose issues faster. Use the console to verify that your stakeholder data is being passed correctly to the AI agents.

**Troubleshooting**

If the debug console shows no output during generation, verify that the backend server is running and accessible. If you see LLM errors in the console, check your OpenRouter API key and account status. If prompts appear truncated in the console, this is normal—the full prompt is sent to the LLM even if the console display is abbreviated.

### Template Preview

**Description**

The template preview feature generates a sample email using the selected template and actual stakeholder data from your workflow, allowing you to evaluate the template before committing to full generation.

**Preview Process**

When you click "Preview Template," the system selects the first stakeholder from your selection list and generates a single email using the chosen template. This preview uses the same AI generation process as full generation, so the output accurately represents what you'll receive for all stakeholders.

**Preview Display**

The preview modal shows:

- **Stakeholder Context** - Name, title, and company
- **Email Subject** - Generated subject line
- **Email Body** - Full email content
- **Template Name** - Which template was used
- **Placeholder Warning** - If preview uses sample data instead of real data

**Usage Instructions**

In the Configure step, select a template from the dropdown, then click "Preview Template" to see a sample email. Review the subject line and body to verify the tone and content match your expectations. If satisfied, close the preview and click "Generate Emails" to create emails for all selected stakeholders. If not satisfied, select a different template and preview again.

**Best Practices**

Always preview templates before generating large batches of emails. Pay attention to how the template handles your specific stakeholder data—some templates work better with detailed context while others adapt well to minimal information. Use preview to test custom templates before using them in production campaigns. If preview shows placeholder data, return to the Select step and verify you have stakeholders selected.

**Troubleshooting**

If preview fails with an error, check the debug console for details. If preview shows generic content, verify that your stakeholder data includes sufficient details in the database. If preview takes longer than 30 seconds, check your network connection and OpenRouter API status.

---

## User Interface Features

### Responsive Design

**Description**

The application interface adapts to different screen sizes, providing optimal user experience on desktop, tablet, and mobile devices.

**Breakpoints**

The interface uses standard Tailwind CSS breakpoints:

- **Mobile** (< 640px) - Single column layout, stacked components
- **Tablet** (640px - 1024px) - Flexible layout with some side-by-side elements
- **Desktop** (> 1024px) - Full multi-column layout with sidebar and panels

**Mobile Optimizations**

On mobile devices, the workflow steps display as a vertical list instead of a horizontal progress bar. The stakeholder selection interface uses full-width cards with larger touch targets. The template dropdown expands to full screen for easier selection. The email review interface stacks stakeholder context above the email content.

**Usage Instructions**

Access the application from any device with a modern web browser. The interface will automatically adapt to your screen size. On mobile devices, rotate to landscape orientation for a wider view when reviewing emails. Use pinch-to-zoom gestures to enlarge text if needed.

**Best Practices**

For optimal experience, use a desktop or laptop computer when working with large stakeholder lists or performing detailed email editing. Mobile devices work well for quick reviews and approvals but may be cumbersome for extensive editing. Tablet devices offer a good middle ground for on-the-go workflow management.

### Progress Indicators

**Description**

The workflow progress indicators show your current position in the six-step process and allow navigation between completed steps.

**Progress Display**

The progress bar at the top of the page shows all six workflow steps with visual indicators:

- **Active Step** - Highlighted in primary color with filled icon
- **Completed Steps** - Green checkmark with green icon
- **Future Steps** - Gray with outline icon
- **Clickable Steps** - Cursor changes to pointer on hover

**Navigation**

Click any completed step to return to that stage of the workflow. You can move backward through the workflow at any time to review or modify previous selections. Forward navigation is only allowed when the current step is complete (e.g., you can't skip from Upload directly to Configure).

**Usage Instructions**

Use the progress indicators to understand where you are in the workflow. Click completed steps to navigate backward if you need to change selections or upload a different report. The indicators prevent you from skipping required steps, ensuring data integrity throughout the workflow.

**Best Practices**

Complete each step fully before advancing to avoid having to navigate backward. If you need to make changes after advancing, use the progress indicators to return to the appropriate step rather than refreshing the page. Remember that navigating backward doesn't lose your progress—all selections and data are preserved in the database.

---

## Security Features

### Authentication

**Description**

The application uses Manus OAuth for secure user authentication, ensuring only authorized users can access the system.

**Login Process**

When you first access the application, you'll be redirected to the Manus OAuth login portal. Enter your credentials to authenticate. Upon successful login, you'll be redirected back to the application with a session cookie that maintains your authenticated state.

**Session Management**

Sessions remain active for 24 hours of inactivity. After 24 hours without use, you'll be required to log in again. Active sessions are maintained across browser tabs and windows. Closing your browser does not immediately end your session—you'll remain logged in when you return.

**Logout**

Click the logout button in the application header to end your session immediately. This clears your session cookie and redirects you to the login page. Always log out when using shared computers or public devices.

### Data Privacy

**Description**

The application implements multiple layers of data protection to ensure your research reports and generated emails remain confidential.

**Data Isolation**

All workflows, stakeholders, and emails are scoped to your user ID. You cannot access data created by other users, and other users cannot access your data. Database queries automatically filter by user ID to enforce this isolation.

**File Storage Security**

Uploaded research reports are stored in S3 with non-enumerable keys that include random suffixes. This prevents unauthorized users from guessing file URLs and accessing your reports. File metadata is stored in the database with access control, while the actual file bytes remain in S3.

**Database Security**

All database connections use SSL/TLS encryption to protect data in transit. The database itself is hosted on TiDB Cloud with enterprise-grade security including encryption at rest, regular backups, and access logging.

---

## Performance Features

### Parallel Processing

**Description**

The email generation system processes multiple stakeholders concurrently, significantly reducing total generation time for large campaigns.

**Concurrency Model**

When you generate emails for multiple stakeholders, the backend spawns separate Python agents for each stakeholder and processes them in parallel. The system can handle up to 20 concurrent generations, after which additional stakeholders are queued. This means generating emails for 20 stakeholders takes approximately the same time as generating for 5 stakeholders.

**Resource Management**

The system automatically manages resource allocation to prevent overwhelming the LLM API or database. If you have more than 20 stakeholders selected, generations are processed in batches of 20 with minimal delay between batches. This ensures consistent performance regardless of campaign size.

### Caching

**Description**

The application uses intelligent caching to reduce database queries and improve response times.

**Query Caching**

tRPC automatically caches query results on the client side, reducing the need to fetch the same data repeatedly. When you navigate between workflow steps, previously loaded data is served from cache rather than making new database queries. Cache is automatically invalidated when data changes through mutations.

**Template Caching**

Email templates are cached after first load, so selecting different templates from the dropdown doesn't require repeated database queries. The cache is invalidated when you create, edit, or delete templates.

---

## Conclusion

The Stakeholder Email Outreach application provides a comprehensive feature set for automating personalized email generation at scale. By combining AI-powered stakeholder extraction, customizable templates, and intelligent generation, the system transforms hours of manual email writing into minutes of review and refinement. This documentation covers all features available in version 1.0.0, with additional features planned for future releases as outlined in the product roadmap.

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
