# Deploying Stakeholder Email Outreach to Railway

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Author:** Manus AI

---

## Why Railway?

**Railway is an excellent deployment platform** for the Stakeholder Email Outreach application because it:

- **Simplest deployment experience** - One command to deploy: `railway up`
- **Built-in database hosting** - PostgreSQL/MySQL included, no external setup needed
- **No timeout limitations** - Full support for long-running AI generation processes
- **Native Python support** - Run Python AI agents alongside Node.js
- **Automatic SSL** - Free SSL certificates for custom domains
- **Generous free trial** - $5 credit to start, then pay-as-you-go
- **Excellent developer experience** - CLI, dashboard, and GitHub integration
- **Environment variable management** - Secure secrets with automatic injection
- **Zero-downtime deployments** - Rolling updates with health checks
- **Built-in monitoring** - CPU, memory, and network metrics

---

## Prerequisites

Before deploying to Railway, ensure you have:

1. **Railway Account** - Sign up at https://railway.app
2. **GitHub Repository** - Your code in a Git repository (optional, can deploy from CLI)
3. **Railway CLI** - Install via npm: `npm install -g @railway/cli`
4. **OpenRouter API Key** - For LLM access at https://openrouter.ai
5. **AWS S3 Bucket** - For file storage (or use Railway volumes)

---

## Architecture Overview

The deployment consists of:

1. **Web Service** - Express server serving both API and static frontend
2. **Database** - Railway MySQL (or PostgreSQL)
3. **File Storage** - AWS S3 or Railway volumes
4. **Environment Variables** - Managed via Railway dashboard or CLI

---

## Step 1: Install Railway CLI

### 1.1 Install CLI

```bash
npm install -g @railway/cli
```

### 1.2 Login to Railway

```bash
railway login
```

This opens your browser for authentication. After logging in, return to your terminal.

### 1.3 Verify Installation

```bash
railway --version
```

Should output something like: `@railway/cli/3.5.0`

---

## Step 2: Initialize Railway Project

### 2.1 Create New Project

Navigate to your project directory:

```bash
cd stakeholder_webapp
```

Initialize Railway project:

```bash
railway init
```

This creates a new Railway project and links your local directory.

### 2.2 Alternative: Link Existing Project

If you already created a project in the Railway dashboard:

```bash
railway link
```

Select your project from the list.

---

## Step 3: Set Up Database

### 3.1 Add MySQL Database

Railway makes database setup incredibly simple:

```bash
railway add --database mysql
```

This provisions a MySQL database and automatically sets the `DATABASE_URL` environment variable.

### 3.2 Alternative: PostgreSQL

If you prefer PostgreSQL:

```bash
railway add --database postgresql
```

**Note:** If using PostgreSQL, update your Drizzle configuration:

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

And update `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 3.3 View Database Connection

```bash
railway variables
```

You'll see `DATABASE_URL` with the connection string.

### 3.4 Connect to Database (Optional)

To run SQL queries directly:

```bash
railway connect mysql
```

Or for PostgreSQL:

```bash
railway connect postgresql
```

---

## Step 4: Configure Environment Variables

### 4.1 Set Variables via CLI

```bash
# JWT Secret (Railway can generate this)
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# OpenRouter API Key
railway variables set OPENROUTER_API_KEY=sk-or-v1-your-key

# AWS S3 Configuration
railway variables set AWS_ACCESS_KEY_ID=AKIA...
railway variables set AWS_SECRET_ACCESS_KEY=your-secret-key
railway variables set AWS_S3_BUCKET=stakeholder-reports-prod
railway variables set AWS_S3_REGION=us-east-1

