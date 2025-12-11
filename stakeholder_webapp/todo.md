# Stakeholder Email Outreach Web App - TODO

**Last Updated:** December 10, 2025

## Current Status

### ✅ Completed Features

**Core Infrastructure:**
- [x] Database schema (workflows, stakeholders, emails, logs)
- [x] Python agentic system integration
- [x] LLM file reading via S3 URLs (PDF, HTML)
- [x] Context management for multi-turn conversations
- [x] Web application with React + tRPC + Express
- [x] File upload to S3
- [x] Manus OAuth authentication

**Frontend UI:**
- [x] Workflow page with step-by-step interface
- [x] File upload with drag-and-drop
- [x] Stakeholder selection interface
- [x] Three-mode email generation (AI styles, templates, custom)
- [x] Email draft review interface
- [x] Debug console for agent logs
- [x] Documentation viewer
- [x] Export functionality

**Backend API:**
- [x] Upload report endpoint
- [x] Start extraction endpoint
- [x] Get workflow status endpoint
- [x] Update stakeholder selection endpoint
- [x] Generate emails endpoint
- [x] Get emails endpoint
- [x] Get logs endpoint
- [x] Export emails endpoint

**Agent System:**
- [x] OrchestratorAgent with file URL support
- [x] TaskPlannerAgent with context management
- [x] EmailWriterAgent with reflection pattern
- [x] LLMClient with multimodal content support
- [x] Python bridge for Node.js communication

## 🐛 Known Issues

### High Priority

- [x] **Implement log streaming from Python to Node.js**
  - Design log streaming architecture
  - Update Python agents to emit logs via stderr
  - Capture stderr in Node.js and save to database
  - Update frontend to poll/display logs in real-time

- [x] **Debug and fix workflow completion issue**
  - Fixed orchestrator method signatures to accept report_input parameter
  - Added markdown code block stripping for JSON parsing
  - Created symlink from webapp to main agentic system
  - Added comprehensive logging throughout extraction flow
  - Verified Python bridge works with test input

- [ ] **Python environment conflicts (intermittent)**
  - SRE module mismatch when uv Python 3.13 interferes
  - Current workaround: explicit Python 3.11 path + PYTHONPATH
  - Consider containerization or virtual environment

### Medium Priority

- [ ] **Error handling improvements**
  - Better error messages for users
  - Graceful handling of rate limits
  - Retry logic for transient failures

- [ ] **File upload validation**
  - Check file size limits (16MB for PDFs)
  - Validate MIME types
  - Provide user feedback for invalid files

## 🚀 Next Steps

### Phase 1: Fix Core Issues (1-2 days)

- [ ] Debug and fix workflow completion issue
- [ ] Implement proper log streaming from Python to Node.js
- [ ] Add comprehensive error handling and logging
- [ ] Test complete end-to-end workflow with MedStar Franklin PDF
- [ ] Verify all three email generation modes work correctly
- [ ] Test with both PDF and HTML files

### Phase 2: Polish & Testing (2-3 days)

- [ ] Add loading skeletons for better UX
- [ ] Implement proper error messages in UI
- [ ] Add file upload progress indicators
- [ ] Create comprehensive test suite for web app
- [ ] Write integration tests for Python bridge
- [ ] Performance testing with large PDFs

### Phase 3: Enhancement Features (1 week)

- [ ] **Workflow History Dashboard**
  - List all past workflows
  - Filter and search functionality
  - Resume or duplicate workflows
  - Usage statistics

- [ ] **Email Draft Editing**
  - Inline editor for subject and body
  - Regenerate individual emails
  - Save edited versions

- [ ] **A/B Testing**
  - Generate multiple variants per stakeholder
  - Compare quality scores
  - Select best version

### Phase 4: Advanced Features (2-3 weeks)

- [ ] **Batch Processing**
  - Upload multiple reports
  - Parallel processing
  - Queue management
  - Bulk export

- [ ] **Custom Templates**
  - User-defined email templates
  - Template library
  - Variable substitution

- [ ] **Analytics Dashboard**
  - Email generation metrics
  - Quality score trends
  - Stakeholder insights

## 📝 Documentation Updates Needed

