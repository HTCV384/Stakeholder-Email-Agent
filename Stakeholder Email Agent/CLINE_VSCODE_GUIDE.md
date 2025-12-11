# Cline/VSCode Development Guide

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Overview

This guide provides instructions for setting up and using Cline (formerly Claude Dev) in Visual Studio Code to work with the Stakeholder Email Outreach application. Cline is an AI-powered coding assistant that can help you understand, modify, and extend the codebase efficiently.

---

## What is Cline?

Cline is a VSCode extension that provides an AI coding assistant powered by Claude (Anthropic's LLM). It can:

- **Understand your codebase** - Analyze files and explain how they work
- **Write code** - Generate new features based on natural language descriptions
- **Debug issues** - Identify and fix bugs
- **Refactor code** - Improve code quality and structure
- **Answer questions** - Explain technical concepts and design decisions

---

## Installation

### Step 1: Install Visual Studio Code

If you don't have VSCode installed:

1. Download from https://code.visualstudio.com
2. Install for your operating system
3. Launch VSCode

### Step 2: Install Cline Extension

1. Open VSCode
2. Click the Extensions icon in the sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Cline"
4. Click "Install" on the Cline extension by Anthropic
5. Wait for installation to complete

### Step 3: Configure API Key

Cline requires an Anthropic API key or OpenRouter API key:

**Option A: Anthropic API Key (Recommended)**

1. Sign up at https://console.anthropic.com
2. Create an API key
3. In VSCode, open Cline settings (gear icon in Cline panel)
4. Select "Anthropic" as provider
5. Enter your API key
6. Select model: `claude-3-5-sonnet-20241022` (recommended)

**Option B: OpenRouter API Key**

1. Sign up at https://openrouter.ai
2. Create an API key
3. In VSCode, open Cline settings
4. Select "OpenRouter" as provider
5. Enter your API key
6. Select model: `anthropic/claude-3.5-sonnet`

---

## Project Setup

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd stakeholder_webapp
```

### Step 2: Open in VSCode

```bash
code .
```

Or: File → Open Folder → Select `stakeholder_webapp` directory

### Step 3: Install Dependencies

Open integrated terminal (`Ctrl+`` or View → Terminal):

```bash
pnpm install
```

### Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
# Database
DATABASE_URL=mysql://user:password@host:4000/database

# Authentication
JWT_SECRET=your-random-secret-key-min-32-chars

# AI Integration
OPENROUTER_API_KEY=sk-or-v1-your-key

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=stakeholder-reports-dev
AWS_S3_REGION=us-east-1

# Application
VITE_APP_TITLE=Stakeholder Email Outreach (Dev)
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=development
```

### Step 5: Run Database Migrations

```bash
pnpm db:push
```

### Step 6: Seed Default Templates

```bash
pnpm tsx server/seed-default-templates.ts
```

### Step 7: Start Development Server

```bash
pnpm dev
```

This starts both frontend (port 5173) and backend (port 3000).

---

## Using Cline Effectively

### Opening Cline

Click the Cline icon in the VSCode sidebar (or press `Ctrl+Shift+P` and type "Cline: Open").

### Basic Workflow

1. **Ask questions** - Type your question in the Cline chat
2. **Review suggestions** - Cline will propose code changes
3. **Accept/reject** - Approve changes you want to apply
4. **Test changes** - Run the app to verify everything works

### Example Prompts

**Understanding the Codebase:**

```
Explain how the email generation workflow works in this application
```

```
What does the WorkflowPage component do?
```

```
How is authentication implemented in this app?
```

**Adding Features:**

```
Add a new email template called "Partnership Proposal" with a collaborative tone
```

```
Implement a feature to duplicate existing templates
```

```
Add a search bar to filter stakeholders by name in the Select step
```

**Debugging:**

```
Why is email generation failing with "JSON Parse Error"?
```

```
The Select All button isn't persisting selections. Help me debug this.
```

```
Template preview is showing placeholder data instead of real data. Fix this.
```

**Refactoring:**

```
Refactor the WorkflowPage component to extract the Select step into a separate component
```

```
Improve error handling in the email generation mutation
```

```
Add TypeScript types for all tRPC procedures
```

---

## Best Practices

### 1. Provide Context

When asking Cline to make changes, provide context:

**Bad:**
```
Add a button
```

**Good:**
```
Add a "Delete Template" button to the template management section in WorkflowPage.tsx. 
It should call the deleteTemplate mutation and show a confirmation dialog before deleting.
```

### 2. Review Changes Carefully

Always review Cline's proposed changes before accepting:

- Check that the code makes sense
- Verify it follows the project's patterns
- Look for potential bugs or edge cases
- Ensure TypeScript types are correct

### 3. Test After Changes

After accepting changes, test the affected functionality:

```bash
# Run the app
pnpm dev

