# Railway-Optimized Multi-Stage Dockerfile
# Replicates successful local build environment for reliable deployments

# =============================================================================
# Build Stage: Compile TypeScript and React
# =============================================================================
FROM node:22.11.0-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files for dependency resolution
COPY stakeholder_webapp/package.json stakeholder_webapp/package-lock.json* ./

# Install dependencies with exact versions (including dev dependencies)
RUN npm install

# Copy source code with proper context
# Railway builds from repo root, so copy from stakeholder_webapp subdirectory
COPY stakeholder_webapp/ .

# Set build environment
ENV NODE_ENV=production
ENV RAILWAY_STATIC_URL=https://stakeholderemailagent.railway.app
ENV PORT=3000

# Debug: List files to verify what's copied
RUN echo "=== DEBUG: Files in /app ===" && find /app -type f -name "*.ts" -o -name "*.tsx" | head -20
RUN echo "=== DEBUG: Client lib directory ===" && ls -la /app/client/src/lib/ || echo "Directory doesn't exist"
RUN echo "=== DEBUG: trpc.ts file check ===" && ls -la /app/client/src/lib/trpc* || echo "No trpc files found"

# Build the application
# This replicates our successful local build: vite build && esbuild server/_core/index.ts
RUN npm run build

# =============================================================================
# Runtime Stage: Minimal production environment  
# =============================================================================
FROM node:22.11.0-alpine AS runtime

# Set working directory 
WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy package files from builder stage where they were validated
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Copy built application from build stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Copy shared directory if needed for runtime
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application (matches our package.json start script)
CMD ["sh", "-c", "npm run db:migrate && NODE_ENV=production node dist/index.js"]