- [ ] Update DEVELOPMENT_ROADMAP.md with completed phases
- [ ] Create deployment guide
- [ ] Write user manual
- [ ] Add API documentation for tRPC procedures
- [ ] Document Python bridge protocol

## 🧪 Testing Checklist

### Manual Testing

- [ ] Upload PDF file and extract stakeholders
- [ ] Upload HTML file and extract stakeholders
- [ ] Upload text file and extract stakeholders
- [ ] Select stakeholders and generate emails (AI style mode)
- [ ] Select stakeholders and generate emails (template mode)
- [ ] Select stakeholders and generate emails (custom prompt mode)
- [ ] Review generated emails and quality scores
- [ ] Export emails to markdown
- [ ] View debug console logs
- [ ] Browse documentation viewer

### Automated Testing

- [ ] Unit tests for tRPC procedures
- [ ] Integration tests for Python bridge
- [ ] End-to-end tests for complete workflow
- [ ] Performance tests with large files

## 💡 Ideas for Future

- Multi-language support
- CRM integration (Salesforce, HubSpot)
- Email scheduling and tracking
- Sentiment analysis of stakeholder mentions
- Relationship mapping between stakeholders
- Team collaboration features
- Role-based access control

- [x] **Fix OpenRouter API key not passed to Python subprocess**
  - Added OPENROUTER_API_KEY to project environment variables
  - Created validation test to verify API key works
  - Confirmed workflow extraction completes successfully

- [x] **Fix file reading issue - LLM not reading actual file content**
  - Root cause: OpenRouter/Gemini doesn't support file_url content type for PDFs
  - Created PDF text extraction utility using pypdf
  - Updated orchestrator to download and extract text from PDF/HTML files
  - Now passes extracted text directly to LLM instead of file URL
  - Ready for testing with real MedStar report upload

- [x] **PDF extraction still returning wrong stakeholders**
  - Root cause: MedStar PDF has encoding issues causing garbled text
  - Implemented garbled text detection and pdftotext fallback
  - HTML version of report has clean text and works correctly
  - Recommend using HTML files for best results

- [x] **Fix email generation error**
  - Fixed OrchestratorAgent.run() method signature to accept report_input dict
  - Updated _get_company_summary() to use cached report_content
  - Both extraction and generation now use consistent parameter passing

- [x] **Error messages showing as popups instead of debug console**
  - Backend errors already logged to database and displayed in debug console
  - Toast notifications provide immediate user feedback
  - Debug console shows full agent logs with timestamps and test IDs

- [ ] **End-to-end workflow testing with HTML file**
  - Upload MedStar HTML report via web UI
  - Verify stakeholders extracted: Dr. Detterline, Kim Schwenk, Garo Ghazarian, etc.
  - Test email generation with AI styles mode
  - Test email generation with templates mode
  - Test email generation with custom prompts mode
  - Verify debug console shows real-time logs

- [x] **Frontend not transitioning to stakeholder selection after extraction**
  - Root cause: print() statements in orchestrator.py writing to stdout, corrupting JSON response
  - Fixed by redirecting all print() to stderr in orchestrator
  - Frontend now successfully transitions to stakeholder selection page
  - All 13 MedStar stakeholders displayed correctly

- [ ] **Test email generation with AI styles mode** (BLOCKED - debugging LLM failures)
  - Select 2-3 stakeholders from extracted MedStar list
  - Generate emails using AI styles mode
  - Verify emails use rich stakeholder context (role, responsibilities, pain points)
  - Check personalization quality and relevance to each stakeholder
  - Confirm debug console shows generation logs
  - CURRENT ISSUE: All emails return "ERROR: Failed to generate initial email"

- [x] **Debug email generation LLM failures**
  - Root cause: Frontend passing wrong style key ("professional_healthcare" instead of "healthcare_professional")
  - Root cause: Frontend passing {style: ...} instead of {style_key: ...}
  - Fixed both key mismatches in WorkflowPage.tsx
  - Unit tests confirmed LLM API, context extraction, and email generation all working
  - Ready to test end-to-end email generation with corrected configuration

