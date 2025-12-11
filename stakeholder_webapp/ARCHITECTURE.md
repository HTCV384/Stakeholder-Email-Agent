# Stakeholder Email Outreach - System Architecture

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Executive Summary

The Stakeholder Email Outreach application is a full-stack web application that automates personalized email generation for healthcare stakeholders using AI-powered agents. The system extracts stakeholder information from research reports, generates contextual emails using customizable templates, and provides a streamlined workflow for review and export.

---

## System Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | User interface and client-side logic |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Responsive design and component library |
| **Backend** | Express 4 + tRPC 11 | Type-safe API layer |
| **Database** | TiDB Cloud (MySQL-compatible) | Persistent data storage |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **AI Integration** | OpenRouter API | LLM-powered email generation |
| **Authentication** | Manus OAuth | User authentication and session management |
| **File Storage** | AWS S3 | Research report and file storage |
| **Build Tool** | Vite | Fast development and production builds |

### Architecture Pattern

The application follows a **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer** (React Frontend)
   - User interface components
   - Client-side state management
   - tRPC client for type-safe API calls

2. **Application Layer** (Express + tRPC Backend)
   - Business logic and workflow orchestration
   - Type-safe API procedures (public and protected)
   - Python agent integration for AI operations

3. **Data Layer** (TiDB + S3)
   - Relational database for structured data
   - Object storage for files and reports

---

## Core Components

### 1. Frontend Architecture

The frontend is organized into a component-based structure with clear responsibilities:

```
client/src/
├── pages/           # Page-level components (WorkflowPage, Home)
├── components/      # Reusable UI components (shadcn/ui)
├── contexts/        # React contexts for global state
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and tRPC client
└── App.tsx          # Route configuration and layout
```

#### Key Frontend Components

**WorkflowPage Component**

The primary user interface that manages the six-step workflow:

1. **Upload** - File upload for research reports (PDF, HTML, TXT)
2. **Extract** - AI-powered stakeholder extraction from reports
3. **Select** - Multi-select interface with Select All functionality
4. **Configure** - Template selection from unified dropdown
5. **Generate** - Batch email generation with progress tracking
6. **Review** - Email preview, editing, and CSV export

The component uses React hooks for state management and tRPC mutations for server communication. All stakeholder selections are persisted to the database to maintain state across navigation.

**State Management Pattern**

The application uses a hybrid state management approach:

- **Local State** (useState) - UI-specific state (modals, form inputs)
- **Server State** (tRPC queries) - Data fetched from backend with automatic caching
- **Persistent State** (Database) - Critical workflow data (selections, emails)

### 2. Backend Architecture

The backend uses tRPC for type-safe API procedures with automatic TypeScript inference from server to client.

```
server/
├── routers.ts              # Main tRPC router combining all sub-routers
├── workflowRouter.ts       # Workflow CRUD and generation logic
├── templateRouter.ts       # Email template management
├── db.ts                   # Database query helpers (Drizzle)
├── agentic_system/         # Python AI agents
│   ├── agents/
│   │   ├── orchestrator.py      # Coordinates multi-agent workflow
│   │   ├── task_planner.py      # Plans email generation tasks
│   │   ├── research_agent.py    # Extracts stakeholder data
│   │   └── email_writer.py      # Generates personalized emails
│   └── prompts/            # AI prompt templates
└── _core/                  # Framework plumbing (auth, LLM, storage)
```

#### tRPC Procedures

**Public Procedures** - No authentication required
- Used for health checks and public endpoints

**Protected Procedures** - Requires Manus OAuth authentication
- Injects `ctx.user` with authenticated user data
- All workflow and template operations use protected procedures

**Procedure Pattern Example**

```typescript
generateEmails: protectedProcedure
  .input(z.object({
    workflowId: z.number(),
    generationMode: z.enum(['template', 'ai_style', 'custom']),
    modeConfig: z.any()
  }))
  .mutation(async ({ input, ctx }) => {
    // Business logic here
    // Returns type-safe response
  })
```

