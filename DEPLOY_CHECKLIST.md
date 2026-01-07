# Quick Deployment Checklist for Coolify

## ✅ Pre-Deployment (Completed)
- [x] Dockerfile created with multi-stage build
- [x] .dockerignore configured
- [x] Next.js standalone output enabled
- [x] Security headers configured
- [x] Health check endpoint created
- [x] Environment variables documented
- [x] Production build tested successfully
- [x] All changes committed and pushed to main

## 🚀 Coolify Deployment Steps

### 1. Create Application
```
Coolify Dashboard → + New Resource → Application
```

### 2. Repository Settings
- **Source:** GitHub/GitLab
- **Repository:** heyyrintu/wms-lifelong
- **Branch:** main
- **Build Pack:** Dockerfile

### 3. Essential Environment Variables
```bash
DATABASE_URL=postgres://postgres:GV7YAJ6B82dwq7YGAEGjwZ1INm6cklfHTCRAh5LeCvDzJc9iAhqpff7sZkBoP2nk@72.60.200.116:5567/lifelongWMS
NEXT_PUBLIC_APP_NAME=Warehouse Mapping
NEXT_PUBLIC_AUTO_CREATE_SKU=true
NEXT_PUBLIC_AUTO_CREATE_LOCATION=true
NEXT_PUBLIC_APP_URL=https://wmslifelong.cloud
DEFAULT_USER=system
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Application Settings
- **Port:** 3000
- **Health Check Path:** /api/health
- **Health Check Interval:** 30s

### 5. Domain Configuration
- **Domain:** wmslifelong.cloud
- **HTTPS:** Enabled (Let's Encrypt)
- **Force HTTPS:** Yes

### 6. Deploy
Click **"Deploy"** and monitor build logs

## 🔍 Post-Deployment Verification

### Test Health Endpoint
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

### Test Application
Visit: https://wmslifelong.cloud

## 📊 Monitoring

- **Logs:** Coolify Dashboard → Logs tab
- **Metrics:** CPU, Memory, Network in Coolify
- **Health:** Automatic via /api/health endpoint

## 🔄 Updates

Push to main branch → Coolify auto-deploys (if enabled)

Or manually trigger in Coolify dashboard

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Coolify
- Verify all env vars are set

**App won't start?**
- Check container logs
- Verify database connectivity
- Test health endpoint

**Database issues?**
- Verify DATABASE_URL
- Check network access from Coolify

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete guide