- [ ] **Fix EmailWriterAgent JSON parsing for markdown-wrapped responses**
  - LLM returning JSON wrapped in ```json ... ``` markdown code blocks
  - EmailWriterAgent failing to parse: "Failed to parse email JSON"
  - Need to strip markdown wrapper before JSON.parse() (same fix as orchestrator)
  - Apply to all JSON parsing in EmailWriterAgent (_generate_ai_style_email, _evaluate_email, _refine_email)

- [x] **Fix stdout/stderr separation in TaskPlannerAgent and EmailWriterAgent**
  - Email generation working but JSON response corrupted by log messages
  - Added builtins.print redirect to stderr in both TaskPlannerAgent and EmailWriterAgent
  - Same fix as orchestrator - prevents log messages from mixing with JSON output
  - Ready to test end-to-end email generation

- [x] **Implement review stage for generated emails**
  - After email generation completes, redirect to review stage
  - Show recipient dropdown to select one email at a time
  - Display subject line (read-only display)
  - Display email body in editable textarea
  - Add "Save Changes" button to update email
  - Add "Next" / "Previous" buttons to navigate between recipients
  - Add "Export All Emails" button to complete workflow
  - Show quality scores and reflection notes for context
  - Unsaved changes indicator for user awareness

- [x] **Fix extraction error code 1 when uploading HTML files**
  - Root cause: builtins.print redirection in agent files was using incorrect syntax
  - Fixed by redirecting print at bridge.py level before importing modules
  - Removed conflicting print redirections from task_planner.py and email_writer.py
  - Python bridge now works correctly with proper stderr logging
  - Tested successfully with text content extraction

- [x] **Fix frontend stuck in processing loop after successful extraction**
  - Root cause: print() redirection in bridge.py was sending JSON to stderr instead of stdout
  - Node.js couldn't parse the JSON response, causing workflow to stay in "extracting" state
  - Fixed by using sys.stdout.write() directly for JSON output, bypassing print redirection
  - Logs still go to stderr with LOG: prefix, JSON goes to stdout
  - Tested successfully with separate stdout/stderr capture

- [x] **Fix email generation database insert error**
  - Root cause: EmailWriterAgent returns `email_subject` and `email_body` fields
  - Node.js workflowRouter was expecting `subject` and `body` fields
  - Fixed by adding fallback mapping: email.email_subject || email.subject || 'No subject'
  - Created comprehensive unit tests to verify field mapping logic
  - All 3 tests passing: correct mapping, fallback handling, default values

## New Feature Requests

- [x] **Enable workflow step navigation**
  - Allow users to click top navigation buttons to go back to previous steps
  - Users should be able to select additional stakeholders without re-uploading report
  - Users should be able to generate emails with different styles for same stakeholders
  - Preserve workflow state (uploaded report, extracted stakeholders, company summary)
  - Implemented clickable step navigation with canProceedToStep guards
  - Added useEffect to sync stakeholder selection from database

- [x] **Research Cytovale IntelliSep sepsis test**
  - Conducted deep research on IntelliSep product, technology, clinical evidence
  - Created comprehensive 8000+ word product report with key facts and benefits
  - Formatted report for EmailWriterAgent to extract impactful narrative elements
  - Included clinical data (97.5% NPV, 8-min TAT), FDA clearance (Jan 2023), competitive advantages, use cases
  - Report saved to /home/ubuntu/stakeholder_outreach/product_reports/Cytovale_IntelliSep_Product_Report.md

- [x] **Create role-specific context library for healthcare stakeholders**
  - Researched common healthcare roles and their priorities
  - Created reference context for: Hospital CEO, CMO, Chief Quality Officer, Sepsis Coordinator, Lab Director, ED Physicians, ED Nurses, ED Physician Leaders
  - Documented typical responsibilities, pain points, success metrics, decision criteria for each role
  - Made context available to EmailWriterAgent for role-appropriate messaging
  - Library saved to /home/ubuntu/stakeholder_outreach/role_context/Healthcare_Role_Context_Library.md