### 3. AI Agent System

The application uses a **multi-agent architecture** implemented in Python for AI-powered operations:

#### Agent Hierarchy

```
Orchestrator (orchestrator.py)
    ↓
Task Planner (task_planner.py)
    ↓
├── Research Agent (research_agent.py)  # Stakeholder extraction
└── Email Writer (email_writer.py)      # Email generation
```

#### Agent Communication Flow

1. **Orchestrator** receives high-level task from tRPC backend
2. **Task Planner** breaks down task into subtasks (one per stakeholder)
3. **Email Writer** generates personalized email for each stakeholder using:
   - Stakeholder details (name, title, role)
   - Company summary and context
   - Selected email template prompt
   - LLM completion (OpenRouter API)

#### Template System

Email templates are stored in the database with the following structure:

- **System Templates** (userId = 0) - Pre-built templates accessible to all users
- **User Templates** (userId = user.id) - Custom templates created by users
- **Template Sorting** - Last used templates appear first (lastUsedAt DESC)

**Template Types:**

1. **Casual Insider Approach** - Ultra-casual, peer-to-peer tone with first name only
2. **Product Introduction** - Professional introduction to IntelliSep
3. **Value Proposition** - ROI-focused with metrics
4. **Follow-up / Re-engagement** - For existing contacts
5. **Executive Summary** - Brief, high-level overview
6. **Clinical Evidence** - Data-driven with research citations
7. **Partnership Opportunity** - Collaboration-focused

### 4. Database Schema

The application uses five core tables:

#### Workflows Table

Stores the overall workflow state for each user session.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT (PK) | Unique workflow identifier |
| userId | INT | Owner of the workflow |
| reportUrl | TEXT | S3 URL of uploaded report |
| companySummary | TEXT | Extracted company context |
| status | ENUM | Current workflow state |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last modification timestamp |

#### Stakeholders Table

Stores extracted stakeholder information from research reports.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT (PK) | Unique stakeholder identifier |
| workflowId | INT (FK) | Associated workflow |
| name | VARCHAR(255) | Stakeholder full name |
| title | TEXT | Job title and role |
| details | TEXT | Additional context |
| selected | BOOLEAN | Selection state for generation |
| createdAt | DATETIME | Extraction timestamp |

#### Emails Table

Stores generated emails with template tracking.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT (PK) | Unique email identifier |
| workflowId | INT (FK) | Associated workflow |
| stakeholderId | INT (FK) | Target stakeholder |
| subject | TEXT | Email subject line |
| body | TEXT | Email body content |
| generationMode | VARCHAR(50) | Generation method used |
| templateId | INT (FK, nullable) | Template used (if applicable) |
| createdAt | DATETIME | Generation timestamp |

#### EmailTemplates Table

Stores system and user-created email templates.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT (PK) | Unique template identifier |
| userId | INT | Owner (0 for system templates) |
| name | VARCHAR(255) | Template display name |
| description | TEXT | Template description |
| promptTemplate | TEXT | AI prompt for generation |
| isDefault | BOOLEAN | System template flag |
| lastUsedAt | DATETIME | Last usage timestamp |
| createdAt | DATETIME | Creation timestamp |

#### Users Table

Stores authenticated user information from Manus OAuth.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT (PK) | Unique user identifier |
| openId | VARCHAR(255) | Manus OAuth ID |
| name | VARCHAR(255) | User display name |
| email | VARCHAR(255) | User email address |
| role | ENUM('admin', 'user') | Access level |
| createdAt | DATETIME | Registration timestamp |

---

## Data Flow

### Workflow Execution Flow

```
1. User uploads research report
   ↓
2. File stored in S3, URL saved to workflows table
   ↓
3. Python Research Agent extracts stakeholders
   ↓
4. Stakeholders saved to stakeholders table
   ↓
5. User selects stakeholders (selection persisted to DB)
   ↓
6. User selects email template from unified dropdown
   ↓
7. Backend spawns Python agents for each selected stakeholder
   ↓
8. Email Writer generates personalized email using:
   - Stakeholder context
   - Company summary
   - Template prompt
   - LLM completion (max_tokens=1536)
   ↓
9. Generated emails saved to emails table with templateId
   ↓
10. User reviews, edits, and exports to CSV
```

