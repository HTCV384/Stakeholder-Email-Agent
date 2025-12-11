# Stakeholder Email Outreach System

An intelligent multi-agent system for generating personalized email outreach to key stakeholders identified in customer research reports. Powered by Google Gemini 2.5 Flash via OpenRouter.

## Overview

This system uses a hierarchical multi-agent architecture to:

1. **Analyze** customer research reports
2. **Identify** key stakeholders automatically
3. **Generate** personalized, high-quality emails using AI
4. **Refine** emails through self-evaluation (reflection pattern)
5. **Scale** to multiple stakeholders with parallel processing

## Architecture

The system implements a three-layer hierarchical agent architecture:

- **Layer 1 (Strategy):** Orchestrator Agent - Manages workflow and user interaction
- **Layer 2 (Planning):** Task Planner Agent - Decomposes work and prepares context
- **Layer 3 (Execution):** Email Writer Agents - Generate emails in parallel with quality reflection

See `ARCHITECTURE.md` for detailed technical documentation.

## Features

- **Automatic Stakeholder Identification:** LLM extracts key stakeholders from research reports
- **Personalization:** Each email is customized using specific details from the report
- **Style Flexibility:** Choose from 5 different email styles
- **Quality Assurance:** Reflection pattern ensures high-quality output (self-evaluation and refinement)
- **Parallel Processing:** Multiple emails generated concurrently for efficiency
- **Transparent Results:** Quality scores and reflection notes for each email

## Installation

### Prerequisites

- Python 3.11 or higher
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Setup

1. **Clone or download this repository**

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set your OpenRouter API key:**
```bash
export OPENROUTER_API_KEY='your-api-key-here'
```

Or create a `.env` file:
```
OPENROUTER_API_KEY=your-api-key-here
```

## Usage

### Basic Usage

```bash
python main.py path/to/research_report.txt
```

The system will:
1. Analyze the report and extract stakeholders
2. Present stakeholders for your selection
3. Prompt you to choose an email style
4. Generate personalized emails for selected stakeholders
5. Save results to `outputs/generated_emails_[timestamp].md`

### Command Line Arguments

```bash
python main.py <report_path>
```

- `<report_path>`: Path to your research report file (required)

### Email Generation Modes

When prompted, select from three generation modes:

#### Mode 1: AI-Generated Styles
Choose from pre-defined styles, including:
- **Professional to Healthcare Professional**
- **Casual Bro-y**
- **Technical and Direct**
- **Executive Brief**
- **Consultative**

#### Mode 2: User-Editable Templates
Customize pre-structured templates before generation:
- **Problem-Solution**
- **Casual Bro-y Template**
- **Partnership Proposal**

#### Mode 3: Custom Prompt
Provide your own complete instructions for email generation, with full control over the AI's output.

### Example Workflow

```bash
$ python main.py reports/acme_corp_research.txt

============================================================
STAKEHOLDER EMAIL OUTREACH SYSTEM
============================================================
✓ OpenRouter API key found
✓ Report file found: reports/acme_corp_research.txt

============================================================
EMAIL STYLE OPTIONS
============================================================
1. Professional and Formal
2. Friendly and Conversational
3. Technical and Direct
4. Executive Brief (concise, high-level)
5. Consultative (problem-solving focus)
============================================================
Select email style (1-5): 3

✓ Email style selected: Technical and direct, focusing on specific...

============================================================
STARTING EMAIL GENERATION WORKFLOW
============================================================

[Orchestrator] Starting email generation workflow...
[Orchestrator] Extracting stakeholders from report...
[Orchestrator] Found 4 stakeholders

============================================================
STAKEHOLDERS IDENTIFIED
============================================================

1. Dr. Sarah Chen
   Title: Chief Technology Officer
   Details: Leading AI transformation initiatives...

2. Michael Rodriguez
   Title: VP of Product Development
   Details: Responsible for product roadmap...

[... more stakeholders ...]

============================================================
Select stakeholders for email outreach:
Enter numbers separated by commas (e.g., 1,2,3)
Or press Enter to select all stakeholders
============================================================
Your selection: 1,2

[Orchestrator] User selected 2 stakeholders
[TaskPlanner] Planning tasks for 2 stakeholders...
[EmailWriter-1] Generating email for Dr. Sarah Chen...
[EmailWriter-2] Generating email for Michael Rodriguez...
[EmailWriter-1] Email generation complete for Dr. Sarah Chen
[EmailWriter-2] Quality score 6.8 below threshold. Refining...
[EmailWriter-2] Email generation complete for Michael Rodriguez

✓ Results saved to: outputs/generated_emails_20251210_143022.md

============================================================
EMAIL GENERATION SUMMARY
============================================================
Total emails generated: 2
Average quality score: 7.9/10

Emails by stakeholder:
  ✓ Dr. Sarah Chen (Chief Technology Officer) - Score: 8.5/10
  ✓ Michael Rodriguez (VP of Product Development) - Score: 7.3/10
============================================================

✓ Workflow complete!
```