- [x] **Enhance EmailWriterAgent to use customer report language**
  - Agent now loads and reviews product report at initialization
  - Extracts and uses specific language, terminology, and phrasing from report
  - Reflects customer's own words and concerns in generated emails
  - Applied to ALL styles (AI-generated, templates, custom) via enhanced prompts
  - Emails now feel native to the customer's communication style (4000 char injection)

- [x] **Update EmailWriterAgent with role-specific context**
  - Agent identifies stakeholder role and pulls relevant context via _extract_role_context()
  - Uses role context to tailor messaging, pain points, and value propositions
  - Combines role context + customer report + stakeholder details for maximum relevance
  - Role mapping supports 8 healthcare roles with intelligent title matching

- [x] **Update Cytovale IntelliSep product report with research paper citations**
  - Reviewed O'Neal pooled analysis paper (AEM 2024) for performance metrics
  - Reviewed Thomas et al. real-world implementation paper (Healthcare 2025)
  - Extracted specific NPV (97.5%), sensitivity (93.2%), specificity (87.0%) data from pooled analysis
  - Extracted real-world outcomes: 40% mortality reduction, 944 blood cultures saved, 78-min TAT
  - Updated product report with cited performance data from both papers
  - Replaced generic claims with specific quoted metrics and proper citations

- [x] **Fix incomplete stakeholder extraction - ensure all stakeholders captured**
  - Enhanced STAKEHOLDER_EXTRACTION_PROMPT with explicit completeness requirements
  - Added "Extract EVERY individual person mentioned by name" instruction
  - Specified 10/10 quality standard with "zero missed stakeholders" requirement
  - Added comprehensive details guidance for each stakeholder
  - Tested with 8-stakeholder sample report: achieved 10.0/10 quality score
  - All stakeholders now extracted with comprehensive role and context details

- [x] **Revise EmailWriterAgent for professional cold email tone**
  - Completely rewrote all 5 AI style prompts for cold email best practices (healthcare_professional, direct_urgent, technical_data, executive_brief, consultative)
  - Updated evaluation criteria: brevity (150 words), report specificity, healthcare language, directness, data-driven, clear CTA, role relevance
  - Enforced healthcare language: "patients" NOT "customers" across all modes (AI styles, templates, custom)
  - Updated templates and custom prompts to reference specific hospital report insights
  - Tested with sample stakeholder (Chief Quality Officer): 91 words, 9.4/10 quality score, all checks passed
  - All generation modes now produce concise, direct, report-specific cold emails with clear CTAs

- [x] **Fix data ingestion to use real LLM extraction instead of placeholder data**
  - Root cause: max_tokens=2048 was too low, causing JSON truncation and parse failures
  - Increased max_tokens to 4096 for stakeholder extraction
  - Updated prompt to require concise details (2-3 sentences) to prevent truncation
  - Tested with MedStar HTML: successfully extracted 23 stakeholders from actual report
  - LLM is analyzing real uploaded content, not placeholder data
  - Extraction includes actual names, titles, and responsibilities from the document

- [x] **Fix LLM hallucination in stakeholder extraction**
  - Root cause: Extraction prompt lacked explicit anti-hallucination instructions
  - LLM was inventing fake names (Dr. Gail Cunningham, Dr. David Stein) instead of extracting real ones
  - Rewrote prompt with 5 critical anti-hallucination rules and examples
  - Added explicit instructions: "Extract ONLY names explicitly written in the report. DO NOT invent names."
  - Tested with MedStar HTML: now extracts 14 real stakeholders (Stuart Levine, Nathan Barbo, Stephanie Detterline, Kim Schwenk, Diana Pancu, Garo Ghazarian, etc.)
  - Zero hallucinations - all names verified against source document

- [x] **Verify LLM is receiving full PDF/HTML content for extraction**
  - Added comprehensive verification checks to orchestrator._extract_stakeholders
  - Logs: total characters (71,896), first/last 200 chars, name indicators found
  - Confirmed LLM receives full document - no truncation detected
  - Document starts with "Strategic Sales Report: MedStar Franklin Square Medical Center"
  - Found all expected name indicators: MD, RN, President, Vice President, Director, Chief, Officer
  - Earlier hallucination was due to weak prompt, not document ingestion issues
  - Current extraction working correctly with anti-hallucination prompt