### Authentication Flow

```
1. User clicks login → redirected to Manus OAuth portal
   ↓
2. OAuth callback creates/updates user in database
   ↓
3. Session cookie set (JWT signed with JWT_SECRET)
   ↓
4. All protected procedures verify session and inject ctx.user
   ↓
5. User logout clears session cookie
```

---

## API Integration

### OpenRouter LLM Integration

The application uses OpenRouter for unified access to multiple LLM providers.

**Configuration:**
- API Key: `OPENROUTER_API_KEY` (environment variable)
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Default Model: Automatically selected by OpenRouter

**Usage Pattern:**

```python
from server._core.llm import invokeLLM

response = invokeLLM({
    "messages": [
        {"role": "system", "content": "You are an expert email writer."},
        {"role": "user", "content": prompt}
    ],
    "max_tokens": 1536
})
```

**Token Limits:**
- Template generation: 1536 tokens (increased from 1024 to prevent truncation)
- Stakeholder extraction: 2048 tokens
- Custom generation: 1024 tokens

### S3 Storage Integration

File storage uses pre-configured S3 helpers with automatic authentication.

**Storage Pattern:**

```typescript
import { storagePut } from "./server/storage";

const fileKey = `${userId}-reports/${fileName}-${randomSuffix()}.pdf`;
const { url } = await storagePut(fileKey, fileBuffer, "application/pdf");
```

**Security:**
- Public bucket with non-enumerable keys
- Random suffixes prevent file discovery
- Metadata stored in database, bytes in S3

---

## Security Considerations

### Authentication & Authorization

1. **Manus OAuth** - All users must authenticate via Manus OAuth
2. **Session Management** - JWT-signed cookies with HTTP-only flag
3. **Protected Procedures** - All workflow operations require authentication
4. **User Isolation** - Workflows and templates scoped to userId

### Data Protection

1. **Database Security**
   - TiDB Cloud with SSL/TLS required
   - Connection string in environment variable
   - No hardcoded credentials

2. **API Security**
   - OpenRouter API key in environment variable
   - Server-side only (never exposed to client)
   - Rate limiting via OpenRouter

3. **File Storage**
   - S3 with non-enumerable keys
   - Random suffixes prevent guessing
   - Metadata in database for access control

### Input Validation

1. **tRPC Input Validation** - Zod schemas for all procedure inputs
2. **File Upload Validation** - Type and size checks on client and server
3. **SQL Injection Prevention** - Drizzle ORM with parameterized queries
4. **XSS Prevention** - React automatic escaping + Content Security Policy

---

## Performance Optimizations

### Frontend Optimizations

1. **Code Splitting** - Lazy loading for route-based components
2. **React Query Caching** - tRPC automatic query caching
3. **Optimistic Updates** - Immediate UI feedback for mutations
4. **Debounced Inputs** - Prevent excessive API calls

### Backend Optimizations

1. **Database Indexing** - Primary keys and foreign keys indexed
2. **Connection Pooling** - Drizzle connection pool management
3. **Batch Operations** - Select All uses Promise.all for parallel updates
4. **Query Optimization** - Selective field fetching, JOIN optimization

### AI Agent Optimizations

1. **Parallel Generation** - Multiple stakeholder emails generated concurrently
2. **Token Optimization** - Right-sized max_tokens per operation
3. **Prompt Caching** - Template prompts loaded once per batch
4. **Error Recovery** - Automatic retry with exponential backoff

---

## Deployment Architecture

### Environment Variables

The application requires the following environment variables:

**Database:**
- `DATABASE_URL` - TiDB Cloud connection string with SSL