# Application Configuration
railway variables set VITE_APP_TITLE="Stakeholder Email Outreach"
railway variables set VITE_APP_LOGO="https://your-logo-url.com/logo.png"
railway variables set NODE_ENV=production
```

### 4.2 Alternative: Set Variables via Dashboard

1. Go to https://railway.app/dashboard
2. Select your project
3. Click on your service
4. Go to "Variables" tab
5. Click "New Variable" and add each variable

### 4.3 View All Variables

```bash
railway variables
```

---

## Step 5: Configure Build and Start Commands

### 5.1 Create `railway.json`

Create a `railway.json` file in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm db:migrate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5.2 Update `package.json` Scripts

Ensure your `package.json` includes:

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
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

### 5.3 Update Server to Serve Static Files

Modify `server/index.ts`:

```typescript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API routes
app.use('/api', apiRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Important:** Bind to `0.0.0.0` not `localhost` for Railway to route traffic correctly.

---

## Step 6: Deploy to Railway

### 6.1 Deploy via CLI

The simplest deployment method:

```bash
railway up
```

This command:
1. Uploads your code to Railway
2. Installs dependencies
3. Runs database migrations
4. Builds the application
5. Starts the server

Watch the deployment logs in your terminal.

### 6.2 Alternative: Deploy via GitHub

Link your GitHub repository:

1. In Railway dashboard, go to your project
2. Click "New" → "GitHub Repo"
3. Select your repository
4. Railway will auto-deploy on every push to main branch

### 6.3 View Deployment Logs

```bash
railway logs
```

Or view in the dashboard: Project → Service → Deployments → Click deployment → Logs

---

## Step 7: Configure Custom Domain

### 7.1 Generate Railway Domain

Railway provides a free `.railway.app` subdomain:

```bash
railway domain
```

This generates a URL like: `stakeholder-webapp-production.up.railway.app`

### 7.2 Add Custom Domain

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Enter your domain (e.g., `app.yourdomain.com`)

### 7.3 Update DNS

Add a CNAME record in your DNS provider:

```
Type: CNAME
Name: app
Value: stakeholder-webapp-production.up.railway.app
TTL: 3600
```

### 7.4 Enable SSL

Railway automatically provisions SSL certificates. This takes 5-10 minutes after DNS propagation.

---

## Step 8: Set Up Python Environment

**Note on Python Agent:** For simplicity, this guide runs the Python agent as a child process of the Node.js server. For improved scalability and independent management in a production environment, consider deploying the Python agent as a separate worker service on Railway. This would involve creating a `Procfile` and using a message queue (like Redis) for communication between the services.

### 8.1 Create `requirements.txt`

Railway auto-detects Python dependencies. Create `requirements.txt` in your project root:

```
openai==1.0.0
pymysql==1.1.0
cryptography==41.0.0
requests==2.31.0
python-dotenv==1.0.0
```

### 8.2 Verify Python Installation

Railway's Nixpacks builder automatically installs Python dependencies. Check deployment logs:

```
==> Installing Python dependencies
Collecting openai==1.0.0
...
Successfully installed openai-1.0.0
```

---

## Step 9: Database Migrations

### 9.1 Run Migrations Automatically

Migrations run automatically during build (configured in `railway.json`):

```json
{
  "build": {
    "buildCommand": "pnpm install && pnpm db:push && pnpm build"
  }
}
```

### 9.2 Manual Migration

To run migrations manually:

```bash
railway run pnpm db:push
```

### 9.3 Seed Database

To seed default templates:

```bash
railway run pnpm tsx server/seed-default-templates.ts
```

---

## Step 10: Monitoring and Logs

### 10.1 View Real-Time Logs

```bash
railway logs --follow
```

Press `Ctrl+C` to stop following.

### 10.2 View Metrics

In Railway dashboard:

1. Go to your service
2. Click "Metrics" tab
3. View CPU, memory, network usage

### 10.3 Set Up Alerts

Railway doesn't have built-in alerting yet. Use external monitoring:

**UptimeRobot:**
1. Sign up at https://uptimerobot.com
2. Add monitor for your Railway URL
3. Configure email/SMS alerts

---

## Step 11: File Storage Options

### Option A: AWS S3 (Recommended)

Follow the S3 setup from the Render guide. Configure environment variables:

```bash
railway variables set AWS_ACCESS_KEY_ID=AKIA...
railway variables set AWS_SECRET_ACCESS_KEY=your-secret-key
railway variables set AWS_S3_BUCKET=stakeholder-reports-prod
railway variables set AWS_S3_REGION=us-east-1
```



---

## Step 12: Authentication Setup

### Option A: Simple JWT Authentication

Implement basic JWT authentication (see Render guide for full code).

Set JWT secret:

```bash
railway variables set JWT_SECRET=$(openssl rand -base64 32)
```

### Option B: Auth0

1. Create Auth0 account
2. Set environment variables:
   ```bash
   railway variables set AUTH0_DOMAIN=your-domain.auth0.com
   railway variables set AUTH0_CLIENT_ID=your-client-id
   railway variables set AUTH0_CLIENT_SECRET=your-client-secret
   ```
3. Update frontend and backend code (see Render guide)

---

## Step 13: Scaling and Performance

### 13.1 Vertical Scaling

Railway automatically allocates resources based on usage. To manually adjust:

1. Go to service settings
2. Adjust "Resource Limits"
3. Set CPU and memory limits

### 13.2 Horizontal Scaling

Railway supports horizontal scaling:

```bash
railway scale --replicas 3
```

This creates 3 instances with automatic load balancing.

### 13.3 Add Redis for Caching

```bash
railway add --database redis
```

This provisions Redis and sets `REDIS_URL` environment variable.

Implement caching:

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

---

## Step 14: Environment Management

### 14.1 Multiple Environments

Create separate environments for development, staging, and production:

```bash
# Create staging environment
railway environment create staging

# Switch to staging
railway environment staging

# Deploy to staging
railway up
```

### 14.2 Environment-Specific Variables

Set different variables per environment:

```bash
# Production
railway environment production
railway variables set OPENROUTER_API_KEY=prod-key

# Staging
railway environment staging
railway variables set OPENROUTER_API_KEY=staging-key
```

### 14.3 View Current Environment

```bash
railway environment
```

---

## Step 15: Continuous Deployment

### 15.1 Auto-Deploy from GitHub

If you linked a GitHub repository, Railway auto-deploys on push:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Start a new build
3. Run health checks
4. Deploy if successful
5. Keep old version running until new version is healthy

### 15.2 Deploy Specific Branch

Configure branch in Railway dashboard:

1. Go to service settings
2. "Source" section
3. Change "Branch" to your desired branch

### 15.3 Manual Deploy

Trigger manual deploy:

```bash
railway up
```

Or in dashboard: Service → Deployments → "Deploy"

---

## Step 16: Backup and Recovery

### 16.1 Database Backups

**Automatic Backups:**

Railway automatically backs up databases daily. View backups:

1. Go to database service
2. Click "Backups" tab
3. See list of automatic backups

**Manual Backup:**

```bash
# MySQL
railway run mysqldump -u root -p database_name > backup.sql

# PostgreSQL
railway run pg_dump $DATABASE_URL > backup.sql
```

### 16.2 Restore from Backup

```bash
# MySQL
railway run mysql -u root -p database_name < backup.sql

# PostgreSQL
railway run psql $DATABASE_URL < backup.sql
```

### 16.3 Rollback Deployment

Railway keeps previous deployments. To rollback:

1. Go to service → Deployments
2. Find previous successful deployment
3. Click "Redeploy"

---

## Step 17: Security Best Practices

### 17.1 Enable CORS

Configure CORS to only allow your domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.RAILWAY_PUBLIC_DOMAIN
    : 'http://localhost:5173',
  credentials: true
}));
```

### 17.2 Add Rate Limiting

```bash
pnpm add express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 17.3 Environment Variable Security