- [x] **Fix email generation style key mismatch error**
  - Root cause: Frontend was sending "casual_broy" but backend has "direct_urgent"
  - Fixed frontend WorkflowPage.tsx to use "direct_urgent" instead of "casual_broy"
  - Backend AI styles: healthcare_professional, direct_urgent, technical_direct, executive_brief, consultative
  - All 5 style keys now match between frontend and backend
  - Verified all styles are available and properly configured

- [x] **Implement email preview feature before bulk generation**
  - Added backend previewEmail mutation in workflowRouter.ts
  - Updated frontend Configure step with "Preview" button
  - Implemented preview modal Dialog component with subject, body, quality score, reflection notes
  - Preview generates sample email for first selected stakeholder without saving to database
  - Modal shows stakeholder info (name, title) and email details
  - Two action buttons: "Adjust Settings" (close modal) and "Generate All Emails" (proceed with bulk generation)
  - Created comprehensive unit tests (6 tests, all passing)
  - Supports all generation modes: AI styles, templates, custom prompts

- [x] **Enhance EmailWriterAgent to use hospital-specific facts in all email styles**
  - Ensure all AI styles extract and reference specific hospital facts from research reports
  - Include performance metrics (SEP-1 scores, mortality rates, readmission rates)
  - Reference KPIs and quality measures specific to the hospital
  - Incorporate recent news, publications, abstracts mentioned in reports
  - Reference hospital grading changes (up or down) and quality improvement initiatives
  - Update all 5 AI style prompts to require hospital-specific evidence
  - Update template prompts to extract and use hospital facts
  - Update custom prompt instructions to guide users toward hospital-specific messaging
  - Enhance evaluation criteria to score hospital-specificity (must reference concrete facts)
  - Test with MedStar report containing SEP-1 data, quality metrics, and stakeholder initiatives

- [x] **Redesign email generation configuration to support AI Styles and User Templates modes**"Custom Prompt" mode from configuration UI
  - Keep only two modes: "AI Styles" and "User Templates"
  - For AI Styles: show dropdown of 5 pre-built styles (healthcare_professional, direct_urgent, technical_direct, executive_brief, consultative)
  - For User Templates: show dropdown of user-created templates + "Add New Template" option
  - When user selects existing template: show editable fields for that template
  - When user clicks "Add New Template": show template creation form with name, description, structure/prompt
  - Provide example template showing what should be included (structure, tone, key elements)
  - Save all user template edits permanently to database (user_id scoped)
  - Create database schema for user templates (id, user_id, name, description, prompt_template, created_at, updated_at)
  - Implement backend API for template CRUD (create, read, update, delete)
  - Update EmailWriterAgent to fetch user templates from database dynamically
  - Update Python bridge to pass user_id so agent can query correct templates
  - Test template creation, editing, and email generation with user templates

- [x] **Add template editing UI**
  - Added "Edit" button next to each user template in the template list
  - Template creation dialog now supports both create and edit modes
  - Update mutation saves changes to existing templates
  - Button text changes to "Update Template" when editing
  - Default templates show "Duplicate" button instead of "Edit" to prevent modification
  - Dialog title and description update based on edit mode

- [x] **Implement template preview with sample data**
  - Added "Preview with Sample Data" button in template creation/edit dialog
  - Backend generates test email using placeholder hospital data (Memorial Regional Hospital, Dr. Sarah Johnson CQO)
  - Preview modal shows sample data used, generated subject, and email body
  - Two action buttons: "Close Preview" and "Looks Good, Save Template"
  - Supports raw promptTemplate preview without saving to database
  - EmailWriterAgent updated to handle raw promptTemplate in mode_config

- [x] **Create default template library**
  - Created 5 default templates: Problem-Solution Approach, Case Study Approach, Partnership Proposal, Product Introduction, Follow-up / Re-engagement
  - Seeded database with default templates (userId=0, isDefault=true)
  - Default templates shown in template list with "Default" badge
  - Users can duplicate default templates to create customized versions
  - All templates include comprehensive descriptions and hospital-specific fact requirements
  - Seed script: server/seed-default-templates.ts (run with pnpm tsx)

