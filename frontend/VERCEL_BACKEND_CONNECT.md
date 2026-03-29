# Connect Vercel Frontend to Your Backend

When the login page shows **OFFLINE**, the frontend cannot reach your backend. Use either **local backend** or **public backend** (ngrok/hosted).

---

## Option A: Vercel frontend + local backend

Use this when the frontend is on Vercel and the backend runs on **your machine** (e.g. `.\run_backend.ps1`).  
**Note:** Only the browser on the same machine as the backend will work (the app calls `localhost` from the browser).

### 1. Environment variables in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **RIT-Digital-Twin** project.
2. Go to **Settings** → **Environment Variables**.
3. Add:

   | Name | Value | Environments |
   |------|--------|--------------|
   | `VITE_API_BASE_URL` | `http://localhost:8080/api` | Production, Preview |
   | `VITE_WEBSOCKET_URL` | `http://localhost:8080/ws` | Production, Preview |
   | `VITE_ENABLE_WEBSOCKET` | `true` | Production, Preview |

4. Save.

### 2. Backend CORS (local run)

Your local backend must allow the Vercel origin. In the project root `.env` (used by `run_backend.ps1`) ensure you have:

```env
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://*.vercel.app
```

(The backend `application.yml` default already includes `https://*.vercel.app`; the line above keeps localhost and Vercel explicit.)

### 3. Redeploy and run

- In Vercel: **Deployments** → **⋮** on latest → **Redeploy**.
- On your machine: start the backend (e.g. `.\run_backend.ps1`).
- Open your **Vercel app URL** in the same machine’s browser. Login should show **ONLINE** and work.

---

### Option B: Vercel frontend + public backend (ngrok or hosted)
6: 
Use this when the backend is reachable via a public URL (ngrok, Render, etc.).

### 1. Environment variables in Vercel

Add these (replace with your backend URL, no trailing slash):

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_API_BASE_URL` | `https://your-backend-url/api` | Production, Preview |
| `VITE_WEBSOCKET_URL` | `https://your-backend-url/ws` | Production, Preview |
| `VITE_ENABLE_WEBSOCKET` | `true` | Production, Preview |

Example with ngrok: `https://roguish-christee-cnemial.ngrok-free.dev` → `/api` and `/ws` as above.

### 2. Redeploy

- **Deployments** → **⋮** → **Redeploy** so the build picks up the new env vars.

### 3. Run backend (and ngrok if local)

- **Local backend:** run it, then `ngrok http 8080` and use the HTTPS ngrok URL in step 1.
- **Hosted backend:** ensure it’s running and use its HTTPS URL in step 1.

### 4. Check

- Open your Vercel app URL. Login page should show **ONLINE**.

---

## Root directory (monorepo)

If the repo has both `frontend` and `backend`:

- In Vercel → **Settings** → **General** → **Root Directory**, set to **`frontend`** (or leave empty if the project was imported from the `frontend` folder).
