# Digital Ocean Deployment - Environment Variables Fix

## Problem
Admin role not showing in production because `NEXT_PUBLIC_*` environment variables are not embedded during Docker build.

## Solution

### Option 1: Using Docker Build Args (Recommended)

When building your Docker image on Digital Ocean, pass the environment variables as build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_ID="695f46420013c5e5e580" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_NAME="cyclecountFarukhNagar" \
  --build-arg NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID="695f46de00155811c3c3" \
  --build-arg NEXT_PUBLIC_APP_NAME="Warehouse Mapping" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_SKU="true" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_LOCATION="true" \
  -t whmapping:latest .
```

### Option 2: Using Docker Compose

If using docker-compose.yml, ensure your .env file is present and run:

```bash
docker-compose up --build
```

### Option 3: Digital Ocean App Platform

If using Digital Ocean App Platform:

1. Go to your app settings
2. Navigate to "Components" → Your component → "Environment Variables"
3. Add these variables with "Build Time" checkbox enabled:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT` = `https://fra.cloud.appwrite.io/v1`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID` = `695f46420013c5e5e580`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_NAME` = `cyclecountFarukhNagar`
   - `NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID` = `695f46de00155811c3c3`
   - `NEXT_PUBLIC_APP_NAME` = `Warehouse Mapping`
   - `NEXT_PUBLIC_AUTO_CREATE_SKU` = `true`
   - `NEXT_PUBLIC_AUTO_CREATE_LOCATION` = `true`

4. Also add runtime-only variables (without "Build Time" checkbox):
   - `DATABASE_URL` = Your database URL
   - `APPWRITE_API_KEY` = Your API key
   - `DEFAULT_USER` = `system`

5. Redeploy your app

### Option 4: Manual Docker Build on Digital Ocean

SSH into your Digital Ocean droplet and run:

```bash
# Create a .env file with all variables
cat > .env << 'EOF'
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=695f46420013c5e5e580
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=cyclecountFarukhNagar
NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID=695f46de00155811c3c3
NEXT_PUBLIC_APP_NAME=Warehouse Mapping
NEXT_PUBLIC_AUTO_CREATE_SKU=true
NEXT_PUBLIC_AUTO_CREATE_LOCATION=true
DATABASE_URL=your_database_url
APPWRITE_API_KEY=your_api_key
DEFAULT_USER=system
EOF

# Build with build args
docker build \
  --build-arg NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_ID="695f46420013c5e5e580" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_NAME="cyclecountFarukhNagar" \
  --build-arg NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID="695f46de00155811c3c3" \
  --build-arg NEXT_PUBLIC_APP_NAME="Warehouse Mapping" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_SKU="true" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_LOCATION="true" \
  -t whmapping:latest .

# Run with runtime env vars
docker run -d \
  --name whmapping \
  --env-file .env \
  -p 3000:3000 \
  whmapping:latest
```

## Why This Is Necessary

Next.js embeds `NEXT_PUBLIC_*` variables into the JavaScript bundle **at build time**. They are not read at runtime. This means:

1. ❌ Setting environment variables only at runtime won't work
2. ✅ Environment variables must be available during `docker build`
3. ✅ The Dockerfile now accepts build arguments to pass these values

## Verify It's Working

After deployment:

1. Log in to your app
2. Open browser DevTools → Console
3. Run: `console.log(process.env.NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID)`
4. Should see: `"695f46de00155811c3c3"`
5. If it shows `undefined`, the build args weren't passed correctly

## Testing Locally

To test the Docker build locally:

```bash
# Build
docker build \
  --build-arg NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_ID="695f46420013c5e5e580" \
  --build-arg NEXT_PUBLIC_APPWRITE_PROJECT_NAME="cyclecountFarukhNagar" \
  --build-arg NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID="695f46de00155811c3c3" \
  --build-arg NEXT_PUBLIC_APP_NAME="Warehouse Mapping" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_SKU="true" \
  --build-arg NEXT_PUBLIC_AUTO_CREATE_LOCATION="true" \
  -t whmapping:test .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e APPWRITE_API_KEY="your_api_key" \
  whmapping:test
```

Access http://localhost:3000 and check if admin role shows correctly.