- [x] **Fix template preview error: user_fields variable not defined**
  - Error occurs when user clicks "Preview with Sample Data" in template creation dialog
  - Root cause: _generate_template_email() accesses user_fields variable before it's defined in the promptTemplate branch
  - user_fields is only defined in the template_key branch but used later in all branches
  - Fix by initializing user_fields = {} at the start of the method or in each branch

- [x] **Enhance EmailWriterAgent to incorporate key stakeholder engagement suggestions**
  - Review stakeholder engagement strategies from uploaded research reports
  - Extract engagement suggestions specific to each stakeholder (preferred communication style, pain points, decision triggers)
  - Incorporate engagement insights into email body (messaging approach, value proposition framing)
  - Reflect engagement strategy in subject line (urgency, curiosity, value-driven)
  - Update all AI style prompts to include engagement suggestion review step
  - Update template prompts to guide users toward engagement-aware messaging
  - Test with stakeholder reports containing engagement recommendations

- [x] **Fix template preview failure showing "subject" error**
  - User reports template preview failing with error: 'Failed to generate email: "subject"...'
  - Error occurs when clicking "Preview with Sample Data" in template creation dialog
  - Need to test template generation with raw promptTemplate outside webapp
  - Likely issue with JSON parsing or template variable substitution

- [x] **Fix preview sample generation error still occurring**
  - Enhanced JSON cleaning in strip_markdown_json to extract JSON from malformed responses
  - Added aggressive cleaning fallback for edge cases
  - Improved error logging to diagnose parsing failures

- [x] **Add auto-fix JSON template validator**
  - Automatically detects and fixes common template errors instead of just alerting
  - Auto-fix rules: adds missing JSON format instructions, fixes variable syntax ($var or {{var}} → {var}), ensures proper JSON structure
  - Added "Auto-Fix Template" button in template dialog that applies fixes immediately
  - Validates required elements: JSON format instruction, subject/body keys, valid variable names
  - Shows toast notifications for fixes applied, warnings, and errors
  - All 9 unit tests passing

- [x] **Fix ReferenceError: require is not defined in Auto-Fix Template button**
  - Error occurred when clicking "Auto-Fix Template" button
  - Replaced require() with proper ES6 import statement
  - Added validateAndFixTemplate import at top of WorkflowPage.tsx

- [x] **Fix template preview validation for minimal/invalid prompts**
  - Root cause found: User entered "tech bro" (2 words) as template prompt
  - LLM cannot generate proper JSON from such minimal instructions
  - Added frontend validation requiring minimum 100 characters and JSON format instructions
  - Helpful error messages guide users to use 'Auto-Fix Template' button
  - Both preview and save buttons now validate before proceeding
  - Validation prevents LLM errors from minimal/invalid prompts

- [x] **Fix template string formatting KeyError with JSON examples**
  - Fixed KeyError by replacing Python .format() with manual string replacement
  - Prevents conflicts when templates contain JSON examples like {"subject": "..."}
  - Safe substitution preserves JSON examples in user templates
  - Test confirms 10/10 quality score with JSON format examples

- [x] **Implement context window limits to prevent token overflow**
  - Set max product report context to 5x template length (capped at 8000 chars)
  - Set max role context to 2x template length (capped at 3000 chars)
  - Prevents LLM token limit errors with large reports
  - Test confirms 9.86/10 quality score with context limits applied

- [x] **Update IntelliSep turnaround time to "under 8 minutes"**
  - Replaced all references to other turnaround times (78 minutes, 27.9 minutes, 10 minutes)
  - Updated product report Executive Summary and all stakeholder sections
  - Updated FAQ section and competitive comparison tables
  - Updated sample data in templateRouter.ts
  - Consistent "under 8 minutes" across all email generation modes

