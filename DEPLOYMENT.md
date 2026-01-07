# Coolify Deployment Guide

## Production URL
**https://wmslifelong.cloud**

## Prerequisites
- Coolify instance running
- PostgreSQL database accessible
- Git repository pushed to remote

## Deployment Steps

### 1. Create New Application in Coolify

1. Log in to your Coolify dashboard
2. Click **"+ New Resource"** → **"Application"**
3. Select your Git repository source (GitHub/GitLab/etc.)
4. Choose the repository: `heyyrintu/wms-lifelong`
5. Select branch: `main`

### 2. Configure Build Settings

**Build Pack:** Dockerfile

**Dockerfile Location:** `./Dockerfile`

**Port:** `3000`

**Health Check Path:** `/api/health`

### 3. Environment Variables

Add the following environment variables in Coolify:

```bash
# Database
DATABASE_URL=postgres://postgres:GV7YAJ6B82dwq7YGAEGjwZ1INm6cklfHTCRAh5LeCvDzJc9iAhqpff7sZkBoP2nk@72.60.200.116:5567/lifelongWMS

# App Configuration
NEXT_PUBLIC_APP_NAME=Warehouse Mapping
NEXT_PUBLIC_AUTO_CREATE_SKU=true
NEXT_PUBLIC_AUTO_CREATE_LOCATION=true
NEXT_PUBLIC_APP_URL=https://wmslifelong.cloud

# System
DEFAULT_USER=system
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Domain Configuration

1. In Coolify, go to **Domains** section
2. Add domain: `wmslifelong.cloud`
3. Enable **HTTPS** (Let's Encrypt)
4. Enable **Force HTTPS Redirect**

### 5. Deploy

1. Click **"Deploy"** button
2. Monitor build logs
3. Wait for deployment to complete
4. Access your application at: https://wmslifelong.cloud

## Post-Deployment

### Database Migrations

If you need to run migrations after deployment:

1. Access the container shell in Coolify
2. Run: `npx prisma migrate deploy`

### Health Check

Verify the application is running:
```bash
curl https://wmslifelong.cloud/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T...",
  "database": "connected"
}
```

## Troubleshooting

### Build Fails
- Check Coolify build logs
- Verify all environment variables are set
- Ensure DATABASE_URL is accessible from Coolify

### Application Won't Start
- Check container logs in Coolify
- Verify health check endpoint is responding
- Check database connectivity

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure database is accessible from Coolify's network
- Check firewall rules if database is external

## Monitoring

### Logs
View real-time logs in Coolify dashboard under **Logs** tab

### Metrics
Monitor application metrics in Coolify:
- CPU usage
- Memory usage
- Network traffic
- Request count

## Updating the Application

1. Push changes to `main` branch
2. Coolify will auto-deploy (if auto-deploy is enabled)
3. Or manually trigger deployment in Coolify dashboard

## Rollback

If deployment fails:
1. Go to **Deployments** tab in Coolify
2. Select previous successful deployment
3. Click **"Redeploy"**

## Security Checklist

- ✅ HTTPS enabled via Let's Encrypt
- ✅ Security headers configured in next.config.mjs
- ✅ Environment variables secured in Coolify
- ✅ Database credentials not in code
- ✅ Health check endpoint for monitoring
- ✅ Non-root user in Docker container

## Support

For issues related to:
- **Application:** Check application logs in Coolify
- **Coolify:** Refer to [Coolify Documentation](https://coolify.io/docs)
- **Database:** Verify connection and credentials
