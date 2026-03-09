# RIT Digital Twin - LOCAL & VERCEL DEPLOYMENT GUIDE

**Last Updated:** March 5, 2026

---

## 🔴 ISSUE: "localhost refused to connect" (ERR_CONNECTION_REFUSED)

### ✅ SOLUTION: Verify Development Environment

---

## 📋 PART 1: LOCAL DEPLOYMENT (LOCALHOST:5173 & 8080)

### Step 1️⃣: Ensure Backend is Running

```powershell
# Terminal 1: Navigate to backend
cd backend

# Start backend service
.\run_backend.ps1

# Wait for this message in console:
# "Started RITUniversityERP in X.XXX seconds"
# OR
# "Tomcat started on port(s): 8080"
```

**Verify backend is accessible:**
```
http://localhost:8080/api/actuator/health
# Should return: {"status":"UP"}
```

---

### Step 2️⃣: Clean Frontend Environment

```powershell
# Terminal 2: Navigate to frontend
cd frontend

# Clean node_modules and cache
Remove-Item node_modules -Recurse -Force 2>$null
Remove-Item package-lock.json -Force 2>$null

# Reinstall dependencies
npm install --legacy-peer-deps

# Clear Vite cache
Remove-Item .vite -Recurse -Force 2>$null
Remove-Item dist -Recurse -Force 2>$null
```

---

### Step 3️⃣: Configure Environment

**Create `.env.local` in frontend directory:**
```env
# .env.local - LOCAL DEVELOPMENT ONLY
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WEBSOCKET_URL=http://localhost:8080/ws
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKET=true
VITE_APP_NAME=RIT Digital Twin
NODE_ENV=development
```

**Verify file exists:**
```powershell
Test-Path .\frontend\.env.local
# Should return: True
```

---

### Step 4️⃣: Start Frontend Dev Server

```powershell
# Terminal 2 (in frontend directory)
npm run dev

# Expected output:
#   VITE v5.x.x  build x.x.x
#   ➜  Local:   http://localhost:5173/
#   ➜  press h + enter to show help
```

**⚠️ If port 5173 is busy:**
```powershell
# Find process using port 5173
netstat -ano | findstr "5173"

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Or use different port:
npm run dev -- --port 5174
```

---

### Step 5️⃣: Test Local Deployment

**Open browser:**
```
http://localhost:5173
```

**Login with:**
- Email: `admin@ritchennai.edu.in`
- Password: `admin123`

**Verify connectivity:**
- ✅ Dashboard loads with colored KPI cards
- ✅ Data displays without errors
- ✅ Hamburger menu works on mobile (F12 → Toggle device)

**Check browser console (F12):**
```javascript
// Should NOT show errors like:
// "Failed to fetch from http://localhost:8080/api"
// "ERR_CONNECTION_REFUSED"

// Should show:
// "[API Service] Using API endpoint: http://localhost:8080/api"
// "[WebSocket] Connecting to: http://localhost:8080/ws"
```

---

## 🌐 PART 2: VERCEL FRONTEND + LOCAL BACKEND (TUNNEL)

Use this when your **frontend is deployed on Vercel** and your **backend runs on your machine** (localhost). The browser must reach your backend via a public URL, so we expose localhost with a tunnel.

