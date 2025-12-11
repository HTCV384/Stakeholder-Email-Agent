# Deploying Stakeholder Email Outreach to Netlify

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Important Note

**This application is designed for deployment on the Manus platform**, which provides built-in hosting with custom domain support, automatic SSL, and integrated environment variable management. The Manus platform handles all infrastructure concerns including database hosting, file storage, and OAuth authentication.

However, if you choose to deploy to external hosting providers like Netlify, you will need to manually configure all infrastructure dependencies. This guide provides instructions for Netlify deployment, but be aware that you may encounter compatibility issues that require additional troubleshooting.

---

## Prerequisites

Before deploying to Netlify, ensure you have:

1. **Netlify Account** - Sign up at https://netlify.com
2. **GitHub Repository** - Your code must be in a Git repository
3. **TiDB Cloud Database** - Create a MySQL-compatible database at https://tidbcloud.com
4. **AWS S3 Bucket** - For file storage (or use Netlify Large Media)
5. **OpenRouter API Key** - For LLM access at https://openrouter.ai
6. **Custom OAuth Setup** - You'll need to replace Manus OAuth with your own authentication system

---

## Architecture Considerations

### Netlify Limitations

Netlify is primarily designed for static sites and serverless functions. This application uses a full Express server with long-running processes (AI agent generation), which presents challenges:

**Serverless Function Timeout** - Netlify Functions have a 10-second timeout on the free tier and 26-second timeout on paid tiers. Email generation can take 30+ seconds, exceeding these limits.

**WebSocket Support** - Netlify does not support persistent WebSocket connections, which limits real-time features.

**File System Access** - Serverless functions have read-only file systems, so any file operations must use external storage (S3).

**Python Agent Integration** - The Python AI agents require a Python runtime, which Netlify Functions support but with limitations on package size and execution time.

### Recommended Architecture

For Netlify deployment, consider this hybrid architecture:

1. **Frontend** - Deploy React app as static site on Netlify
2. **Backend API** - Deploy Express server on a separate platform (Render, Railway, or AWS Lambda with extended timeout)
3. **Database** - Use TiDB Cloud or PlanetScale for MySQL-compatible hosting
4. **File Storage** - Use AWS S3 or Netlify Large Media
5. **Authentication** - Implement Auth0, Clerk, or custom JWT authentication

This guide focuses on deploying the full application to Netlify, but be prepared to move the backend to a more suitable platform if you encounter timeout issues.

---

## Step 1: Prepare Your Repository

### 1.1 Clone or Fork the Repository

```bash
git clone <your-repository-url>
cd stakeholder_webapp
```

### 1.2 Install Dependencies

```bash
pnpm install
```

### 1.3 Create Netlify Configuration

Create a `netlify.toml` file in the project root:

```toml
[build]
  command = "pnpm build"
  publish = "client/dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "22.13.0"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["express", "drizzle-orm", "mysql2"]
```

### 1.4 Create Serverless Function Wrapper

Create `netlify/functions/server.ts`:

```typescript
import express from "express";
import serverless from "serverless-http";
import { createServer } from "../../server/index";

const app = createServer();

export const handler = serverless(app);
```

### 1.5 Update Package.json

Add Netlify-specific scripts to `package.json`:

```json
{
  "scripts": {
    "build": "pnpm build:client && pnpm build:server",
    "build:client": "cd client && vite build",
    "build:server": "tsc --project server/tsconfig.json",
    "netlify:dev": "netlify dev"
  },
  "devDependencies": {
    "netlify-cli": "^17.0.0",
    "serverless-http": "^3.2.0"
  }
}
```

---

## Step 2: Configure Environment Variables

### 2.1 Database Configuration

Create a TiDB Cloud database:

1. Sign up at https://tidbcloud.com
2. Create a new cluster (Serverless tier is free)
3. Get your connection string from the dashboard
4. Note: Connection string should include `?ssl={"rejectUnauthorized":true}`

### 2.2 Authentication Configuration

Since Manus OAuth is not available outside the Manus platform, you need to replace it:

**Option A: Auth0**

1. Create an Auth0 account at https://auth0.com
2. Create a new application (Single Page Application)
3. Configure callback URLs: `https://your-site.netlify.app/callback`
4. Get your Domain and Client ID

**Option B: Clerk**

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your Publishable Key and Secret Key

**Option C: Custom JWT**

Implement your own JWT-based authentication system. This requires significant development work.

### 2.3 Set Environment Variables in Netlify

