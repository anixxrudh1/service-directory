# Render Deployment Troubleshooting Guide

## Error: "Couldn't find a package.json file in /opt/render/project/src"

This error occurs when Render cannot locate the `package.json` file in the expected location.

### Root Causes & Solutions

#### 1. **Incorrect rootDir in render.yaml**

**Problem:**
- The `rootDir` path is incorrect or incomplete
- Render cannot find the nested directories with spaces

**Solution:**
Ensure `render.yaml` has the EXACT paths with proper quoting:

```yaml
services:
  - type: web
    name: servicedir-backend
    runtime: node
    rootDir: "servicedir-backend copy/servicedir-backend copy"
    buildCommand: "npm ci --omit=dev"
    startCommand: "npm start"
    
  - type: static
    name: servicedir-frontend
    rootDir: "service-directory copy/service-directory copy"
    buildCommand: "npm ci && npm run build"
    staticPublishPath: dist
```

**Key Points:**
- Use quotes for paths with spaces: `"servicedir-backend copy/servicedir-backend copy"`
- rootDir is relative to repository root
- Each service has its own rootDir pointing to its package.json directory

#### 2. **Using Manual UI Setup (Recommended)**

If `render.yaml` still causes issues, deploy services manually via Render UI:

**For Backend Web Service:**
1. Go to Render Dashboard → New → Web Service
2. Select your GitHub repository
3. Fill in:
   - **Name:** servicedir-backend
   - **Environment:** Node
   - **Region:** Your choice
   - **Branch:** main
   - **Build Command:** `npm ci --omit=dev`
   - **Start Command:** `npm start`
4. Under **Root Directory:** Enter exactly: `servicedir-backend copy/servicedir-backend copy`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_uri
   STRIPE_SECRET_KEY=your_stripe_key
   ```
6. Click Deploy

**For Frontend Static Site:**
1. Go to Render Dashboard → New → Static Site
2. Select your GitHub repository
3. Fill in:
   - **Name:** servicedir-frontend
   - **Branch:** main
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** dist
4. Under **Root Directory:** Enter exactly: `service-directory copy/service-directory copy`
5. Click Deploy

#### 3. **Verify Directory Structure**

Your repository should look like:
```
repository/
├── .git/
├── .gitignore
├── package.json (root)
├── render.yaml
├── Procfile
├── servicedir-backend copy/
│   ├── servicedir-backend copy/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   ├── package.json        ← This must exist
│   │   └── .env.example
│   └── __MACOSX/
└── service-directory copy/
    ├── service-directory copy/
    │   ├── src/
    │   ├── vite.config.js
    │   ├── package.json        ← This must exist
    │   └── .env.example
    └── __MACOSX/
```

#### 4. **Check package.json Permissions**

Ensure package.json files are not ignored:

In `.gitignore`, make sure you don't have:
```
# DON'T add this:
package.json
package-lock.json
```

These should be committed to git.

#### 5. **Verify from CLI**

If using Render CLI, verify path:
```bash
# From repository root, these commands should work:
cat "servicedir-backend copy/servicedir-backend copy/package.json"
cat "service-directory copy/service-directory copy/package.json"
```

#### 6. **Alternative: Use Environment-Based Route**

If directories with spaces cause persistent issues, set build via environment:

Add to render.yaml:
```yaml
envVars:
  - key: RENDER_SERVICE_TYPE
    value: web  # or "static"
```

Then use `render-build.sh` which handles the routing.

---

## Alternative Solutions

### Option A: Rename Directories (Best)
Remove spaces from directory names:
- `servicedir-backend copy` → `servicedir-backend`
- `service-directory copy` → `service-directory`

Then update render.yaml paths accordingly.

### Option B: Create Symlinks
Create symbolic links at root level:
```bash
ln -s "servicedir-backend copy/servicedir-backend copy" backend
ln -s "service-directory copy/service-directory copy" frontend
```

Then update render.yaml:
```yaml
rootDir: backend  # for web service
rootDir: frontend # for static site
```

### Option C: Use Container Deployment
Use Render's Docker support with a custom Dockerfile that handles the complex paths.

---

## Debugging Steps

1. **Check render.yaml syntax:**
   ```bash
   yamllint render.yaml
   ```

2. **Verify paths locally:**
   ```bash
   ls -la "servicedir-backend copy/servicedir-backend copy/package.json"
   ls -la "service-directory copy/service-directory copy/package.json"
   ```

3. **Check Render logs:**
   - Go to your service dashboard
   - Click "Logs"
   - Look for the exact error message
   - Note the path Render was looking in

4. **Test build locally:**
   ```bash
   npm ci --omit=dev  # From backend directory
   npm ci && npm run build  # From frontend directory
   ```

---

## Final Checklist

- [ ] `render.yaml` exists in repository root
- [ ] Services defined with correct runtime (node, static)
- [ ] `rootDir` paths are quoted and use spaces: `"servicedir-backend copy/servicedir-backend copy"`
- [ ] `buildCommand` and `startCommand` are correct
- [ ] `package.json` files exist in specified rootDir paths
- [ ] `package.json` files are committed to git
- [ ] `.gitignore` doesn't exclude package.json
- [ ] Environment variables are set in Render dashboard
- [ ] Render webhook is configured for automatic deploys

---

## Support

If issues persist:
1. Try manual UI setup instead of render.yaml
2. Contact Render support with your render.yaml and error logs
3. Consider renaming directories to remove spaces