### Prerequisites
- Backend running locally on port 8080
- MySQL running
- [ngrok](https://ngrok.com/download) (or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) / [localtunnel](https://github.com/localtunnel/localtunnel))

### Step 1: Expose local backend with ngrok

```powershell
# Terminal 1: Start backend (if not already running)
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2: Expose port 8080 (install ngrok first: choco install ngrok / scoop install ngrok)
ngrok http 8080
```

Copy the **HTTPS** URL ngrok shows (e.g. `https://abc123.ngrok-free.app`). You will use:
- **API base:** `https://abc123.ngrok-free.app/api`
- **WebSocket:** `https://abc123.ngrok-free.app/ws`

### Step 2: Allow Vercel in backend CORS

Backend already allows `https://*.vercel.app`. To be explicit, when starting the backend you can set:

```powershell
# Windows PowerShell (before starting backend)
$env:APP_CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,https://*.vercel.app,https://your-project.vercel.app"
cd backend
.\mvnw.cmd spring-boot:run
```

Replace `your-project.vercel.app` with your actual Vercel URL.

### Step 3: Set Vercel environment variables

In **Vercel Dashboard → Your Project → Settings → Environment Variables**, add (use your ngrok URL):

| Name | Value | Environments |
|------|--------|----------------|
| `VITE_API_BASE_URL` | `https://YOUR_NGROK_URL/api` | Production, Preview |
| `VITE_WEBSOCKET_URL` | `https://YOUR_NGROK_URL/ws` | Production, Preview |
| `VITE_ENABLE_WEBSOCKET` | `true` | Production, Preview |

Example (replace with your ngrok host):
- `VITE_API_BASE_URL` = `https://abc123.ngrok-free.app/api`
- `VITE_WEBSOCKET_URL` = `https://abc123.ngrok-free.app/ws`

### Step 4: Redeploy Vercel

After saving env vars, trigger a **Redeploy** (Deployments → ⋮ → Redeploy) so the new API URL is baked into the build.

### Step 5: Use the app

1. Keep **backend** and **ngrok** running on your machine.
2. Open your **Vercel app URL** in the browser.
3. Login with e.g. `admin@ritchennai.edu.in` / `admin123`.

**Note:** Free ngrok URLs change each time you restart ngrok. When the URL changes, update the two Vercel env vars and redeploy.

---

## 🌐 PART 3: VERCEL DEPLOYMENT (FRONTEND + CLOUD BACKEND)

### Prerequisite: Backend Must Be Publicly Accessible

Your Spring Boot backend must be deployed somewhere accessible online:
- ✅ AWS EC2, Azure VM, DigitalOcean, Heroku, Railway, Render, etc.
- ✅ Or local backend exposed via tunnel (see Part 2 above)
- ❌ Plain localhost only (browsers cannot reach your machine’s localhost from the Vercel site)

---

### Step 1️⃣: Set backend URL (or use Part 2 for local backend + tunnel)

Create `.env.production` in frontend root **only if** you build locally for production. For Vercel, set the variables in the **Vercel Dashboard** (Step 3️⃣ below) instead.

```env
# .env.production - VERCEL DEPLOYMENT
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_WEBSOCKET_URL=https://your-backend-domain.com/ws
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKET=true
NODE_ENV=production
```

**Example for common hosts:**

**If backend on AWS:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WEBSOCKET_URL=https://api.yourdomain.com/ws
```

**If backend on Railway:**
```env
VITE_API_BASE_URL=https://your-app-name.up.railway.app/api
VITE_WEBSOCKET_URL=https://your-app-name.up.railway.app/ws
```

**If backend is local (use a tunnel):**  
See **Part 2: Vercel frontend + local backend** above. Use the ngrok (or tunnel) HTTPS URL, not `localhost`.

---

### Step 2️⃣: Configure Backend CORS

**Update backend `application.yml` or environment variables:**

```yaml
app.cors:
  allowed-origins: 
    - http://localhost:5173
    - http://127.0.0.1:5173
    - https://your-vercel-frontend.vercel.app
    - https://*.vercel.app
```

Or set as environment variable:
```env
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-vercel-frontend.vercel.app
```

---

### Step 3️⃣: Update Vercel Environment Variables

**In Vercel Dashboard → Project Settings → Environment Variables:**

| Name | Value | Scope |
|------|-------|-------|
| `VITE_API_BASE_URL` | `https://roguish-christee-cnemial.ngrok-free.dev/api` | Production, Preview |
| `VITE_WEBSOCKET_URL` | `https://roguish-christee-cnemial.ngrok-free.dev/ws` | Production, Preview |
| `VITE_ENABLE_WEBSOCKET` | `true` | Production, Preview |
| `VITE_ENABLE_ANALYTICS` | `true` | Production, Preview |

**Alternative:** set only `VITE_BACKEND_URL=https://roguish-christee-cnemial.ngrok-free.dev` and the app derives `/api` and `/ws`. **Redeploy** after changing env vars.

---

### Step 4️⃣: Build & Deploy to Vercel

**Option A: Automatic Deployment (Recommended)**
```bash
# Push code to GitHub
git add .
git commit -m "feat: configure for Vercel deployment"
git push origin main

# Vercel auto-deploys on push
# Monitor at: https://vercel.com/dashboard
```

**Option B: Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel deploy --prod
```

---

### Step 5️⃣: Verify Vercel Deployment

**Access production:**
```
https://your-project.vercel.app
```

**Check deployment logs:**
1. Go to Vercel Dashboard
2. Click your project
3. View "Deployments" tab
4. Check logs for build errors

**Test in browser:**
```javascript
// Open F12 → Console
// Should show:
// "[API Service] Using API endpoint: https://your-backend.com/api"

// NOT:
// "[API Service] Using API endpoint: http://localhost:8080/api"
```

---

## 🔧 TROUBLESHOOTING

### Issue: "localhost refused to connect" (Local)

**Root Cause:** Frontend dev server not running

**Fix:**
```powershell
# Terminal 1: Verify backend running
curl http://localhost:8080/api/actuator/health

# Terminal 2: Kill any Vite processes
Get-Process node | Stop-Process -Force

# Clean start
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

### Issue: CORS Error (Vercel → Backend)

**Error Message:**
```
Access to XMLHttpRequest at 'https://api.example.com/api/...' 
from origin 'https://your-project.vercel.app' has been blocked by CORS policy
```

**Fix:** Update backend CORS configuration

**backend/src/main/java/com/university/erp/config/SecurityConfig.java:**
```java
configuration.setAllowedOriginPatterns(
    List.of(
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://your-project.vercel.app",  // ADD THIS LINE
        "https://*.vercel.app"
    )
);
```

Or via environment variable:
```bash
export APP_CORS_ALLOWED_ORIGINS="http://localhost:5173,https://your-project.vercel.app,https://*.vercel.app"
```

Restart backend after changes.

---

### Issue: WebSocket Connection Failed

**Vercel Console Error:**
```
[WebSocket] WebSocket error: WebSocketError: Failed to fetch
```

**Causes & Fixes:**

1. **Backend WebSocket not exposed:**
   - Ensure `/ws` endpoint is externally accessible
   - Check firewall rules

2. **CORS not allowing WebSocket:**
   - WebSocket follows same CORS rules as HTTP
   - Update `SecurityConfig.java` with Vercel domain

3. **HTTPS mismatch:**
   - Vercel is HTTPS, but backend is HTTP
   - Backend MUST be HTTPS in production

---

### Issue: Build Fails on Vercel

**Check Vercel build logs for:**

1. **Missing environment variables**
   ```
   Error: VITE_API_BASE_URL is not defined
   ```
   → Add to Vercel Environment Variables

2. **Node version mismatch**
   ```
   npm ERR! requires node 16+ and npm 7+
   ```
   → Specify Node version in Vercel:
   - Project Settings → Function Settings → Node.js Version

3. **Package dependency issues**
   ```
   npm ERR! peer dep missing
   ```
   → Run locally first:
   ```powershell
   npm install --legacy-peer-deps
   npm run build
   ```

---

## ✅ VERIFICATION CHECKLIST

### Local Development
- [ ] Backend running on port 8080
- [ ] Frontend dev server on port 5173
- [ ] `.env.local` file exists with correct values
- [ ] Can login at http://localhost:5173
- [ ] API calls show in Network tab
- [ ] No CORS errors in console
- [ ] Hamburger menu works on mobile view
- [ ] Dashboard cards render with colors

### Vercel Production
- [ ] Backend deployed externally (HTTPS)
- [ ] Environment variables set in Vercel
- [ ] Backend CORS allows Vercel domain
- [ ] Build succeeds (check deployment logs)
- [ ] Can access https://your-project.vercel.app
- [ ] F12 Console shows correct API endpoint
- [ ] API calls work (check Network tab)
- [ ] No mixed HTTP/HTTPS warnings
- [ ] WebSocket connects (optional, but recommended for real-time)

---

## 🚀 QUICK COMMAND REFERENCE

### Start Everything (Local)
```powershell
# Terminal 1: Backend
cd backend && .\run_backend.ps1

# Terminal 2: Frontend
cd frontend && npm run dev

# Browser
Start-Process "http://localhost:5173"
```

### Clean & Reset (If Issues)
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Clean frontend
cd frontend
Remove-Item node_modules -Recurse -Force
Remove-Item .vite -Recurse -Force
npm install --legacy-peer-deps

# Start fresh
npm run dev
```

### Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "Ready for Vercel"
git push origin main

# Or manual deploy
cd frontend
vercel deploy --prod
```

---

## 📧 Environment Variable Examples

### For Docker (Production)
```bash
docker run -e VITE_API_BASE_URL=https://api.example.com/api \
           -e VITE_WEBSOCKET_URL=https://api.example.com/ws \
           your-frontend-image
```

### For Railway/Heroku
```bash
deployctl set VITE_API_BASE_URL=https://your-backend.railway.app/api
deployctl set VITE_WEBSOCKET_URL=https://your-backend.railway.app/ws
```

### For GitHub Secrets (CI/CD)
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Vercel
  env:
    VITE_API_BASE_URL: ${{ secrets.VERCEL_API_URL }}
    VITE_WEBSOCKET_URL: ${{ secrets.VERCEL_WS_URL }}
  run: vercel deploy --prod
```

---

## 🎯 FINAL CHECKLIST

**Before going live on Vercel:**

1. ✅ Backend is publicly accessible (HTTPS)
2. ✅ Environment files properly configured
3. ✅ CORS updated in backend for Vercel domain
4. ✅ Env variables set in Vercel dashboard
5. ✅ Local build succeeds: `npm run build`
6. ✅ No console errors in browser F12
7. ✅ API calls return correct data
8. ✅ Mobile responsive (test in F12 device emulation)
9. ✅ Login works with test credentials
10. ✅ All modules accessible (dashboards, transport, analytics)

---

**Once all items are checked, your system is production-ready! 🚀**