Go to your Netlify site dashboard → Site settings → Environment variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:4000/database?ssl={"rejectUnauthorized":true}

# Authentication (if using Auth0)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-random-secret-key-min-32-chars

# AI Integration
OPENROUTER_API_KEY=your-openrouter-api-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1

# Application
VITE_APP_TITLE=Stakeholder Email Outreach
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=production
```

---

## Step 3: Modify Authentication Code

### 3.1 Replace Manus OAuth

The application currently uses Manus OAuth in `server/_core/auth.ts`. You need to replace this with your chosen authentication provider.

**For Auth0:**

```typescript
// server/_core/auth.ts
import { auth } from 'express-oauth2-jwt-bearer';

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
});

// Middleware to extract user from JWT
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### 3.2 Update tRPC Context

Modify `server/_core/context.ts` to use your new authentication:

```typescript
import { authMiddleware } from './auth';

export const createContext = async ({ req, res }) => {
  // Extract user from JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;
  
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Invalid token
    }
  }
  
  return { req, res, user };
};
```

### 3.3 Update Frontend Authentication

Modify `client/src/lib/auth.tsx` to use your authentication provider:

```typescript
// For Auth0
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

export const AuthProvider = ({ children }) => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      redirectUri={window.location.origin}
    >
      {children}
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  return { user, isAuthenticated, login: loginWithRedirect, logout };
};
```

---

## Step 4: Handle Python Agent Execution

### 4.1 Python Runtime on Netlify

Netlify Functions support Python, but you need to create separate Python functions for AI agent operations.

Create `netlify/functions/generate-emails.py`:

```python
import json
import sys
import os

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../server'))

from agentic_system.agents.orchestrator import Orchestrator

def handler(event, context):
    try:
        body = json.loads(event['body'])
        workflow_id = body['workflowId']
        mode_config = body['modeConfig']
        
        # Initialize orchestrator
        orchestrator = Orchestrator()
        result = orchestrator.run(workflow_id, mode_config)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### 4.2 Install Python Dependencies

Create `netlify/functions/requirements.txt`:

```
openai==1.0.0
pymysql==1.1.0
requests==2.31.0
```

### 4.3 Update Backend to Call Python Function

Modify `server/workflowRouter.ts` to call the Python function via HTTP:

```typescript
generateEmails: protectedProcedure
  .input(z.object({
    workflowId: z.number(),
    generationMode: z.enum(['template', 'ai_style', 'custom']),
    modeConfig: z.any()
  }))
  .mutation(async ({ input, ctx }) => {
    // Call Python function via HTTP
    const response = await fetch('/.netlify/functions/generate-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: input.workflowId,
        modeConfig: input.modeConfig
      })
    });
    
    if (!response.ok) {
      throw new Error('Email generation failed');
    }
    
    return await response.json();
  })
```

---

## Step 5: Deploy to Netlify

### 5.1 Connect Repository

1. Log in to Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository
5. Netlify will auto-detect the build settings from `netlify.toml`

### 5.2 Configure Build Settings

Verify these settings in the Netlify UI:

- **Build command:** `pnpm build`
- **Publish directory:** `client/dist`
- **Functions directory:** `netlify/functions`

### 5.3 Deploy

Click "Deploy site" to start the build process. Netlify will:

1. Install dependencies
2. Run the build command
3. Deploy the static files
4. Deploy the serverless functions

### 5.4 Monitor Build

Watch the build logs for errors. Common issues:

- **Module not found** - Check that all dependencies are in `package.json`
- **Build timeout** - Increase timeout in Netlify settings (paid plans only)
- **Environment variables missing** - Verify all required env vars are set

---

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 6.2 Enable HTTPS

Netlify automatically provisions SSL certificates via Let's Encrypt. This usually takes a few minutes after DNS propagation.

---

## Step 7: Test Deployment

### 7.1 Verify Frontend

Visit your Netlify URL (e.g., `https://your-site.netlify.app`) and verify:

- Homepage loads correctly
- Authentication works (login/logout)
- Navigation between pages works
- Static assets load (images, fonts)

### 7.2 Verify Backend

Test API endpoints:

```bash
curl https://your-site.netlify.app/api/health
```

Should return `{"status": "ok"}`

### 7.3 Verify Full Workflow

1. Log in to the application
2. Upload a test research report
3. Extract stakeholders
4. Select stakeholders
5. Generate emails
6. Review and export