- Never commit `.env` files
- Use Railway's variable management
- Rotate secrets regularly
- Use different keys for each environment

---

## Step 18: Cost Optimization

### 18.1 Railway Pricing

**Starter Plan ($5/month):**
- $5 credit included
- Pay for what you use beyond credit
- ~$0.000231/GB-hour for memory
- ~$0.000463/vCPU-hour

**Developer Plan ($20/month):**
- $20 credit included
- Same usage rates
- Priority support

### 18.2 Estimate Monthly Costs

**Example: Small Production App**

- Web service (512MB RAM, 0.5 vCPU, 24/7): ~$10/month
- MySQL database (256MB RAM): ~$5/month
- Redis cache (128MB RAM): ~$2.50/month
- **Total: ~$17.50/month** (covered by Developer plan credit)

### 18.3 Cost Optimization Tips

1. **Use sleep mode for dev environments** - Railway can auto-sleep inactive services
2. **Right-size resources** - Don't over-provision memory/CPU
3. **Use caching** - Reduce database queries with Redis
4. **Optimize images** - Smaller Docker images = faster deploys = lower costs

---

## Step 19: Troubleshooting

### Build Failures

**Error: "pnpm: command not found"**

Railway auto-detects pnpm from `pnpm-lock.yaml`. If it fails, add to `railway.json`:

