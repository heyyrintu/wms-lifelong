# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# Copy prisma directory because postinstall script runs 'prisma generate'
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies) so that build works
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_APPWRITE_ENDPOINT
ARG NEXT_PUBLIC_APPWRITE_PROJECT_ID
ARG NEXT_PUBLIC_APPWRITE_PROJECT_NAME
ARG NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_AUTO_CREATE_SKU
ARG NEXT_PUBLIC_AUTO_CREATE_LOCATION

# Set as environment variables for the build process
ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=$NEXT_PUBLIC_APPWRITE_ENDPOINT
ENV NEXT_PUBLIC_APPWRITE_PROJECT_ID=$NEXT_PUBLIC_APPWRITE_PROJECT_ID
ENV NEXT_PUBLIC_APPWRITE_PROJECT_NAME=$NEXT_PUBLIC_APPWRITE_PROJECT_NAME
ENV NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID=$NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_AUTO_CREATE_SKU=$NEXT_PUBLIC_AUTO_CREATE_SKU
ENV NEXT_PUBLIC_AUTO_CREATE_LOCATION=$NEXT_PUBLIC_AUTO_CREATE_LOCATION

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
# Install curl for health checks
RUN apk add --no-cache curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy Prisma schema and migrations for runtime database operations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
