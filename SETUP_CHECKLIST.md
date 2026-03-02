# Frontend-Backend Connection Checklist ✅

## Current Status
✅ **Frontend:** Deployed on Vercel  
✅ **Backend:** Ready for deployment  
✅ **Configuration:** Set up for production connection  

## What Has Been Done

### 1. **Configuration Updates** ✅
- ✅ Updated `vercel.json` with dynamic `BACKEND_API_URL` environment variable
- ✅ Created `frontend/.env.development` for local development
- ✅ Updated `frontend/.env.production` to use Vercel rewrite rules
- ✅ Updated backend CORS configuration to allow Vercel domains
- ✅ Updated `.env.example` with clear documentation

### 2. **Documentation Created** ✅
- ✅ `FRONTEND_BACKEND_SETUP.md` - Quick start guide for Vercel integration
- ✅ `VERCEL_DEPLOYMENT.md` - Comprehensive architecture and troubleshooting
- ✅ Updated `README.md` with links to deployment guides

### 3. **Code Changes** ✅
- ✅ No breaking changes to frontend or backend code
- ✅ Fixed all compilation errors (earlier)
- ✅ CORS properly configured for both local and production environments

## Your Next Steps

### For Production (Vercel) Setup

#### Step 1: Deploy Backend
Choose one:
- [ ] **[Render.com](https://render.com)** (Recommended - Free)
  - Push backend code to GitHub
  - Connect to Render
  - Set environment variables from `.env.example`
  - Note the deployment URL

- [ ] **[Railway.app](https://railway.app)**
  - Similar setup to Render

- [ ] **Keep Backend Locally**
  - Ensure backend is running at `http://localhost:8080`

#### Step 2: Configure Vercel
1. [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. [ ] Select your project
3. [ ] Go to **Settings** → **Environment Variables**
4. [ ] Add environment variable:
   ```
   Name: BACKEND_API_URL
   Value: [Your backend URL - e.g., https://rit-digital-twin.onrender.com]
   Environment: Production
   ```
5. [ ] Redeploy the project (or wait for auto-redeploy)

#### Step 3: Configure Backend CORS
If using a hosted backend, add environment variable:
```
APP_CORS_ALLOWED_ORIGINS=https://[your-vercel-domain].vercel.app,https://*.vercel.app
```

#### Step 4: Test the Connection
1. [ ] Open your Vercel app: `https://[your-app].vercel.app`
2. [ ] Open browser DevTools (F12)
3. [ ] Go to Network tab
4. [ ] Try logging in
5. [ ] Verify API calls are successful (status 200)
6. [ ] Check that login works without errors

### For Local Development

#### Terminal 1: Start Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend will be at http://localhost:8080
```

#### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend will be at http://localhost:5173
# API calls will be proxied to http://localhost:8080 via Vite
```

## How It Works

### Local Development Flow
```
Frontend (localhost:5173)
  → Vite Proxy (configured in vite.config.js)
  → Backend (localhost:8080)
```

### Production (Vercel) Flow
```
Frontend (vercel.app)
  → Request to /api/...
  → Vercel Rewrite Rule (vercel.json)
  → Backend (onrender.com or your URL)
```

## Environment Variables Summary

### Vercel Environment Variables (Dashboard)
```
BACKEND_API_URL = https://your-backend-url-here
```

### Backend Environment Variables (Render/Manual)
```
SPRING_DATASOURCE_URL = your_database_url
SPRING_DATASOURCE_USERNAME = your_db_user
SPRING_DATASOURCE_PASSWORD = your_db_password
JWT_SECRET = your_long_secure_key
APP_CORS_ALLOWED_ORIGINS = https://your-vercel-app.vercel.app,https://*.vercel.app
SPRING_PROFILES_ACTIVE = prod
```

## Files Modified

| File | Purpose | Change |
|------|---------|--------|
| `vercel.json` | Vercel config | Added dynamic `BACKEND_API_URL` variable |
| `frontend/.env.production` | Prod env vars | Uses `/api` with Vercel rewrites |
| `frontend/.env.development` | Dev env vars | Uses `/api` with Vite proxy |
| `.env.example` | Template | Added backend URL documentation |
| `backend/src/main/resources/application.yml` | CORS config | Added more Vercel domains |
| `README.md` | Documentation | Added deployment guide links |
| `FRONTEND_BACKEND_SETUP.md` | **NEW** | Quick start guide |
| `VERCEL_DEPLOYMENT.md` | **NEW** | Detailed guide with troubleshooting |

## Troubleshooting Quick Links

See `VERCEL_DEPLOYMENT.md` for:
- [ ] CORS Error solutions
- [ ] 404 on API calls solutions
- [ ] Connection timeout solutions
- [ ] Blank page / 500 error solutions

## Support Resources

1. **Quick Start:** `FRONTEND_BACKEND_SETUP.md`
2. **Detailed Guide:** `VERCEL_DEPLOYMENT.md`
3. **Vercel Docs:** https://vercel.com/docs
4. **Spring Boot CORS:** https://spring.io/guides/gs/rest-service-cors/

## Need To Verify?

Run these checks:

### Local Test
```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2
cd frontend && npm run dev

# Browser: http://localhost:5173
# Try login → Check Network tab in DevTools
# All API calls should succeed with status 200
```

### Production Test (After Vercel Deploy)
```
Browser: https://your-app.vercel.app
Try login → Check Network tab in DevTools
All API calls should make it to /api/... endpoints
Final request should reach your backend URL
```

---

## Summary
Your application is now fully configured for frontend-backend communication! 🎉

- ✅ Local development works with Vite proxy
- ✅ Production (Vercel) works with rewrite rules
- ✅ CORS is properly configured
- ✅ All code is committed and pushed

Next: Deploy backend and set Vercel environment variables!