**Note:** Email generation may timeout on Netlify free tier due to the 10-second function limit. If this occurs, you'll need to upgrade to a paid plan or move the backend to a different platform.

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**

- Solution: Run `pnpm install` locally and verify all dependencies are in `package.json`
- Check that `node_modules` is not in `.gitignore`

**Error: "Build exceeded maximum time"**

- Solution: Upgrade to Netlify Pro for longer build times
- Or: Optimize build by removing unused dependencies

### Runtime Errors

**Error: "Function invocation timeout"**

- Solution: This is the most common issue with AI generation
- Options:
  1. Upgrade to Netlify Pro for 26-second timeout
  2. Move backend to Render/Railway for longer timeouts
  3. Implement async job queue with webhook callbacks

**Error: "Database connection failed"**

- Solution: Verify `DATABASE_URL` includes SSL parameters
- Check that TiDB Cloud allows connections from Netlify IPs

**Error: "Authentication failed"**

- Solution: Verify JWT_SECRET is set correctly
- Check that Auth0/Clerk configuration matches environment variables

### Performance Issues

**Slow page loads**

- Enable Netlify CDN caching
- Optimize images and assets
- Use lazy loading for components

**Slow API responses**

- Check database query performance
- Add database indexes for frequently queried fields
- Consider moving backend to dedicated server

---

## Alternative Deployment Platforms

If you encounter insurmountable issues with Netlify, consider these alternatives:

### Vercel

Similar to Netlify but with better support for full-stack applications. Deployment process is nearly identical.

### Render

Better suited for long-running processes. Supports full Express servers without serverless limitations.

```bash
# Render deployment
render.yaml:
services:
  - type: web
    name: stakeholder-webapp
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
```

### Railway

Excellent for full-stack applications with database hosting included.

```bash
# Railway deployment
railway link
railway up
```

### AWS Amplify

Full-featured platform with good support for Express backends.

---

## Cost Considerations

### Netlify Pricing

- **Free Tier** - 100GB bandwidth, 300 build minutes/month, 10-second function timeout
- **Pro Tier** ($19/month) - 400GB bandwidth, 25,000 build minutes, 26-second function timeout
- **Business Tier** ($99/month) - 1TB bandwidth, unlimited build minutes, 26-second timeout

### Additional Costs

- **TiDB Cloud** - Free tier available, paid tiers start at $0.50/hour
- **AWS S3** - ~$0.023/GB storage, ~$0.09/GB transfer
- **OpenRouter** - Pay per token, varies by model (~$0.002-0.02 per 1K tokens)

---

## Security Considerations

### Environment Variables

Never commit environment variables to Git. Always use Netlify's environment variable management.

### API Keys

Rotate API keys regularly. Use different keys for development and production.

### Database Security

- Enable SSL/TLS for all database connections
- Use strong passwords (min 16 characters)
- Restrict database access to Netlify IPs if possible

### CORS Configuration

Update `server/index.ts` to restrict CORS to your domain:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-site.netlify.app'
    : 'http://localhost:5173',
  credentials: true
}));
```

---

## Monitoring and Logging

### Netlify Analytics

Enable Netlify Analytics in Site settings → Analytics for:

- Page views and unique visitors
- Top pages and referrers
- Bandwidth usage

### Error Tracking

Integrate error tracking service:

**Sentry:**

```bash
pnpm add @sentry/react @sentry/node
```

```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Function Logs

View function logs in Netlify dashboard → Functions → Select function → Logs

---

## Maintenance

### Regular Updates

- Update dependencies monthly: `pnpm update`
- Review Netlify changelog for platform updates
- Monitor security advisories for vulnerabilities

### Backup Strategy

- Enable TiDB Cloud automated backups
- Export database weekly for local backup
- Version control all code changes

### Performance Monitoring

- Monitor function execution times
- Track database query performance
- Review error rates and user feedback

---

## Conclusion

Deploying the Stakeholder Email Outreach application to Netlify requires significant modifications to the authentication system and careful handling of long-running AI generation processes. While Netlify is an excellent platform for static sites and simple serverless functions, this application's architecture is better suited to platforms like Render or Railway that support full Express servers without timeout limitations.

For the smoothest deployment experience with minimal configuration, we recommend using the built-in Manus platform hosting, which handles all infrastructure concerns automatically.

---

## Support

For deployment assistance:

- **Netlify Support:** https://answers.netlify.com
- **Application Support:** https://help.manus.im
- **Community Forum:** https://community.manus.im

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
