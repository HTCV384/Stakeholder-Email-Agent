"""
Stakeholder Email Outreach System
Main application entry point with three generation modes
"""
import asyncio
import os
import sys
from datetime import datetime
from agents.orchestrator import OrchestratorAgent
from prompts.ai_generated_styles import list_available_styles
from prompts.editable_templates import list_available_templates, get_template
from prompts.custom_prompt_handler import get_example_prompts, validate_custom_prompt

def check_environment():
    """Check that required environment variables are set."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("ERROR: OPENROUTER_API_KEY environment variable not set")
        print("\nPlease set your OpenRouter API key:")
        print("  export OPENROUTER_API_KEY='your-api-key-here'")
        print("\nGet your API key at: https://openrouter.ai/keys")
        sys.exit(1)
    print(f"✓ OpenRouter API key found")

def get_generation_mode():
    """Prompt user to select email generation mode."""
    print("\n" + "="*60)
    print("EMAIL GENERATION MODE")
    print("="*60)
    print("1. AI-Generated Styles (choose from pre-defined styles)")
    print("2. User-Editable Templates (customize template sections)")
    print("3. Custom Prompt (provide your own instructions)")
    print("="*60)
    
    choice = input("Select generation mode (1-3): ").strip()
    
    mode_map = {
        "1": "ai_style",
        "2": "template",
        "3": "custom"
    }
    
    if choice in mode_map:
        return mode_map[choice]
    else:
        print("Invalid selection. Defaulting to AI-Generated Styles.")
        return "ai_style"

def get_ai_style():
    """Get AI-generated style selection."""
    print("\n" + "="*60)
    print("AI-GENERATED STYLE OPTIONS")
    print("="*60)
    
    styles = list_available_styles()
    for i, (key, name, description) in enumerate(styles, 1):
        print(f"{i}. {name}")
        print(f"   {description}")
        print()
    
    print("="*60)
    
    choice = input(f"Select style (1-{len(styles)}): ").strip()
    
    try:
        idx = int(choice) - 1
        if 0 <= idx < len(styles):
            style_key = styles[idx][0]
            style_name = styles[idx][1]
            return style_key, style_name
    except ValueError:
        pass
    
    print("Invalid selection. Defaulting to Technical and Direct.")
    return "technical_direct", "Technical and Direct"

def get_template_config():
    """Get user-editable template configuration."""
    print("\n" + "="*60)
    print("USER-EDITABLE TEMPLATES")
    print("="*60)
    
    templates = list_available_templates()
    for i, (key, name, description) in enumerate(templates, 1):
        print(f"{i}. {name}")
        print(f"   {description}")
        print()
    
    print("="*60)
    
    choice = input(f"Select template (1-{len(templates)}): ").strip()
    
    try:
        idx = int(choice) - 1
        if 0 <= idx < len(templates):
            template_key = templates[idx][0]
            template_config = get_template(template_key)
            
            print(f"\n✓ Selected: {template_config['name']}")
            print("\nPlease fill in the following fields:")
            print("="*60)
            
            user_fields = {}
            for field_key, field_description in template_config['user_fields'].items():
                print(f"\n{field_key.replace('_', ' ').title()}:")
                print(f"  ({field_description})")
                value = input("  > ").strip()
                user_fields[field_key] = value if value else field_description
            
            return template_key, user_fields
    except (ValueError, IndexError):
        pass
    
    print("Invalid selection. Defaulting to Problem-Solution template with placeholder values.")
    return "problem_solution", {
        "subject": "Solving your key challenge",
        "opening": "I noticed your recent initiatives",
        "benefit_1": "Reduce costs by 50%",
        "benefit_2": "Improve efficiency",
        "benefit_3": "Scale faster",
        "call_to_action": "Would you be open to a brief call?",
        "closing": "Best regards"
    }

def get_custom_prompt():
    """Get custom prompt from user."""
    print("\n" + "="*60)
    print("CUSTOM PROMPT MODE")
    print("="*60)
    print("\nProvide your own email generation instructions.")
    print("Available context variables:")
    print("  - {stakeholder_name}")
    print("  - {stakeholder_title}")
    print("  - {stakeholder_details}")
    print("  - {company_name}")
    print("  - {company_summary}")
    print("  - {relevant_context}")
    print("\n" + "="*60)
    
    # Show examples
    print("\nWould you like to see example prompts? (y/n): ", end="")
    show_examples = input().strip().lower()
    
    if show_examples == 'y':
        examples = get_example_prompts()
        for i, example in enumerate(examples, 1):
            print(f"\n{example}")
            if i < len(examples):
                input("\nPress Enter for next example...")
    
    print("\n" + "="*60)
    print("Enter your custom prompt (press Ctrl+D or Ctrl+Z when done):")
    print("="*60)
    
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass
    
    custom_instructions = "\n".join(lines).strip()
    
    # Validate
    is_valid, error_msg = validate_custom_prompt(custom_instructions)
    if not is_valid:
        print(f"\nERROR: {error_msg}")
        print("Using default custom prompt.")
        custom_instructions = "Write a professional email introducing our solution. Keep it concise and focused on their specific challenges."
    
    return custom_instructions

def save_results(emails: list, output_dir: str = "outputs"):
    """Save generated emails to a markdown file."""
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(output_dir, f"generated_emails_{timestamp}.md")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Generated Stakeholder Emails\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Emails:** {len(emails)}\n\n")
        f.write("---\n\n")
        
        for i, email in enumerate(emails, 1):
            f.write(f"## Email {i}: {email['stakeholder_name']}\n\n")
            f.write(f"**To:** {email['stakeholder_name']} ({email['stakeholder_title']})\n\n")
            f.write(f"**Subject:** {email['email_subject']}\n\n")
            f.write(f"**Generation Mode:** {email.get('generation_mode', 'unknown')}\n\n")
            f.write(f"**Quality Score:** {email['quality_score']:.1f}/10\n\n")
            f.write(f"**Reflection Notes:** {email['reflection_notes']}\n\n")
            f.write("### Email Body\n\n")
            f.write(f"{email['email_body']}\n\n")
            f.write("---\n\n")
    
    print(f"\n✓ Results saved to: {output_file}")
    return output_file

def print_summary(emails: list):
    """Print a summary of generated emails."""
    print("\n" + "="*60)
    print("EMAIL GENERATION SUMMARY")
    print("="*60)
    
    total = len(emails)
    avg_quality = sum(e['quality_score'] for e in emails) / total if total > 0 else 0
    
    print(f"Total emails generated: {total}")
    print(f"Average quality score: {avg_quality:.1f}/10")
    print("\nEmails by stakeholder:")
    
    for i, email in enumerate(emails, 1):
        status = "✓" if email['quality_score'] >= 7.0 else "⚠"
        mode = email.get('generation_mode', 'unknown')
        print(f"  {status} {email['stakeholder_name']} ({email['stakeholder_title']}) - Score: {email['quality_score']:.1f}/10 [{mode}]")
    
    print("="*60)

async def main():
    """Main application logic."""
    print("\n" + "="*60)
    print("STAKEHOLDER EMAIL OUTREACH SYSTEM")
    print("="*60)
    
    # Check environment
    check_environment()
    
    # Get report path
    if len(sys.argv) > 1:
        report_path = sys.argv[1]
    else:
        report_path = input("\nEnter path to research report: ").strip()
    
    if not os.path.exists(report_path):
        print(f"ERROR: Report file not found: {report_path}")
        sys.exit(1)
    
    print(f"✓ Report file found: {report_path}")
    
    # Get generation mode
    generation_mode = get_generation_mode()
    
    # Get mode-specific configuration
    mode_config = {}
    mode_description = ""
    
    if generation_mode == "ai_style":
        style_key, style_name = get_ai_style()
        mode_config = {"style_key": style_key}
        mode_description = f"AI Style: {style_name}"
    
    elif generation_mode == "template":
        template_key, user_fields = get_template_config()
        mode_config = {"template_key": template_key, "user_fields": user_fields}
        mode_description = f"Template: {template_key}"
    
    elif generation_mode == "custom":
        custom_instructions = get_custom_prompt()
        mode_config = {"custom_instructions": custom_instructions}
        mode_description = "Custom Prompt"
    
    print(f"✓ Generation mode configured: {mode_description}")
    
    # Run orchestrator
    print("\n" + "="*60)
    print("STARTING EMAIL GENERATION WORKFLOW")
    print("="*60 + "\n")
    
    orchestrator = OrchestratorAgent()
    emails = await orchestrator.run(report_path, generation_mode, mode_config)
    
    if not emails:
        print("\nERROR: No emails were generated")
        sys.exit(1)
    
    # Save results
    output_file = save_results(emails)
    
    # Print summary
    print_summary(emails)
    
    print(f"\n✓ Workflow complete!")
    print(f"✓ View generated emails at: {output_file}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nWorkflow interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
