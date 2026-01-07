# Troubleshooting Guide

## HMR Errors: PWA Service Worker and AuthJS

If you're seeing errors like:
- `[PWA] Service Worker registered`
- `ClientFetchError` from AuthJS
- `unrecognized HMR message`

These are likely caused by **cached data from previous projects** in your browser.

### Solution: Clear Browser Cache

#### Method 1: Hard Refresh (Quick)
1. Open http://localhost:3000 in your browser
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. This forces a hard reload without cache

#### Method 2: Clear Site Data (Recommended)
1. Open Chrome DevTools (`F12`)
2. Go to **Application** tab
3. In the left sidebar, click **Storage**
4. Click **Clear site data** button
5. Refresh the page (`Ctrl + R`)

#### Method 3: Unregister Service Workers
1. Open Chrome DevTools (`F12`)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Find any registered service workers
5. Click **Unregister** for each one
6. Refresh the page

#### Method 4: Incognito Mode (Test)
1. Open an Incognito/Private window
2. Navigate to http://localhost:3000
3. Check if errors persist

### Why This Happens
- Previous Next.js projects may have registered Service Workers
- Browser caches can retain old configurations
- Multiple projects running on localhost:3000 can cause conflicts

### If Errors Persist After Clearing Cache

Check for global browser extensions that might interfere:
- PWA/Service Worker extensions
- Authentication extensions
- Development tools extensions

Try disabling extensions temporarily to test.

## Multiple Lockfiles Warning

The warning about multiple lockfiles is not critical. To silence it:

1. Add to `next.config.mjs`:
```javascript
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // ... rest of config
};
```

2. Or remove the lockfile at `C:\Users\RintuMondal\package-lock.json` if it's not needed.

## App Should Work Despite Warnings

The app should still work correctly even with these console warnings. If you can access http://localhost:3000 and use the features (Putaway, Lookup, Move), the errors are cosmetic and related to browser cache, not the application code.
