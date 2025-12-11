# Stakeholder Email Outreach Application

**Version:** 1.0.0  
**Status:** Stable Release  
**Last Updated:** December 2025

---

## Overview

The Stakeholder Email Outreach Application is an AI-powered platform that automates the process of creating personalized outreach emails for hospital stakeholders. It analyzes research reports, extracts key stakeholders, and generates tailored emails using customizable templates and AI agents.

### Key Features

- **Intelligent Report Analysis** - Upload research reports (PDF, TXT, DOCX) and automatically extract hospital metrics, stakeholder information, and key insights
- **Stakeholder Extraction** - AI-powered extraction of stakeholder names, titles, departments, and contact information
- **Template-Based Email Generation** - Choose from 8 pre-built templates or create custom templates with natural language prompts
- **Casual Insider Approach** - Ultra-casual, peer-to-peer email style that reveals hidden workflow problems with hospital-specific data
- **Bulk Email Generation** - Generate personalized emails for multiple stakeholders simultaneously
- **Review and Edit** - Review, edit, and refine generated emails before export
- **Export Options** - Export to CSV for mail merge or copy individual emails

---

## Quick Start

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm (recommended) or npm
- MySQL-compatible database (TiDB Cloud recommended)
- OpenRouter API key for LLM access
- AWS S3 bucket for file storage

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stakeholder_webapp

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:push

# Seed default templates
pnpm tsx server/seed-default-templates.ts

# Start development server
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## Documentation

### Core Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flow, and technical design
- **[FEATURES.md](./FEATURES.md)** - Detailed feature documentation with usage examples
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap, completed features, and future plans

### Deployment Guides

- **[DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)** - Deploy to Render (recommended platform)
- **[DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)** - Deploy to Railway (simplest deployment)
- **[DEPLOYMENT_NETLIFY.md](./DEPLOYMENT_NETLIFY.md)** - Deploy to Netlify (not recommended for this app)

### Development Guides

- **[CLINE_VSCODE_GUIDE.md](./CLINE_VSCODE_GUIDE.md)** - Using Cline AI assistant in VSCode for development

---

## Technology Stack

### Frontend

- **React 19** - UI library with modern hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Wouter** - Lightweight routing library
- **tRPC** - End-to-end typesafe APIs
- **Vite** - Fast build tool and dev server

### Backend

- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **MySQL/TiDB** - Database
- **Python 3.11** - AI agent runtime
- **OpenRouter** - LLM API access

### Infrastructure

- **AWS S3** - File storage for research reports
- **TiDB Cloud** - MySQL-compatible serverless database
- **Render/Railway** - Recommended hosting platforms

---

## Project Structure

```
stakeholder_webapp/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx           # Landing page
│   │   │   └── WorkflowPage.tsx   # Main 6-step workflow
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AIChatBox.tsx
│   │   ├── lib/                    # Utilities and configurations
│   │   │   ├── trpc.ts            # tRPC client setup
│   │   │   └── utils.ts           # Helper functions
│   │   ├── App.tsx                 # Routes and layout
│   │   ├── main.tsx                # Application entry point
│   │   └── index.css               # Global styles and theme
│   ├── public/                     # Static assets
│   └── index.html                  # HTML template
├── server/                          # Backend Express + tRPC server
│   ├── routers.ts                  # Main tRPC router
│   ├── workflowRouter.ts           # Workflow API procedures
│   ├── templateRouter.ts           # Template API procedures
│   ├── db.ts                       # Database query helpers
│   ├── index.ts                    # Express server setup
│   ├── seed-default-templates.ts   # Database seeding script
│   ├── agentic_system/             # Python AI agents
│   │   └── agents/
│   │       ├── orchestrator.py    # Agent orchestration
│   │       ├── task_planner.py    # Task planning
│   │       ├── email_writer.py    # Email generation
│   │       └── research_analyst.py # Report analysis
│   ├── _core/                      # Framework and utilities
│   │   ├── auth.ts                # Authentication
│   │   ├── context.ts             # tRPC context
│   │   ├── llm.ts                 # LLM integration
│   │   ├── storage.ts             # S3 file storage
│   │   └── map.ts                 # Maps integration
│   └── storage/                    # S3 helpers
├── drizzle/                         # Database schema and migrations
│   ├── schema.ts                   # Table definitions
│   └── migrations/                 # Migration files
├── shared/                          # Shared types and constants
├── docs/                            # Additional documentation
├── ARCHITECTURE.md                  # System architecture
├── FEATURES.md                      # Feature documentation
├── ROADMAP.md                       # Product roadmap
├── DEPLOYMENT_RENDER.md             # Render deployment guide
├── DEPLOYMENT_RAILWAY.md            # Railway deployment guide
├── DEPLOYMENT_NETLIFY.md            # Netlify deployment guide
├── CLINE_VSCODE_GUIDE.md           # Cline development guide
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript configuration
├── drizzle.config.ts               # Drizzle ORM configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                        # This file
```

---

## Workflow Overview

The application follows a 6-step workflow:

### 1. Upload

Upload research reports containing hospital data and stakeholder information. Supported formats:
- PDF documents
- Plain text files
- Word documents (DOCX)

### 2. Extract

AI agents analyze the uploaded report to extract:
- Hospital name and metrics (SEP-1 compliance, Leapfrog scores, etc.)
- Stakeholder names, titles, and departments
- Key insights and data points
- Company summary

### 3. Select

