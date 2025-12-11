"""
Email Writer Agent (Layer 3: Execution)
Implements the Reflection Pattern for quality assurance
Supports three generation modes: AI-generated styles, editable templates, custom prompts
"""
from agents.base_agent import Agent
from prompts.email_writer_prompts import (
    EMAIL_EVALUATION_PROMPT,
    EMAIL_REFINEMENT_PROMPT
)
from prompts.ai_generated_styles import get_style_prompt
from prompts.editable_templates import get_template
from prompts.custom_prompt_handler import build_custom_prompt
import json
import re
import sys
import os


def strip_markdown_json(text: str) -> str:
    """
    Strip markdown code blocks and clean JSON responses.
    LLMs often wrap JSON in ```json ... ``` blocks or add extra formatting.
    """
    if not text:
        return text
    
    # Remove ```json ... ``` or ``` ... ``` wrappers
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text.strip())
    
    # Try to find JSON object boundaries if response has extra text
    # Look for the first { and last } to extract just the JSON
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        text = text[first_brace:last_brace + 1]
    
    return text.strip()

class EmailWriterAgent(Agent):
    """
    Specialized agent for generating personalized emails to stakeholders.
    Implements reflection pattern: Generate → Evaluate → Refine
    Supports multiple generation modes and styles.
    Enhanced with product report and role context for better personalization.
    """
    
    def __init__(self, name):
        super().__init__(name)
        self.quality_threshold = 7.0  # Minimum acceptable quality score
        
        # Load product report and role context
        self.product_report = self._load_product_report()
        self.role_context = self._load_role_context()
    
    def _load_product_report(self) -> str:
        """Load the product report for context injection."""
        report_path = os.path.join(os.path.dirname(__file__), '..', 'product_reports', 'Cytovale_IntelliSep_Product_Report.md')
        try:
            with open(report_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"[{self.name}] Warning: Product report not found at {report_path}")
            return ""
    
    def _load_role_context(self) -> str:
        """Load the role context library for role-specific messaging."""
        context_path = os.path.join(os.path.dirname(__file__), '..', 'role_context', 'Healthcare_Role_Context_Library.md')
        try:
            with open(context_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"[{self.name}] Warning: Role context library not found at {context_path}")
            return ""
    
    def _fetch_user_template(self, template_id: int, user_id: int) -> str:
        """Fetch user template from database."""
        try:
            import pymysql
            from urllib.parse import urlparse
            
            database_url = os.environ.get('DATABASE_URL')
            if not database_url:
                print(f"[{self.name}] DATABASE_URL not set")
                return None
            
            # Parse MySQL URL (format: mysql://user:pass@host:port/dbname)
            parsed = urlparse(database_url)
            
            connection = pymysql.connect(
                host=parsed.hostname,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path[1:],  # Remove leading '/'
                port=parsed.port or 3306,
                cursorclass=pymysql.cursors.DictCursor
            )
            
            with connection:
                with connection.cursor() as cursor:
                    sql = "SELECT promptTemplate FROM emailTemplates WHERE id = %s AND userId = %s"
                    cursor.execute(sql, (template_id, user_id))
                    result = cursor.fetchone()
                    
                    if result:
                        return result['promptTemplate']
                    else:
                        print(f"[{self.name}] Template {template_id} not found for user {user_id}")
                        return None
        except Exception as e:
            print(f"[{self.name}] Error fetching template from database: {e}")
            return None
    
    async def run(self, task: dict) -> dict:
        """
        Generate a personalized email for a stakeholder.
        
        Args:
            task: Dictionary containing stakeholder and context information
                {
                    "stakeholder_name": str,
                    "stakeholder_title": str,
                    "stakeholder_details": str,
                    "company_name": str,
                    "company_summary": str,
                    "relevant_context": str,
                    "generation_mode": str,  # "ai_style", "template", or "custom"
                    "mode_config": dict  # Mode-specific configuration
                }
        
        Returns:
            Dictionary containing the generated email and metadata
        """
        print(f"[{self.name}] Generating email for {task['stakeholder_name']}...")
        print(f"[{self.name}] Mode: {task.get('generation_mode', 'ai_style')}")
        
        # Step 1: Generate initial email based on mode
        initial_email = self._generate_email_by_mode(task)
        if initial_email is None:
            return self._error_response(task, "Failed to generate initial email")
        
        # Step 2: Evaluate the email
        evaluation = self._evaluate_email(initial_email, task)
        if evaluation is None:
            # If evaluation fails, return the initial email anyway
            return self._format_output(task, initial_email, 0.0, "Evaluation failed, returning initial draft")
        
        # Step 3: Refine if quality is below threshold
        final_email = initial_email
        reflection_notes = f"Initial quality score: {evaluation['overall_score']:.1f}/10"
        
        if evaluation['overall_score'] < self.quality_threshold:
            print(f"[{self.name}] Quality score {evaluation['overall_score']:.1f} below threshold. Refining...")
            refined_email = self._refine_email(initial_email, evaluation, task)
            if refined_email is not None:
                final_email = refined_email
                reflection_notes += " | Email refined based on feedback"
            else:
                reflection_notes += " | Refinement failed, using initial draft"
        else:
            reflection_notes += " | Quality acceptable, no refinement needed"
        
        print(f"[{self.name}] Email generation complete for {task['stakeholder_name']}")
        return self._format_output(task, final_email, evaluation['overall_score'], reflection_notes)
    
    def _generate_email_by_mode(self, task: dict) -> dict:
        """Route to appropriate generation method based on mode."""
        mode = task.get('generation_mode', 'ai_style')
        
        if mode == 'ai_style':
            return self._generate_ai_style_email(task)
        elif mode == 'template':
            return self._generate_template_email(task)
        elif mode == 'custom':
            return self._generate_custom_email(task)
        else:
            print(f"[{self.name}] Unknown generation mode: {mode}, defaulting to ai_style")
            return self._generate_ai_style_email(task)
    
    def _generate_ai_style_email(self, task: dict) -> dict:
        """Generate email using AI-generated style (Mode 1)."""
        mode_config = task.get('mode_config', {})
        style_key = mode_config.get('style_key', 'technical_direct')
        
        style_config = get_style_prompt(style_key)
        if not style_config:
            print(f"[{self.name}] Unknown style key: {style_key}")
            return None
        
        # Extract role-specific context
        role_context_section = self._extract_role_context(task['stakeholder_title'])
        
        # Format the prompt with all required parameters
        prompt = style_config['generation_prompt'].format(
            stakeholder_name=task['stakeholder_name'],
            stakeholder_title=task['stakeholder_title'],
            stakeholder_details=task['stakeholder_details'],
            company_name=task['company_name'],
            company_summary=task['company_summary'],
            relevant_context=task['relevant_context'],
            product_report_excerpt=self.product_report[:4000] if self.product_report else "Product information not available.",
            role_context_excerpt=role_context_section if role_context_section else "Role context not available."
        )
        
        messages = [
            {"role": "system", "content": "You are a professional email writer specializing in personalized outreach."},
            {"role": "user", "content": prompt}
        ]
        
        response = self.llm_client.get_completion(messages, max_tokens=1024)
        if response is None:
            return None
        
        try:
            # Strip markdown code blocks before parsing
            clean_response = strip_markdown_json(response)
            email_data = json.loads(clean_response)
            return email_data
        except json.JSONDecodeError as e:
            print(f"[{self.name}] Failed to parse email JSON. Error: {e}")
            print(f"[{self.name}] Raw response: {response[:200]}")
            return None
    
    def _generate_template_email(self, task: dict) -> dict:
        """Generate email using user-editable template (Mode 2)."""
        mode_config = task.get('mode_config', {})
        user_id = task.get('user_id')
        
        # Initialize user_fields for all branches
        user_fields = mode_config.get('user_fields', {})
        
        # Check if using raw promptTemplate, user-created template (template_id), or built-in template (template_key)
        template_config = None  # Initialize for all branches
        
        if 'promptTemplate' in mode_config:
            # Use raw prompt template (for preview) - returns complete email, no assembly needed
            template_prompt = mode_config['promptTemplate']
        elif 'template_id' in mode_config and user_id:
            # Fetch user template from database - returns complete email, no assembly needed
            template_prompt = self._fetch_user_template(mode_config['template_id'], user_id)
            if not template_prompt:
                print(f"[{self.name}] Failed to fetch user template {mode_config['template_id']}")
                return None
        elif 'template_key' in mode_config:
            # Use built-in template - requires assembly with user_fields
            template_key = mode_config.get('template_key')
            
            template_config = get_template(template_key)
            if not template_config:
                print(f"[{self.name}] Unknown template key: {template_key}")
                return None
            template_prompt = template_config['generation_prompt']
        else:
            print(f"[{self.name}] No template specified in mode_config")
            return None
        
        # Extract role-specific context
        role_context_section = self._extract_role_context(task['stakeholder_title'])
        
        # Calculate context window limits (5x the template prompt length)
        template_length = len(template_prompt)
        max_product_report_length = min(template_length * 5, 8000)  # Cap at 8000 chars
        max_role_context_length = min(template_length * 2, 3000)    # Cap at 3000 chars
        
        # Truncate contexts to prevent token overflow
        truncated_product_report = self.product_report[:max_product_report_length]
        truncated_role_context = role_context_section[:max_role_context_length]
        
        # Build enhanced prompt with product report and role context
        enhanced_template_prompt = f"""{template_prompt}
---
IMPORTANT: Use language and facts from the Customer Report below. Tailor to the role context.

Customer Report:
{truncated_product_report}

Role Context:
{truncated_role_context}
---
"""
        
        # First, generate AI context sections using safe substitution
        # Use manual replacement to avoid KeyError with JSON examples in templates
        ai_context_prompt = enhanced_template_prompt
        replacements = {
            '{stakeholder_name}': task['stakeholder_name'],
            '{stakeholder_title}': task['stakeholder_title'],
            '{stakeholder_details}': task['stakeholder_details'],
            '{company_name}': task['company_name'],
            '{company_summary}': task['company_summary'],
            '{relevant_context}': task['relevant_context'],
            '{stakeholder_first_name}': task['stakeholder_name'].split()[0],
        }
        # Add user_fields to replacements
        for key, value in user_fields.items():
            replacements[f'{{{key}}}'] = value
        
        # Apply replacements
        for placeholder, value in replacements.items():
            ai_context_prompt = ai_context_prompt.replace(placeholder, value)
        
        messages = [
            {"role": "system", "content": "You are an expert at generating contextual email content."},
            {"role": "user", "content": ai_context_prompt}
        ]
        
        print(f"[{self.name}] === LLM CALL DEBUG ===")
        print(f"[{self.name}] Prompt length: {len(ai_context_prompt)} chars")
        print(f"[{self.name}] Prompt (first 800 chars): {ai_context_prompt[:800]}")
        print(f"[{self.name}] Calling LLM with max_tokens=1024...")
        
        response = self.llm_client.get_completion(messages, max_tokens=1024)
        
        print(f"[{self.name}] === LLM RESPONSE DEBUG ===")
        if response is None:
            print(f"[{self.name}] Response is None!")
            return None
        else:
            print(f"[{self.name}] Response length: {len(response)} chars")
            print(f"[{self.name}] Response (full): {response}")
            print(f"[{self.name}] Response repr: {repr(response)}")
            print(f"[{self.name}] First 10 chars repr: {repr(response[:10])}")
            print(f"[{self.name}] === END LLM RESPONSE DEBUG ===")
        
        try:
            clean_response = strip_markdown_json(response)
            result_data = json.loads(clean_response)
        except json.JSONDecodeError as e:
            print(f"[{self.name}] Failed to parse template response JSON. Error: {e}")
            print(f"[{self.name}] Raw response (first 500 chars): {response[:500]}")
            print(f"[{self.name}] Clean response (first 500 chars): {clean_response[:500]}")
            print(f"[{self.name}] Response length: {len(response)} chars")
            
            # Try one more time with aggressive cleaning
            try:
                # Remove all leading/trailing whitespace and quotes
                ultra_clean = clean_response.strip().strip('"').strip("'")
                result_data = json.loads(ultra_clean)
                print(f"[{self.name}] Successfully parsed after aggressive cleaning")
            except Exception as e2:
                print(f"[{self.name}] Aggressive cleaning also failed: {e2}")
                print(f"[{self.name}] Ultra clean response: {ultra_clean[:200]}")
                # Return error dict instead of None so we can see what went wrong
                return {
                    "subject": "JSON Parse Error",
                    "body": f"Failed to parse LLM response. Original error: {str(e)}. Clean response preview: {clean_response[:200]}"
                }
        
        # For raw promptTemplate or user templates, LLM returns complete email with subject/body
        # For built-in templates, LLM returns AI sections that need assembly
        if template_config is None:
            # Raw promptTemplate or user template - return as-is
            return result_data
        else:
            # Built-in template - assemble with user fields
            final_email = self._assemble_template_email(template_config, user_fields, result_data, task)
            return final_email
    
    def _assemble_template_email(self, template_config: dict, user_fields: dict, 
                                   ai_sections: dict, task: dict) -> dict:
        """Assemble final email from template, user fields, and AI sections."""
        template_key = template_config.get('name', '').lower().replace(' ', '_')
        
        if 'casual' in template_key or 'broy' in template_key:
            # Casual bro-y template
            bullets = "\n".join([f"- {bullet}" for bullet in ai_sections.get('struggle_bullets', [])])
            
            body = f"""{task['stakeholder_name'].split()[0]}

{ai_sections.get('opening_pain', '')}

{user_fields.get('your_achievement', '')}

here's what they're actually struggling with:

{bullets}

{user_fields.get('your_solution', '')}

{ai_sections.get('application', '')}

{user_fields.get('timeframe', '')}. ready to talk?"""
            
            return {
                "subject": user_fields.get('subject', ''),
                "body": body
            }
        
        elif 'partnership' in template_key:
            # Partnership template
            body = f"""{task['stakeholder_name']},

{ai_sections.get('recognition_section', '')}

{user_fields.get('partnership_vision', '')}

I see potential for mutual value in several areas:
- {user_fields.get('mutual_value_1', '')}
- {user_fields.get('mutual_value_2', '')}
- {user_fields.get('mutual_value_3', '')}

{ai_sections.get('alignment_section', '')}

{user_fields.get('next_step', '')}

{user_fields.get('closing', '')}"""
            
            return {
                "subject": user_fields.get('subject', ''),
                "body": body
            }
        
        else:
            # Problem-solution template (default)
            body = f"""{task['stakeholder_name']},

{user_fields.get('opening', '')}

Here's what we're seeing at similar organizations:
{ai_sections.get('pain_points_section', '')}

What if you could:
- {user_fields.get('benefit_1', '')}
- {user_fields.get('benefit_2', '')}
- {user_fields.get('benefit_3', '')}

{ai_sections.get('application_section', '')}

{user_fields.get('call_to_action', '')}

{user_fields.get('closing', '')}"""
            
            return {
                "subject": user_fields.get('subject', ''),
                "body": body
            }
    
    def _generate_custom_email(self, task: dict) -> dict:
        """Generate email using custom user prompt (Mode 3)."""
        mode_config = task.get('mode_config', {})
        custom_instructions = mode_config.get('custom_instructions', '')
        
        if not custom_instructions:
            print(f"[{self.name}] No custom instructions provided")
            return None
        
        stakeholder_context = {
            "stakeholder_name": task['stakeholder_name'],
            "stakeholder_title": task['stakeholder_title'],
            "stakeholder_details": task['stakeholder_details'],
            "company_name": task['company_name'],
            "company_summary": task['company_summary'],
            "relevant_context": task['relevant_context']
        }
        
        # Extract role-specific context
        role_context_section = self._extract_role_context(task['stakeholder_title'])
        
        # Build base prompt
        base_prompt = build_custom_prompt(custom_instructions, stakeholder_context)
        
        # Enhance with product report and role context
        prompt = f"""{base_prompt}

---
IMPORTANT: Use language and facts from the Customer Report below. Consider the role context.

Customer Report:
{self.product_report[:3000]}

Role Context:
{role_context_section[:1000]}
---
"""
        
        messages = [
            {"role": "system", "content": "You are a professional email writer following custom user instructions."},
            {"role": "user", "content": prompt}
        ]
        
        response = self.llm_client.get_completion(messages, max_tokens=1024)
        if response is None:
            return None
        
        try:
            # Strip markdown code blocks before parsing
            clean_response = strip_markdown_json(response)
            email_data = json.loads(clean_response)
            return email_data
        except json.JSONDecodeError as e:
            print(f"[{self.name}] Failed to parse email JSON. Error: {e}")
            print(f"[{self.name}] Raw response: {response[:200]}")
            return None
    
    def _evaluate_email(self, email: dict, task: dict) -> dict:
        """Evaluate the email quality using the reflection pattern."""
        # Get email style description for evaluation context
        mode = task.get('generation_mode', 'ai_style')
        mode_config = task.get('mode_config', {})
        
        if mode == 'ai_style':
            style_key = mode_config.get('style_key', 'technical_direct')
            style_config = get_style_prompt(style_key)
            email_style = style_config['description'] if style_config else "professional"
        elif mode == 'template':
            template_key = mode_config.get('template_key', '')
            email_style = f"template-based ({template_key})"
        else:
            email_style = "custom user-defined style"
        
        prompt = EMAIL_EVALUATION_PROMPT.format(
            subject=email.get('subject', ''),
            body=email.get('body', ''),
            email_style=email_style
        )
        
        messages = [
            {"role": "system", "content": "You are an expert email quality reviewer."},
            {"role": "user", "content": prompt}
        ]
        
        response = self.llm_client.get_completion(messages, max_tokens=1024)
        if response is None:
            return None
        
        try:
            clean_response = strip_markdown_json(response)
            evaluation = json.loads(clean_response)
            return evaluation
        except json.JSONDecodeError as e:
            print(f"[{self.name}] Failed to parse evaluation JSON. Error: {e}")
            print(f"[{self.name}] Raw response: {response[:200]}")
            return None
    
    def _refine_email(self, email: dict, evaluation: dict, task: dict) -> dict:
        """Refine the email based on evaluation feedback."""
        # Get email style for refinement context
        mode = task.get('generation_mode', 'ai_style')
        mode_config = task.get('mode_config', {})
        
        if mode == 'ai_style':
            style_key = mode_config.get('style_key', 'technical_direct')
            style_config = get_style_prompt(style_key)
            email_style = style_config['description'] if style_config else "professional"
        else:
            email_style = "the original style"
        
        prompt = EMAIL_REFINEMENT_PROMPT.format(
            subject=email.get('subject', ''),
            body=email.get('body', ''),
            overall_score=evaluation['overall_score'],
            weaknesses=", ".join(evaluation.get('weaknesses', [])),
            improvement_suggestions=evaluation.get('improvement_suggestions', ''),
            email_style=email_style,
            stakeholder_name=task['stakeholder_name'],
            stakeholder_title=task['stakeholder_title']
        )
        
        messages = [
            {"role": "system", "content": "You are a professional email writer specializing in refinement."},
            {"role": "user", "content": prompt}
        ]
        
        response = self.llm_client.get_completion(messages, max_tokens=1024)
        if response is None:
            return None
        
        try:
            clean_response = strip_markdown_json(response)
            refined_email = json.loads(clean_response)
            return refined_email
        except json.JSONDecodeError as e:
            print(f"[{self.name}] Failed to parse refined email JSON. Error: {e}")
            print(f"[{self.name}] Raw response: {response[:200]}")
            return None
    
    def _extract_role_context(self, stakeholder_title: str) -> str:
        """Extract role-specific context from the library based on stakeholder title."""
        if not self.role_context:
            return "No role-specific context available."
        
        # Map common title keywords to role sections
        title_lower = stakeholder_title.lower()
        
        role_mapping = {
            "ceo": "## Hospital CEO (Chief Executive Officer)",
            "chief executive": "## Hospital CEO (Chief Executive Officer)",
            "cmo": "## Chief Medical Officer (CMO)",
            "chief medical": "## Chief Medical Officer (CMO)",
            "cqo": "## Chief Quality Officer (CQO)",
            "chief quality": "## Chief Quality Officer (CQO)",
            "quality officer": "## Chief Quality Officer (CQO)",
            "sepsis coordinator": "## Sepsis Coordinator / Sepsis Program Manager",
            "sepsis program": "## Sepsis Coordinator / Sepsis Program Manager",
            "lab director": "## Lab Director / Pathologist",
            "pathologist": "## Lab Director / Pathologist",
            "emergency department physician": "## Emergency Department Physician",
            "emergency medicine": "## Emergency Department Physician",
            "ed physician": "## Emergency Department Physician",
            "emergency department nurse": "## Emergency Department Nurse",
            "ed nurse": "## Emergency Department Nurse",
            "emergency nurse": "## Emergency Department Nurse",
            "medical director": "## Emergency Department Physician Leader / Medical Director",
            "physician leader": "## Emergency Department Physician Leader / Medical Director"
        }
        
        # Find matching role section
        role_header = None
        for keyword, header in role_mapping.items():
            if keyword in title_lower:
                role_header = header
                break
        
        if not role_header:
            return f"General healthcare professional context (specific role '{stakeholder_title}' not found in library)."
        
        # Extract the section from role_context
        try:
            start_idx = self.role_context.index(role_header)
            # Find the next ## header or end of document
            next_header_idx = self.role_context.find("\n## ", start_idx + len(role_header))
            if next_header_idx == -1:
                section = self.role_context[start_idx:]
            else:
                section = self.role_context[start_idx:next_header_idx]
            
            # Limit to first 2000 characters to avoid token limits
            return section[:2000] if len(section) > 2000 else section
        except ValueError:
            return f"Role context for '{stakeholder_title}' not found in library."
    
    def _format_output(self, task: dict, email: dict, quality_score: float, reflection_notes: str) -> dict:
        """Format the final output."""
        return {
            "stakeholder_name": task['stakeholder_name'],
            "stakeholder_title": task['stakeholder_title'],
            "email_subject": email.get('subject', 'No subject generated'),
            "email_body": email.get('body', 'No body generated'),
            "quality_score": quality_score,
            "reflection_notes": reflection_notes,
            "generation_mode": task.get('generation_mode', 'ai_style')
        }
    
    def _error_response(self, task: dict, error_message: str) -> dict:
        """Return an error response."""
        return {
            "stakeholder_name": task['stakeholder_name'],
            "stakeholder_title": task['stakeholder_title'],
            "email_subject": "ERROR",
            "email_body": f"Failed to generate email: {error_message}",
            "quality_score": 0.0,
            "reflection_notes": error_message,
            "generation_mode": task.get('generation_mode', 'unknown')
        }
