# Deploying Stakeholder Email Outreach to Render

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Why Render?

**Render is the recommended deployment platform** for the Stakeholder Email Outreach application because it:

- **Supports long-running processes** - No artificial timeouts for AI generation (up to 15 minutes)
- **Native Python support** - Run Python AI agents alongside Node.js backend
- **Persistent disk storage** - Unlike serverless platforms
- **Automatic SSL** - Free SSL certificates for custom domains
- **PostgreSQL/MySQL hosting** - Built-in database options (or connect to TiDB Cloud)
- **Generous free tier** - 750 hours/month of free compute
- **Simple deployment** - Git push to deploy with automatic builds
- **Environment variable management** - Secure secrets management
- **Health checks and auto-restart** - Built-in monitoring

---

## Prerequisites

Before deploying to Render, ensure you have:

1. **Render Account** - Sign up at https://render.com (free)
2. **GitHub Repository** - Your code must be in a Git repository
3. **TiDB Cloud Database** - MySQL-compatible database (or use Render PostgreSQL)
4. **AWS S3 Bucket** - For file storage
5. **OpenRouter API Key** - For LLM access

---

## Architecture Overview

The deployment consists of:

1. **Web Service** - Express server serving both API and static frontend
2. **Database** - TiDB Cloud (external) or Render PostgreSQL
3. **File Storage** - AWS S3 for research reports
4. **Environment Variables** - Managed in Render dashboard

---

## Step 1: Prepare Your Repository

### 1.1 Create `render.yaml`

Create a `render.yaml` file in your project root for infrastructure-as-code:

```yaml
services:
  # Main web service
  - type: web
    name: stakeholder-webapp
    env: node
    region: oregon
    plan: free
    buildCommand: pnpm install && pnpm db:push && pnpm build
    startCommand: pnpm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: OPENROUTER_API_KEY
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_S3_BUCKET
        sync: false
      - key: AWS_S3_REGION
        value: us-east-1
      - key: VITE_APP_TITLE
        value: Stakeholder Email Outreach
      - key: VITE_APP_LOGO
        value: https://your-logo-url.com/logo.png
      - key: PORT
        value: 3000
```

### 1.2 Update `package.json` Scripts

Ensure your `package.json` includes these scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:server\" \"pnpm dev:client\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "cd client && vite",
    "build": "pnpm build:client && pnpm build:server",
    "build:client": "cd client && vite build",
    "build:server": "tsc --project server/tsconfig.json",
    "start": "node dist/server/index.js",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  }
}
```

### 1.3 Update Server to Serve Static Files

Modify `server/index.ts` to serve the built frontend:

```typescript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API routes
app.use('/api', apiRouter);

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 1.4 Create Health Check Endpoint

Add a health check endpoint in `server/routers.ts`:

```typescript
export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  // ... other procedures
});
```

Then expose it as a REST endpoint in `server/index.ts`:

```typescript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

---

## Step 2: Set Up Database

### Option A: Use TiDB Cloud (Recommended)

TiDB Cloud provides a MySQL-compatible database with excellent performance and a generous free tier.

1. Sign up at https://tidbcloud.com
2. Create a new Serverless cluster
3. Get your connection string from the dashboard
4. The connection string should look like:
   ```
   mysql://user:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/database?ssl={"rejectUnauthorized":true}
   ```

### Option B: Use Render PostgreSQL

Render provides managed PostgreSQL databases.

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Choose a name and region
3. Select the free plan (256MB RAM, 1GB storage)
4. Click "Create Database"
5. Copy the "Internal Database URL" for your web service

**Note:** If using PostgreSQL, you'll need to update Drizzle configuration:

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { ssl: 'require' });
export const db = drizzle(client);
```

---

## Step 3: Set Up File Storage

### AWS S3 Configuration

1. Create an AWS account at https://aws.amazon.com
2. Create an S3 bucket:
   ```bash
   aws s3 mb s3://stakeholder-reports-prod
   ```
3. Create an IAM user with S3 access:
   ```bash
   aws iam create-user --user-name stakeholder-app
   aws iam attach-user-policy --user-name stakeholder-app --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
   aws iam create-access-key --user-name stakeholder-app
   ```
4. Save the Access Key ID and Secret Access Key for environment variables

### Configure CORS for S3

Create a CORS policy for your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-app.onrender.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Apply the policy:

```bash
aws s3api put-bucket-cors --bucket stakeholder-reports-prod --cors-configuration file://cors.json
```

---

## Step 4: Configure Authentication

### Replace Manus OAuth

Since Manus OAuth is not available outside the Manus platform, you need to implement alternative authentication.

### Option A: Simple JWT Authentication (Quickest)

For internal tools or MVP, implement basic JWT authentication:

```typescript
// server/_core/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const createToken = (user: { id: number; email: string }) => {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
};

// Add login/register procedures to your router
export const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      // Save to database
      const user = await db.insert(users).values({
        email: input.email,
        password: hashedPassword
      });
      const token = createToken({ id: user.id, email: user.email });
      return { token };
    }),
    
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email)
      });
      if (!user || !await bcrypt.compare(input.password, user.password)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }
      const token = createToken({ id: user.id, email: user.email });
      return { token };
    })
});
```

