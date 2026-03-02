# Vercel and Backend Integration Setup

## Quick Start - Connecting Your Vercel Frontend to Backend

### Prerequisites
- Frontend deployed on Vercel
- Backend deployed (Render, Railway, AWS, Google Cloud, or local machine)
- GitHub account with your code repository

### Step 1: Deploy Backend (if not already done)

Choose one of these services:

#### Option A: Render.com (Recommended - Free Tier Available)
1. Go to [render.com](https://render.com)
2. Create account and sign in
3. Click "New" → "Web Service"
4. Connect your GitHub repository containing the backend
5. Configure:
   - **Build Command:** `./mvnw clean package`
   - **Start Command:** `java -jar target/rit-university-erp-*.jar`
   - **Environment Variables:** Add all from `.env.example`
6. Deploy and note the URL (e.g., `https://rit-digital-twin.onrender.com`)

#### Option B: Local Machine (For Development)
```bash
# Ensure MySQL is running
# Terminal 1: Start Backend
cd backend
./mvnw spring-boot:run

# Backend will be at http://localhost:8080
```

### Step 2: Configure Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   ```
   Name: BACKEND_API_URL
   Value: https://rit-digital-twin.onrender.com
   (or http://localhost:8080 if running locally)
   ```
5. Make sure it's set for **Production** environment

### Step 3: Update Backend CORS Configuration

**For Render Deployment:**
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add:
   ```
   APP_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://*.vercel.app
   ```

OR

Update `backend/src/main/resources/application.yml` in your code:
```yaml
app.cors:
  allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:https://your-vercel-domain.vercel.app,https://*.vercel.app}
```

### Step 4: Verify Frontend Configuration

The following files are already configured:

**`frontend/.env.production`**
```
VITE_API_BASE_URL=/api
```

**`vercel.json`**
```json
{
    "rewrites": [
        {
            "source": "/api/:path*",
            "destination": "${BACKEND_API_URL}/api/:path*"
        }
    ]
}
```

**`frontend/src/services/api.js`**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

These are already set up correctly! ✅

### Step 5: Test the Connection

#### Test on Vercel
1. Go to your Vercel app: `https://your-app.vercel.app`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try logging in
5. You should see API requests to `/api/auth/login`
6. Check that the requests succeed (200 status)

#### Test Locally
```bash
# Terminal 1: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173
# Try logging in - should work without any CORS errors
```

### Troubleshooting

#### Issue 1: CORS Error in Browser
**Error Message:**
```
Access to XMLHttpRequest at 'https://backend-url' from origin 'https://your-app.vercel.app' 
has been blocked by CORS policy
```

**Solution:**
1. Check backend's `APP_CORS_ALLOWED_ORIGINS` includes your Vercel domain
2. Verify Vercel environment variable `BACKEND_API_URL` is set correctly
3. Redeploy backend after changing CORS configuration

#### Issue 2: 404 on API Calls
**Error:** `POST /api/auth/login 404`

**Solution:**
1. Verify backend URL is correct (no trailing slash)
2. Check backend is running: `curl https://your-backend-url/api/auth/login`
3. Verify `BACKEND_API_URL` environment variable in Vercel

#### Issue 3: Timeout/Connection Refused
**Error:** `Network Error: connect ECONNREFUSED`

**Solution:**
1. Ensure backend is running and accessible
2. Check firewall rules if backend is on-premise
3. Verify backend URL in logs: `vercel logs`

#### Issue 4: Blank Page / 500 Error
**Solution:**
1. Check Vercel deployment logs: `vercel logs`
2. Check browser console for JavaScript errors
3. Ensure build succeeded: `npm run build` locally

### Recommended Vercel Environment Variables

```
# Backend URL (REQUIRED for production)
BACKEND_API_URL=https://rit-digital-twin.onrender.com

# Frontend API Base URL
VITE_API_BASE_URL=/api

# (Optional) Analytics or other services
```

### Recommended Backend Environment Variables (Render/Other Services)

```
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/rit_digital_twin
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-very-long-secure-key-min-32-characters
APP_JWT_EXPIRATION_MS=86400000

# CORS
APP_CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://*.vercel.app

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### API Request Flow (Production)

```
Your Browser
    ↓
HTTPS Request to: https://your-app.vercel.app/api/auth/login
    ↓
Vercel Edge Network
    ↓
Rewrite Rule (vercel.json):
/api/auth/login → https://rit-digital-twin.onrender.com/api/auth/login
    ↓
Backend Spring Boot Server
    ↓
Verifies CORS Origin
✓ Checks if origin is in APP_CORS_ALLOWED_ORIGINS
✓ Returns response with CORS headers
    ↓
HTTPS Response back to your browser
```

### Files to Check/Update

- ✅ `vercel.json` - Rewrite rules (already configured)
- ✅ `frontend/.env.production` - Production variables (already configured)
- ✅ `frontend/src/services/api.js` - API configuration (already configured)
- ✅ `backend/src/main/resources/application.yml` - Backend CORS (needs your domain)
- ⚠️ Vercel Environment Variables - Add `BACKEND_API_URL`
- ⚠️ Backend Environment Variables - Add `APP_CORS_ALLOWED_ORIGINS`

## Need More Help?

See `VERCEL_DEPLOYMENT.md` for detailed architecture and troubleshooting guides.
