# Connect Vercel Frontend to Your Backend

When the login page shows **OFFLINE**, the frontend cannot reach your backend. Do the following.

## 1. Set environment variables in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **RIT-Digital-Twin** project.
2. Go to **Settings** → **Environment Variables**.
3. Add these (use your actual backend URL; example uses ngrok):

   | Name | Value | Environments |
   |------|--------|--------------|
   | `VITE_API_BASE_URL` | `https://roguish-christee-cnemial.ngrok-free.dev/api` | Production, Preview |
   | `VITE_WEBSOCKET_URL` | `https://roguish-christee-cnemial.ngrok-free.dev/ws` | Production, Preview |
   | `VITE_ENABLE_WEBSOCKET` | `true` | Production, Preview |

   **If your backend URL is different**, replace `https://roguish-christee-cnemial.ngrok-free.dev` with your URL (no trailing slash).

4. Save.

## 2. Redeploy

- Go to **Deployments** → open the **⋮** menu on the latest deployment → **Redeploy**.
- Wait for the build to finish. The new build will use the env vars above.

## 3. Run your backend (and ngrok if local)

- **If the backend runs on your machine:** start it, then run `ngrok http 8080` and use the **HTTPS** ngrok URL in step 1. Keep both running while using the Vercel site.
- **If the backend is hosted** (e.g. Railway, Render): ensure it’s running and use its HTTPS URL in step 1.

## 4. Check

- Open your Vercel app URL. The login page should show **ONLINE** and login should work.

## Root directory (monorepo)

If your repo has both `frontend` and `backend`:

- In Vercel → **Settings** → **General** → **Root Directory**, set to **`frontend`** (or leave empty if the project was imported from the `frontend` folder).