# Run tests (if available)
pnpm test

# Check TypeScript errors
pnpm tsc --noEmit
```

### 4. Use Specific File References

Reference specific files when asking questions:

```
In server/workflowRouter.ts, explain how the generateEmails mutation works
```

```
Update the handleStakeholderToggle function in client/src/pages/WorkflowPage.tsx 
to add error handling
```

### 5. Break Down Complex Tasks

For large features, break them into smaller steps:

**Instead of:**
```
Build a complete analytics dashboard with charts and filters
```

**Do:**
```
Step 1: Create a new AnalyticsPage component with basic layout
Step 2: Add a tRPC query to fetch email generation statistics
Step 3: Display statistics in cards
Step 4: Add a chart showing emails generated over time
```

---

## Common Development Tasks

### Task 1: Add a New Email Template

**Prompt to Cline:**

```
Add a new default email template to server/seed-default-templates.ts:

Name: "Quick Follow-up"
Description: "Brief follow-up for stakeholders who haven't responded"
Prompt: Create a prompt that generates short, friendly follow-up emails 
(under 100 words) that reference the previous outreach and offer a 
simple next step like scheduling a 15-minute call.
```

After Cline makes changes:

1. Review the new template in `seed-default-templates.ts`
2. Run seed script: `pnpm tsx server/seed-default-templates.ts`
3. Reload the app and verify the new template appears in the dropdown

### Task 2: Add a New Field to Stakeholders

**Prompt to Cline:**

```
Add an "email" field to the stakeholders table:

1. Update drizzle/schema.ts to add email column (varchar(255), nullable)
2. Run migration: pnpm db:push
3. Update the stakeholder extraction in Python agent to extract email addresses
4. Display email in the stakeholder cards in WorkflowPage.tsx
```

### Task 3: Implement Template Search

**Prompt to Cline:**

```
Add a search input above the template dropdown in WorkflowPage.tsx 
that filters templates by name or description as the user types. 
Use the existing shadcn/ui Input component.
```

### Task 4: Add Export to JSON

**Prompt to Cline:**

```
Add a "Export to JSON" button next to the "Export to CSV" button 
in the Review step. It should export emails in this format:

[
  {
    "recipient": "John Doe",
    "title": "Chief Medical Officer",
    "company": "Hospital Name",
    "subject": "Email subject",
    "body": "Email body"
  }
]
```

### Task 5: Improve Error Messages

**Prompt to Cline:**

```
Update all toast.error() calls in WorkflowPage.tsx to show more 
helpful error messages. Instead of generic "Failed to...", show 
specific reasons like "Database connection failed" or "File too large (max 10MB)".
```

---

## Debugging with Cline

### Debugging Workflow

1. **Describe the problem**
   ```
   When I select all 14 stakeholders and generate emails, only 3 emails are created
   ```

2. **Cline will analyze** the relevant code and identify potential issues

3. **Review the diagnosis** - Cline will explain what it found

4. **Accept the fix** - If Cline proposes a solution, review and accept it

5. **Test the fix** - Verify the issue is resolved

### Common Issues

**Issue: TypeScript Errors**

```
I'm getting TypeScript error "Property 'templateId' does not exist on type 'Email'" 
in WorkflowPage.tsx. Help me fix this.
```

**Issue: tRPC Mutation Failing**

```
The generateEmails mutation is failing with "INTERNAL_SERVER_ERROR". 
Check the server logs and help me debug.
```

**Issue: React State Not Updating**

```
The selectedStakeholderIds state is not updating when I check a stakeholder checkbox. 
Debug the handleStakeholderToggle function.
```

---

## Code Navigation

### Useful VSCode Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Quick file open |
| `Ctrl+Shift+F` | Search across all files |
| `F12` | Go to definition |
| `Alt+F12` | Peek definition |
| `Shift+F12` | Find all references |
| `Ctrl+`` | Toggle terminal |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Shift+E` | Show file explorer |

### Project Structure

```
stakeholder_webapp/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components (WorkflowPage, Home)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and tRPC client
│   │   ├── App.tsx        # Routes and layout
│   │   └── main.tsx       # Entry point
│   └── index.html
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Main tRPC router
│   ├── workflowRouter.ts  # Workflow procedures
│   ├── templateRouter.ts  # Template procedures
│   ├── db.ts              # Database queries
│   ├── agentic_system/    # Python AI agents
│   └── _core/             # Framework (auth, LLM, storage)
├── drizzle/               # Database schema and migrations
│   └── schema.ts
└── package.json
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `client/src/pages/WorkflowPage.tsx` | Main UI component (6-step workflow) |
| `server/workflowRouter.ts` | Backend API for workflows |
| `server/templateRouter.ts` | Backend API for templates |
| `server/agentic_system/agents/email_writer.py` | AI email generation logic |
| `drizzle/schema.ts` | Database schema definitions |
| `server/db.ts` | Database query helpers |