### Option B: Auth0 (Production-Ready)

For production applications, use Auth0:

1. Create an Auth0 account at https://auth0.com
2. Create a new application (Single Page Application)
3. Configure callback URLs: `https://your-app.onrender.com/callback`
4. Install dependencies:
   ```bash
   pnpm add @auth0/auth0-react express-oauth2-jwt-bearer
   ```
5. Update frontend:
   ```typescript
   // client/src/main.tsx
   import { Auth0Provider } from '@auth0/auth0-react';
   
   <Auth0Provider
     domain={import.meta.env.VITE_AUTH0_DOMAIN}
     clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
     redirectUri={window.location.origin}
   >
     <App />
   </Auth0Provider>
   ```

---

## Step 5: Deploy to Render

### 5.1 Connect Repository

1. Log in to Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab account
4. Select your repository
5. Render will detect `render.yaml` and auto-configure

### 5.2 Configure Environment Variables

In the Render dashboard, go to your web service → Environment:

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
AWS_S3_BUCKET=stakeholder-reports-prod
AWS_S3_REGION=us-east-1

# Application
VITE_APP_TITLE=Stakeholder Email Outreach
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=production
PORT=3000
```

### 5.3 Deploy

Click "Create Web Service" to start the deployment. Render will:

1. Clone your repository
2. Install dependencies (`pnpm install`)
3. Run database migrations (`pnpm db:push`)
4. Build the application (`pnpm build`)
5. Start the server (`pnpm start`)

### 5.4 Monitor Deployment

Watch the deployment logs in real-time. The first deployment takes 5-10 minutes. Common issues:

- **Build failures** - Check that all dependencies are in `package.json`
- **Database connection errors** - Verify `DATABASE_URL` is correct and includes SSL
- **Python errors** - Ensure Python dependencies are installed (Render auto-detects `requirements.txt`)

---

## Step 6: Configure Custom Domain

### 6.1 Add Custom Domain

1. In Render dashboard, go to your web service → Settings
2. Scroll to "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `app.yourdomain.com`)

### 6.2 Update DNS

Add a CNAME record in your DNS provider:

```
Type: CNAME
Name: app
Value: your-app.onrender.com
TTL: 3600
```

### 6.3 Enable SSL

Render automatically provisions SSL certificates via Let's Encrypt. This takes 5-10 minutes after DNS propagation.

---

## Step 7: Set Up Python Environment

### 7.1 Create `requirements.txt`

Render auto-detects Python dependencies. Create `requirements.txt` in your project root:

```
openai==1.0.0
pymysql==1.1.0
cryptography==41.0.0
requests==2.31.0
python-dotenv==1.0.0
```

### 7.2 Verify Python Installation

Render automatically installs Python dependencies during build. Verify in the build logs:

```
==> Installing Python dependencies
Collecting openai==1.0.0
...
Successfully installed openai-1.0.0 pymysql-1.1.0
```

---

## Step 8: Enable Health Checks

### 8.1 Configure Health Check

Render automatically pings your health check endpoint every 60 seconds. If it fails 3 times, Render restarts your service.

In `render.yaml`:

```yaml
healthCheckPath: /api/health
```

### 8.2 Implement Health Check Logic

```typescript
// server/index.ts
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.execute('SELECT 1');
    
    // Check S3 connection (optional)
    // await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET });
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

---

## Step 9: Configure Logging and Monitoring

### 9.1 View Logs

Access logs in Render dashboard → your service → Logs

Logs show:
- Application stdout/stderr
- HTTP requests
- Error stack traces
- Build output

### 9.2 Set Up Log Retention

Render retains logs for 7 days on the free tier. For longer retention:

1. Upgrade to paid plan (30-day retention)
2. Or integrate external logging (Logtail, Papertrail)

### 9.3 Add Structured Logging

Install Winston for better logging:

```bash
pnpm add winston
```

```typescript
// server/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Email generation started', { workflowId, stakeholderCount });
logger.error('Email generation failed', { error: error.message, workflowId });
```

---

## Step 10: Performance Optimization

### 10.1 Enable Caching

Add Redis for caching frequently accessed data:

1. In Render dashboard, create a new Redis instance
2. Copy the Internal Redis URL
3. Install Redis client:
   ```bash
   pnpm add ioredis
   ```
4. Configure caching:
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis(process.env.REDIS_URL);
   
   // Cache templates
   const getCachedTemplates = async () => {
     const cached = await redis.get('templates');
     if (cached) return JSON.parse(cached);
     
     const templates = await db.query.emailTemplates.findMany();
     await redis.setex('templates', 3600, JSON.stringify(templates));
     return templates;
   };
   ```

### 10.2 Optimize Database Queries

Add indexes for frequently queried fields:

```sql
CREATE INDEX idx_workflows_user_id ON workflows(userId);
CREATE INDEX idx_stakeholders_workflow_id ON stakeholders(workflowId);
CREATE INDEX idx_emails_workflow_id ON emails(workflowId);
CREATE INDEX idx_templates_user_id ON emailTemplates(userId);
CREATE INDEX idx_templates_last_used ON emailTemplates(lastUsedAt DESC);
```

### 10.3 Enable Compression

Add gzip compression to Express:

```typescript
import compression from 'compression';