Review extracted stakeholders and select recipients for email outreach. Features:
- Stakeholder cards with name, title, and relevance score
- Select All / Deselect All buttons
- Individual selection checkboxes
- Relevance scoring (1-10) based on title and department

### 4. Configure

Choose email generation approach:
- **Template-based** - Select from 8 pre-built templates (Casual Insider, Product Introduction, etc.)
- **Custom templates** - Create and save your own templates

### 5. Generate

AI agents generate personalized emails for each selected stakeholder using:
- Hospital-specific data from the research report
- Stakeholder title and department
- Selected template or custom prompt
- IntelliSep product information

### 6. Review

Review and edit generated emails before export:
- View all emails in a list
- Edit subject lines and body text
- See which template was used
- Export to CSV or copy individual emails

---

## Key Features

### Email Templates

**8 Pre-built Templates:**

1. **Casual Insider Approach** - Ultra-casual, peer-to-peer tone revealing hidden workflow problems
2. **Product Introduction** - Professional introduction to IntelliSep test
3. **Clinical Evidence Focus** - Data-driven approach emphasizing clinical studies
4. **Cost-Benefit Analysis** - ROI-focused messaging for financial stakeholders
5. **Peer Comparison** - Competitive benchmarking with similar hospitals
6. **Problem-Solution Framework** - Identifies pain points and presents solutions
7. **Follow-up / Re-engagement** - Brief follow-up for non-responders
8. **Partnership Proposal** - Collaborative tone for strategic partnerships

### Custom Templates

Create your own templates with:
- Natural language prompts describing desired tone and structure
- Reusable across multiple workflows
- Last-used sorting for quick access
- Edit and delete capabilities

### AI-Powered Generation

- **Multi-agent system** - Orchestrator coordinates specialized agents (research analyst, task planner, email writer)
- **Context-aware** - Uses hospital-specific data and stakeholder information
- **Consistent quality** - Structured prompts ensure reliable output
- **Fast generation** - Parallel processing for multiple stakeholders

### Data Management

- **Persistent workflows** - Save and resume workflows
- **Template library** - Manage custom templates
- **Export options** - CSV for mail merge, individual copy
- **Database-backed** - All data stored in MySQL/TiDB

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:4000/database?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=your-random-secret-key-min-32-chars

# AI Integration
OPENROUTER_API_KEY=sk-or-v1-your-key

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=stakeholder-reports
AWS_S3_REGION=us-east-1

# Application
VITE_APP_TITLE=Stakeholder Email Outreach
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=development
PORT=3000
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...
```

---

## Development

### Running Locally

```bash
# Start both frontend and backend
pnpm dev

# Or start separately
pnpm dev:client  # Frontend only (port 5173)
pnpm dev:server  # Backend only (port 3000)
```

### Database Management

```bash
# Generate and run migrations
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio

# Seed default templates
pnpm tsx server/seed-default-templates.ts
```

### Building for Production

```bash
# Build both frontend and backend
pnpm build

# Build separately
pnpm build:client  # Outputs to client/dist
pnpm build:server  # Outputs to dist/server

# Start production server
pnpm start
```

### Testing

```bash
# Run tests (if available)
pnpm test

# Type checking
pnpm tsc --noEmit
```

---

## Deployment

### Recommended Platforms

1. **Railway** (Simplest) - One-command deployment with built-in database
   - See [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)

2. **Render** (Best for production) - Generous free tier, no timeout limits
   - See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)

3. **Manus Platform** (Zero configuration) - Built-in hosting with all infrastructure
   - Click "Publish" button in Manus UI after creating checkpoint

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add database
railway add --database mysql

# Set environment variables
railway variables set OPENROUTER_API_KEY=your-key
railway variables set AWS_ACCESS_KEY_ID=your-key
# ... (set all required variables)

# Deploy
railway up
```

### Quick Deploy to Render

1. Push code to GitHub
2. Create account at https://render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Set environment variables in dashboard
6. Click "Create Web Service"

---

## Troubleshooting

### Common Issues

**Database Connection Failed**

- Verify `DATABASE_URL` is correct
- Ensure SSL is enabled: `?ssl={"rejectUnauthorized":true}`
- Check that database allows connections from your IP

**Email Generation Timeout**

- Check OpenRouter API key is valid
- Verify Python dependencies are installed
- Increase server timeout if deploying to serverless platform

**Template Not Found**

- Run seed script: `pnpm tsx server/seed-default-templates.ts`
- Check database connection
- Verify templates exist: `SELECT * FROM emailTemplates;`

**Select All Not Persisting**

- This was fixed in v1.0.0
- Ensure you're running latest version
- Clear browser cache and reload

### Getting Help

- **Documentation:** Check ARCHITECTURE.md, FEATURES.md, and deployment guides
- **Issues:** Open an issue on GitHub
- **Support:** Contact support at https://help.manus.im

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit with descriptive messages
6. Push to your fork
7. Open a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add comments for complex logic
- Update documentation for new features

### Testing

- Test all changes manually
- Add unit tests for new utilities
- Verify TypeScript types are correct

---

## License

[Your License Here]

---

## Acknowledgments

- Built with [Manus AI](https://manus.im)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- LLM access via [OpenRouter](https://openrouter.ai)
- Database hosting by [TiDB Cloud](https://tidbcloud.com)

---

## Support

- **Documentation:** See docs/ directory
- **Issues:** GitHub Issues
- **Email:** support@yourdomain.com
- **Community:** https://community.manus.im

---

**Version:** 1.0.0  
**Release Date:** December 2025  
**Maintained By:** [Your Name/Team]