**Authentication:**
- `JWT_SECRET` - Session cookie signing secret
- `OAUTH_SERVER_URL` - Manus OAuth backend URL
- `VITE_OAUTH_PORTAL_URL` - Manus OAuth frontend URL
- `VITE_APP_ID` - Manus OAuth application ID

**AI Integration:**
- `OPENROUTER_API_KEY` - OpenRouter API key for LLM access

**Storage:**
- `BUILT_IN_FORGE_API_URL` - Manus storage API URL
- `BUILT_IN_FORGE_API_KEY` - Manus storage API key

**Application:**
- `OWNER_OPEN_ID` - Application owner ID
- `OWNER_NAME` - Application owner name
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Application logo URL

### Build Process

```bash
# Install dependencies
pnpm install

# Database migration
pnpm db:push

# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Production Considerations

1. **Reverse Proxy** - Use Nginx or Cloudflare for SSL termination
2. **Process Management** - Use PM2 or systemd for process supervision
3. **Monitoring** - Application logs, error tracking, performance metrics
4. **Backup Strategy** - Daily database backups, S3 versioning enabled
5. **Scaling** - Horizontal scaling via load balancer, database read replicas

---

## Future Enhancements

### Planned Features

1. **Subject Line A/B Testing** - Generate 3 variations per email
2. **Template Comparison View** - Side-by-side preview before generation
3. **Bulk Email Actions** - Apply changes across all emails at once
4. **Advanced Analytics** - Track template performance and usage patterns
5. **Email Scheduling** - Schedule email sends for specific dates/times
6. **CRM Integration** - Export to Salesforce, HubSpot, etc.

### Technical Improvements

1. **Batch Selection API** - Single mutation for multiple stakeholder updates
2. **WebSocket Support** - Real-time generation progress updates
3. **Caching Layer** - Redis for session and query caching
4. **GraphQL Migration** - Consider GraphQL for more flexible queries
5. **Mobile App** - React Native version for mobile access

---

## Troubleshooting Guide

### Common Issues

**Issue: JSON Parse Error during email generation**

- **Cause:** LLM response truncated due to low max_tokens
- **Solution:** Increased max_tokens to 1536 in email_writer.py
- **Prevention:** Monitor response lengths, adjust per template

**Issue: Stakeholder selections not persisting**

- **Cause:** Select All button only updated React state
- **Solution:** Added database persistence via updateSelectionMutation
- **Prevention:** Always persist critical state to database

**Issue: Template preview shows placeholder data**

- **Cause:** No workflowId passed to preview mutation
- **Solution:** Pass workflowId from WorkflowPage component
- **Prevention:** Add clear `<PLACEHOLDER>` labels for sample data

**Issue: Database SSL connection errors**

- **Cause:** TiDB Cloud requires SSL/TLS connections
- **Solution:** Added `ssl: {'ssl': True}` to pymysql connection
- **Prevention:** Always use SSL for production databases

---

## Maintenance & Support

### Code Quality Standards

1. **TypeScript Strict Mode** - All code must pass strict type checking
2. **ESLint Rules** - Enforce consistent code style
3. **Component Documentation** - JSDoc comments for complex components
4. **Test Coverage** - Vitest tests for critical backend procedures

### Version Control

1. **Checkpoint System** - Use webdev_save_checkpoint for major milestones
2. **Rollback Strategy** - webdev_rollback_checkpoint for recovery
3. **Change Tracking** - Maintain todo.md for feature tracking

### Support Channels

For technical support or feature requests, visit: https://help.manus.im

---

## Glossary

**tRPC** - TypeScript RPC framework for type-safe API calls without code generation

**Drizzle ORM** - TypeScript ORM with automatic type inference from schema

**Manus OAuth** - Authentication system provided by Manus platform

**OpenRouter** - Unified API gateway for multiple LLM providers

**TiDB Cloud** - MySQL-compatible distributed SQL database

**shadcn/ui** - Accessible component library built on Radix UI

**Vitest** - Fast unit test framework for Vite projects

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
