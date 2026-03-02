# Vercel Deployment Guide - Frontend and Backend Integration

## Overview
This guide explains how to deploy the RIT Digital Twin frontend on Vercel while connecting it to a backend server (local or deployed).

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       Vercel (Frontend)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Application (digital-twin-lemon.vercel.app)  │   │
│  │                                                      │   │
│  │  Client Request: GET /api/auth/login                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Vercel Rewrite Rule (vercel.json)           │   │
│  │  /api/:path* → BACKEND_API_URL/api/:path*           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend Server (Local or Remote)                │
│                                                             │
│  • Local: http://localhost:8080                            │
│  • Render: https://rit-digital-twin.onrender.com           │
│  • Any other Java Spring Boot server                       │
└─────────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. Local Development
No additional setup needed. The Vite development server proxies requests to `http://localhost:8080`.

```bash
# Terminal 1: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

### 2. Vercel Production Deployment

#### Step 2.1: Deploy Backend (if not already deployed)
Deploy your Spring Boot backend to a service like:
- **Render.com** (recommended for free tier)
- **Railway.app**
- **AWS EC2**
- **Google Cloud Run**
- **Azure App Service**

Note the deployment URL: `https://your-backend-url.onrender.com`

#### Step 2.2: Set Vercel Environment Variables
Go to your Vercel project settings at https://vercel.com/dashboard and add:

**Environment Variable Name:** `BACKEND_API_URL`
**Value:** `https://your-backend-url.onrender.com` (without trailing slash)

Example:
```
BACKEND_API_URL=https://rit-digital-twin.onrender.com
```

#### Step 2.3: Update Backend CORS Configuration
Ensure your backend allows requests from your Vercel domain. Edit `backend/src/main/resources/application.yml`:

```yaml
app.cors:
  allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:https://your-vercel-domain.vercel.app,https://*.vercel.app}
```

Or set the environment variable in your backend deployment:
- **Render:** Add to Environment Variables
- **Railway:** Add to Environment Variables
- **Other services:** Follow their documentation

#### Step 2.4: Update vercel.json
The `vercel.json` is already configured with the rewrite rule:

```json
{
    "buildCommand": "npm run build",
    "outputDirectory": "frontend/dist",
    "env": {
        "VITE_API_BASE_URL": "/api"
    },
    "rewrites": [
        {
            "source": "/api/:path*",
            "destination": "${BACKEND_API_URL}/api/:path*"
        },
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

### 3. API Request Flow

#### Development (Local)
```
Browser: http://localhost:5173
  ↓
JavaScript: axios.get('/api/auth/login')
  ↓
Vite Proxy (port 5173 → 8080)
  ↓
Backend: http://localhost:8080/api/auth/login
```

#### Production (Vercel)
```
Browser: https://your-app.vercel.app
  ↓
JavaScript: axios.get('/api/auth/login')
  ↓
Vercel Rewrite (vercel.json)
  ↓
Backend: https://your-backend-url.onrender.com/api/auth/login
```

## Frontend Configuration

The frontend uses `src/services/api.js` to configure axios:

```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({
  baseURL: API_URL
});
```

This means:
- **Development:** `/api` → proxied to `http://localhost:8080` via vite.config.js
- **Production:** `/api` → rewritten by vercel.json to backend URL

## Environment Files

- `.env.development`: Used by `npm run dev` (local frontend)
- `.env.production`: Used by `npm run build` (production frontend)
- `.env.example`: Template for environment variables

## Troubleshooting

### 1. CORS Errors
**Error:** `Access to XMLHttpRequest at 'https://backend-url.onrender.com' from origin 'https://your-app.vercel.app' has been blocked by CORS policy`

**Solution:**
- Check backend's `app.cors.allowed-origins` includes your Vercel URL
- Ensure CORS configuration in `SecurityConfig.java` is correct
- Verify `vercel.json` is using the correct `BACKEND_API_URL` environment variable

### 2. 404 on API Calls
**Error:** `POST /api/auth/login 404`

**Solution:**
- Verify `BACKEND_API_URL` environment variable is set in Vercel dashboard
- Check that backend server is running and has `/api/auth/login` endpoint
- Verify `vercel.json` rewrite rules are correct

### 3. Connection Timeout
**Error:** `timeout of Xs exceeded` or `Network Error`

**Solution:**
- Ensure backend server is running and accessible
- Check backend logs for errors
- Verify network connectivity
- Check firewall rules if backend is on-premise

### 4. Login Not Working
**Error:** Credentials not recognized after login attempt

**Solution:**
- Check browser console for API errors
- Verify JWT token is being returned in auth response
- Check backend logs for authentication errors
- Ensure database is seeded with test users

## Vercel Deployment Command

Simply push your code to GitHub and Vercel will automatically:
1. Build the frontend (`npm run build`)
2. Deploy to Vercel's CDN
3. Apply rewrite rules from `vercel.json`
4. Use environment variables (including `BACKEND_API_URL`)

No additional manual deployment steps needed!

## Testing the Connection

### 1. Local Development Test
```bash
# Terminal 1: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Open http://localhost:5173 and test login
```

### 2. Production Test
```bash
# After deploying to Vercel, open your app
https://your-app.vercel.app

# Open browser console (F12)
# Try login and check Network tab for API calls
# Should see requests to /api/auth/login
# These should be rewritten to https://backend-url/api/auth/login
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Rewrites](https://vercel.com/docs/edge-network/rewrites-and-redirects)
- [Spring Boot CORS Configuration](https://spring.io/guides/gs/rest-service-cors/)
- [Vite Proxy Documentation](https://vitejs.dev/config/server-options.html#server-proxy)