---

## Advanced Cline Features

### 1. Multi-File Edits

Cline can edit multiple files at once:

```
Update both the frontend and backend to add a "favorite" flag to templates:

1. Add isFavorite column to emailTemplates table in drizzle/schema.ts
2. Add toggleFavorite mutation in server/templateRouter.ts
3. Add a star icon to template cards in WorkflowPage.tsx that calls the mutation
4. Sort favorited templates to the top of the list
```

### 2. Code Explanations

Ask Cline to explain complex code:

```
Explain how the tRPC context is created and how it provides user authentication 
to protected procedures. Walk me through the flow from HTTP request to procedure execution.
```

### 3. Architecture Decisions

Get help with architectural questions:

```
Should I implement real-time email generation progress using WebSockets or 
polling? What are the tradeoffs for this application?
```

### 4. Code Reviews

Ask Cline to review your code:

```
Review the handleGenerate function in WorkflowPage.tsx and suggest improvements 
for error handling, loading states, and user feedback.
```

---

## Deployment with Cline

### Preparing for Deployment

**Prompt to Cline:**

```
Help me prepare this application for deployment to Railway:

1. Create a railway.json configuration file
2. Update server/index.ts to serve static files in production
3. Add a health check endpoint at /api/health
4. Ensure all environment variables are documented
```

### Deployment Checklist

Ask Cline to generate a deployment checklist:

```
Create a deployment checklist for this application covering:
- Environment variables that need to be set
- Database migrations that need to run
- Build commands and start commands
- Health check configuration
- Post-deployment verification steps
```

---

## Troubleshooting Cline

### Issue: Cline Not Responding

1. Check API key is valid
2. Verify internet connection
3. Restart VSCode
4. Check Anthropic/OpenRouter API status

### Issue: Cline Makes Incorrect Changes

1. Be more specific in your prompt
2. Provide more context about the desired behavior
3. Reference specific files and functions
4. Break down complex requests into smaller steps

### Issue: Cline Can't Find Files

1. Ensure files are in the workspace
2. Check file paths are correct
3. Reload VSCode window (Ctrl+Shift+P → "Reload Window")

---

## Best Practices Summary

1. **Start with documentation** - Read ARCHITECTURE.md, ROADMAP.md, and FEATURES.md before making changes
2. **Use Cline for understanding** - Ask questions before making changes
3. **Review all changes** - Never blindly accept Cline's suggestions
4. **Test thoroughly** - Run the app after every change
5. **Commit frequently** - Use Git to track changes and enable easy rollback
6. **Ask specific questions** - Provide context and reference specific files
7. **Break down tasks** - Tackle complex features in small steps
8. **Learn from Cline** - Use it as a teaching tool to understand the codebase

---

## Example Development Session

### Goal: Add Email Preview Before Generation

**Step 1: Ask for guidance**

```
I want to add a preview feature that shows what one email will look like 
before generating all emails. What's the best approach?
```

**Step 2: Implement backend**

```
Add a previewEmail mutation to server/workflowRouter.ts that:
- Takes workflowId, stakeholderId, and templateId
- Generates a single email using the Python agent
- Returns the email without saving to database
```

**Step 3: Implement frontend**

```
Add a "Preview" button in the Configure step of WorkflowPage.tsx that:
- Calls the previewEmail mutation with the first selected stakeholder
- Shows the result in a modal dialog
- Uses the existing Dialog component from shadcn/ui
```

**Step 4: Test**

1. Run `pnpm dev`
2. Upload a report and select stakeholders
3. Choose a template and click "Preview"
4. Verify the preview shows correctly

**Step 5: Refine**

```
Update the preview modal to show:
- Stakeholder name and title at the top
- Email subject in a larger font
- Email body with proper line breaks
- A "Generate All" button to proceed
```

---

## Resources

### Documentation

- **Cline GitHub:** https://github.com/cline/cline
- **VSCode Docs:** https://code.visualstudio.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **React Docs:** https://react.dev
- **tRPC Docs:** https://trpc.io

### Project Documentation

- `ARCHITECTURE.md` - System architecture and design
- `ROADMAP.md` - Product roadmap and feature plans
- `FEATURES.md` - Detailed feature documentation
- `DEPLOYMENT_RENDER.md` - Render deployment guide
- `DEPLOYMENT_RAILWAY.md` - Railway deployment guide

### Community

- **Cline Discord:** https://discord.gg/cline
- **Application Support:** https://help.manus.im

---

## Conclusion

Cline is a powerful tool for understanding, modifying, and extending the Stakeholder Email Outreach application. By following the best practices in this guide, you can leverage Cline to accelerate development while maintaining code quality and consistency.

Remember: Cline is an assistant, not a replacement for understanding the codebase. Use it to learn, not just to generate code blindly.

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