```json
{
  "build": {
    "buildCommand": "npm install -g pnpm && pnpm install && pnpm build"
  }
}
```

**Error: "Module not found"**

Ensure all dependencies are in `package.json`:

```bash
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "Update dependencies"
git push
```

### Runtime Errors

**Error: "ECONNREFUSED" (Database)**

Check database connection:

```bash
railway variables
```

Verify `DATABASE_URL` is set. If missing:

```bash
railway add --database mysql
```

**Error: "Port already in use"**

Railway sets `PORT` environment variable. Ensure your server uses it:

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');
```

**Error: "Health check failed"**

Verify health check endpoint works:

```bash
railway run curl http://localhost:3000/api/health
```

### Performance Issues

**Slow response times**

1. Check metrics in Railway dashboard
2. Increase memory/CPU limits
3. Add Redis caching
4. Optimize database queries

**Out of memory errors**

1. Check memory usage in metrics
2. Increase memory limit in service settings
3. Optimize code to reduce memory footprint

---

## Step 20: Advanced Features

### 20.1 Private Networking

Connect services via private network:

```bash
railway network add
```

Services can communicate via internal URLs without going through public internet.

### 20.2 Webhooks

Set up webhooks for deployment events:

1. Go to project settings
2. "Webhooks" section
3. Add webhook URL
4. Select events (deploy success, deploy failure, etc.)

### 20.3 CLI Plugins

Extend Railway CLI with plugins:

```bash
railway plugin install <plugin-name>
```

### 20.4 Scheduled Jobs

Use Railway's cron jobs:

1. Create a new service
2. Set start command to your cron job script
3. Configure schedule in service settings

---

## Comparison: Railway vs Other Platforms

| Feature | Railway | Render | Netlify |
|---------|---------|--------|---------|
| **Deployment Speed** | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ Fast | ⭐⭐⭐ Medium |
| **Developer Experience** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **Database Hosting** | ✅ Built-in | ✅ Built-in | ❌ External only |
| **Long-running Processes** | ✅ Supported | ✅ Supported | ❌ 26s timeout |
| **Python Support** | ✅ Native | ✅ Native | ⚠️ Limited |
| **Free Tier** | $5 credit | 750 hours | 100GB bandwidth |
| **Pricing** | Pay-as-you-go | Fixed tiers | Fixed tiers |
| **CLI Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Verdict:** Railway is the best choice for this application due to simplest deployment, built-in database, and excellent developer experience.

---

## Quick Start Checklist

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize project: `railway init`
- [ ] Add database: `railway add --database mysql`
- [ ] Set environment variables: `railway variables set KEY=value`
- [ ] Deploy: `railway up`
- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Configure backups

---

## Conclusion

Railway provides the simplest and most developer-friendly deployment experience for the Stakeholder Email Outreach application. With one-command deployment, built-in database hosting, and excellent support for long-running processes, Railway is an ideal platform for both development and production deployments.

The combination of powerful CLI, intuitive dashboard, and generous pricing makes Railway the recommended choice for teams that value developer productivity and deployment simplicity.

---

## Support Resources

- **Railway Documentation:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app
- **Application Support:** https://help.manus.im

---

**Document Version:** 1.0.0  
**Last Reviewed:** December 2025  
**Next Review:** March 2026