## Project Structure

```
stakeholder_outreach/
├── ARCHITECTURE.md              # Technical architecture documentation
├── DEVELOPMENT_ROADMAP.md       # Implementation guide for developers
├── README.md                    # This file
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
│
├── agents/                      # Agent implementations
│   ├── base_agent.py           # Abstract base class
│   ├── orchestrator.py         # Layer 1: Strategy
│   ├── task_planner.py         # Layer 2: Planning
│   └── email_writer.py         # Layer 3: Execution
│
├── prompts/                     # System prompts
│   ├── orchestrator_prompts.py
│   ├── task_planner_prompts.py
│   └── email_writer_prompts.py
│
├── utils/                       # Utilities
│   └── llm_api.py              # OpenRouter API wrapper
│
├── reports/                     # Input directory (your research reports)
│   └── sample_report.txt
│
└── outputs/                     # Output directory (generated emails)
    └── generated_emails_*.md
```

## Output Format

Generated emails are saved as Markdown files with the following structure:

```markdown
# Generated Stakeholder Emails

**Generated:** 2025-12-10 14:30:22
**Total Emails:** 2

---

## Email 1: Dr. Sarah Chen

**To:** Dr. Sarah Chen (Chief Technology Officer)
**Subject:** Collaborating on AI Transformation at Acme Corp
**Quality Score:** 8.5/10
**Reflection Notes:** Initial quality score: 8.5/10 | Quality acceptable, no refinement needed

### Email Body

[Email content here...]

---
```

## Quality Assurance

Each email goes through a reflection pattern:

1. **Generation:** Initial email created using stakeholder context
2. **Evaluation:** Self-assessment against 6 quality criteria:
   - Style adherence
   - Personalization
   - Relevance
   - Clarity
   - Call to action
   - Professionalism
3. **Refinement:** If quality score < 7.0, email is automatically refined

## Customization

### Modifying Email Styles

Edit the `get_email_style()` function in `main.py` to add or modify email styles.

### Adjusting Quality Threshold

Edit `self.quality_threshold` in `agents/email_writer.py` (default: 7.0).

### Customizing Prompts

All system prompts are in the `prompts/` directory. Modify these to change agent behavior.

## Troubleshooting

### "ERROR: OPENROUTER_API_KEY environment variable not set"

Set your API key:
```bash
export OPENROUTER_API_KEY='your-api-key-here'
```

### "ERROR: Failed to parse stakeholder JSON"

The LLM response may not be valid JSON. This can happen with:
- Very short or poorly formatted reports
- Reports without clear stakeholder information

Try providing a more detailed research report.

### Low Quality Scores

If emails consistently receive low quality scores:
- Ensure your research report contains sufficient detail
- Try a different email style
- Check that stakeholder information is accurate

### API Rate Limits

OpenRouter has rate limits. If you encounter errors:
- Reduce the number of stakeholders selected
- Wait a few moments between runs
- Check your OpenRouter dashboard for usage limits

## Development

For developers and AI coding agents, see:
- `ARCHITECTURE.md` - Complete technical architecture
- `DEVELOPMENT_ROADMAP.md` - Phase-by-phase implementation guide

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `ARCHITECTURE.md` for technical details
3. Verify your OpenRouter API key and credits

## Acknowledgments

Built with:
- [OpenRouter](https://openrouter.ai/) - Unified LLM API
- [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) - Language model
- Python asyncio - Concurrent execution framework