- [x] **Create Casual Tech Bro Email Template**
  - Based on user's example email structure (vendor pitch TO Cytovale, adapted FOR Cytovale selling to hospitals)
  - Key elements:
    * Casual greeting (hi/hey, not "bro" since that was vendor-to-vendor)
    * Recent hospital facts from research (show you know their world)
    * "Let me tell you something you don't know" hook
    * Pattern interrupt (validate their current approach, then reveal hidden problem)
    * Hidden problem they're experiencing but haven't articulated
    * IntelliSep value-add (how we solve the hidden problem)
    * Mechanism (how it works with flow/arrows)
    * KPI improvement outcome (their win)
    * Simple CTA with timeframe
  - Use hospital-specific research data from {relevant_context} and {company_summary}
  - Ultra-casual tone: lowercase, fragments, questions, arrows (→)
  - 140-170 words
  - Update seed-default-templates.ts or replace existing "Tech Bro Reality Check"
  - Test with sample stakeholder data

- [x] **Fix template preview to use real workflow data instead of placeholder**
  - Issue: Template preview shows "Memorial Regional Hospital" instead of actual uploaded report (MedStar)
  - Root cause: templateRouter.ts previewTemplate mutation uses hardcoded sample data
  - Solution: Pass workflowId to preview, fetch actual workflow data (company_summary, relevant_context)
  - Add <PLACEHOLDER> labels to any remaining sample data so users can distinguish real from fake
  - Update frontend to pass workflowId when previewing templates
  - Update EmailWriterAgent to clearly label placeholder data in preview mode
  - Test with actual MedStar workflow to verify real data is used

- [x] **Fix email generation failure with Casual Insider Approach template**
  - Error: "Failed to generate email: Failed to generate initial email"
  - Occurs when generating emails with the new Casual Insider Approach template
  - Need to check Python agent logs for root cause
  - Possible issues: JSON parsing, LLM response format, template prompt structure
  - Test with MedStar workflow and selected stakeholders

- [x] **Restore full detailed Casual Insider Approach template**
  - Current template in database is simplified version missing examples and detailed guidelines
  - Need to restore complete prompt from seed-default-templates.ts with all 8 sections
  - Include all tone examples, hidden problem examples, outcome examples, and engagement suggestions
  - Test generation to verify full structure is followed

- [x] **Fix Casual Insider template greeting and subject line**
  - Current: Uses full name with credentials "hi kim schwenk, msn, rn," (too formal)
  - Should use: First name only "hi kim," or "hey kim,"
  - Subject line has encoding issues and is too complex
  - Update template prompt to extract first name and create simpler subject lines

- [x] **Redesign Configure page template selection**
  - Current: Separate "AI Templates" and "User Templates" sections
  - New: Single unified dropdown combining all templates
  - Sort by: Last used template at top, then newly created user templates, then rest
  - Track lastUsedAt timestamp for templates per user
  - Update UI to show single dropdown with sorted list

- [x] **Fix template selection bug for multiple stakeholders**
  - Bug: Only first stakeholder uses selected template (e.g., Casual Insider)
  - Subsequent stakeholders revert to different template
  - Check Python agent code to see if template_id is passed correctly for all stakeholders
  - Verify modeConfig is being used consistently across all email generations

- [x] **Add template name display in Review panel**
  - Show which template was used at the top of Review panel
  - Helps users verify the correct template was applied
  - Display template name from emailTemplates table

- [x] **Enforce first name only in Casual Insider greeting**
  - Current: Sometimes still uses full name with credentials
  - Need stronger extraction logic: "Kim Schwenk, MSN, RN" → "kim"
  - Update template prompt with explicit examples and rules

- [x] **Fix JSON parse error in template generation**
  - Error: "Expecting ',' delimiter" - LLM response truncated mid-JSON
  - Root cause: max_tokens=1024 too low for Casual Insider template (longer response)
  - Solution: Increase max_tokens to 1536 or 2048 for template generation
  - Location: email_writer.py _generate_template_email method

- [x] **Add Select All button to stakeholder selection panel**
  - Add button next to stakeholder list header
  - Click to select all extracted stakeholders at once
  - Show "Deselect All" when all are selected
  - Improve UX for selecting multiple stakeholders

- [x] **Fix stakeholder selection loss bug**
  - Bug: Select all 14 stakeholders → only 3 processed in generation
  - When returning to Select panel, only 3 are checked
  - Investigate: State management, backend filtering, workflow update
  - Check: handleContinueToConfig, updateWorkflow mutation, stakeholder saving