app.use(compression());
```

---

## Step 11: Security Hardening

### 11.1 Enable CORS

Configure CORS to only allow your domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-app.onrender.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

### 11.2 Add Rate Limiting

Protect against abuse with rate limiting:

```bash
pnpm add express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### 11.3 Add Helmet for Security Headers

```bash
pnpm add helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

---

## Step 12: Continuous Deployment

### 12.1 Auto-Deploy on Git Push

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Start a new build
3. Run tests (if configured)
4. Deploy if build succeeds
5. Keep the old version running until new version is healthy

### 12.2 Manual Deploy

You can also trigger manual deploys in the Render dashboard:

1. Go to your web service
2. Click "Manual Deploy" → "Deploy latest commit"

### 12.3 Deploy Specific Branch

Configure branch in `render.yaml`:

```yaml
services:
  - type: web
    name: stakeholder-webapp
    branch: production  # Deploy from production branch
```

---

## Step 13: Backup and Disaster Recovery

### 13.1 Database Backups

**TiDB Cloud:**
- Automatic daily backups (retained for 7 days)
- Manual backups via dashboard
- Point-in-time recovery available

**Render PostgreSQL:**
- Automatic daily backups on paid plans
- Manual export via pg_dump:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

### 13.2 Code Backups

Your code is backed up in Git. Ensure you:
- Push regularly to remote repository
- Tag releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- Maintain a separate backup repository

### 13.3 Disaster Recovery Plan

1. **Database Failure** - Restore from latest TiDB Cloud backup
2. **Service Failure** - Render auto-restarts failed services
3. **Data Corruption** - Rollback to previous deployment
4. **Complete Outage** - Redeploy from Git to new Render service

---

## Cost Estimation

### Render Pricing

**Free Tier:**
- 750 hours/month of compute (enough for 1 service running 24/7)
- Automatic sleep after 15 minutes of inactivity
- Wakes on first request (cold start ~30 seconds)

**Starter Plan ($7/month per service):**
- No automatic sleep
- Faster builds
- More resources (512MB RAM)

**Standard Plan ($25/month per service):**
- 2GB RAM
- Priority support
- Faster builds

### Additional Costs

- **TiDB Cloud** - Free tier: 5GB storage, paid: $0.50/hour for larger clusters
- **AWS S3** - ~$0.023/GB storage + $0.09/GB transfer
- **OpenRouter** - ~$0.002-0.02 per 1K tokens
- **Custom Domain** - $10-15/year for domain registration

**Total Monthly Cost (Starter Setup):**
- Render Starter: $7
- TiDB Cloud: $0 (free tier)
- S3: ~$5 (assuming 100GB storage + 50GB transfer)
- OpenRouter: ~$10 (assuming 500K tokens/month)
- **Total: ~$22/month**

---

## Troubleshooting

### Build Failures

**Error: "pnpm: command not found"**

Render uses npm by default. Add to `render.yaml`:

```yaml
buildCommand: npm install -g pnpm && pnpm install && pnpm build
```

**Error: "Module not found"**

Verify all dependencies are in `package.json` and run:

```bash
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "Update dependencies"
git push
```

### Runtime Errors

**Error: "ECONNREFUSED" (Database)**

- Check `DATABASE_URL` is correct
- Verify database is running
- Ensure SSL is configured: `?ssl={"rejectUnauthorized":true}`

**Error: "CORS policy blocked"**

Update CORS configuration to include your Render domain:

```typescript
app.use(cors({
  origin: ['https://your-app.onrender.com', 'http://localhost:5173']
}));
```

**Error: "Python module not found"**

Ensure `requirements.txt` is in project root and includes all Python dependencies.

### Performance Issues

**Slow cold starts**

Upgrade to Starter plan to eliminate automatic sleep.

**Slow email generation**

- Check OpenRouter API response times
- Consider upgrading Render plan for more RAM
- Optimize database queries with indexes

---

## Monitoring and Alerts

### 13.1 Set Up Alerts

Configure alerts in Render dashboard → your service → Notifications:

- **Deploy failures** - Email notification when builds fail
- **Service downtime** - Alert when health checks fail
- **High resource usage** - Warning when CPU/memory exceeds 80%

### 13.2 External Monitoring

Use UptimeRobot or similar for external monitoring:

1. Sign up at https://uptimerobot.com
2. Add monitor for `https://your-app.onrender.com/api/health`
3. Set check interval to 5 minutes
4. Configure email/SMS alerts

---

## Conclusion

Render provides an excellent deployment platform for the Stakeholder Email Outreach application with:

- **No timeout limitations** for long-running AI generation
- **Native Python support** for AI agents
- **Simple deployment** with Git push
- **Generous free tier** for development and small-scale production
- **Easy scaling** as your usage grows

This deployment method is significantly more suitable than Netlify for this application's architecture and requirements.

---

## Support Resources

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Application Support:** https://help.manus.im

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
