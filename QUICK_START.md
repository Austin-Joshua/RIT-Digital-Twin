# RIT Digital Twin - Quick Start Guide (2026 Edition)

## 📋 System Compatibility

- **OS:** Windows, macOS, Linux
- **Backend:** Java 25, Spring Boot 3.2
- **Frontend:** Node.js 24+, React 19, Vite 7
- **Database:** MySQL 8.0+

---

## 🚀 LOCAL DEVELOPMENT (5 Minutes)

### 1️⃣ Start MySQL
```powershell
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 2️⃣ Start Backend
```powershell
cd backend
.\run_backend.ps1
```
✅ **Wait until:** `Started rit-university-erp in X.XXX seconds`

### 3️⃣ Start Frontend (New Terminal)
```powershell
cd frontend
.\run_frontend.ps1
```
✅ **Open browser:** http://localhost:5173

### 4️⃣ Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ritchennai.edu.in | admin123 |
| Faculty | faculty@ritchennai.edu.in | faculty123 |
| Student | student@ritchennai.edu.in | student123 |

---

## 📱 Testing Responsive Design

**Desktop** (Default)
- 4-column KPI grid
- Full sidebar
- All details visible

**Tablet** (768px - 1024px)
- Press F12 → Toggle Device Toolbar
- Select "iPad" preset
- 2-column KPI grid
- Sidebar toggles with hamburger

**Mobile** (< 768px)
- Press F12 → Toggle Device Toolbar
- Select "iPhone 12" preset
- 2-column KPI grid
- Hamburger menu visible
- No horizontal scroll

---

## 🌐 VERCEL FRONTEND + LOCAL BACKEND

To use your **deployed Vercel frontend** with your **local backend**:

1. **Expose local backend** with a tunnel (e.g. [ngrok](https://ngrok.com/download)):
   ```powershell
   # Start backend, then in another terminal:
   ngrok http 8080
   ```
   Copy the **HTTPS** URL (e.g. `https://abc123.ngrok-free.app`).

2. **Vercel env vars** (Dashboard → Project → Settings → Environment Variables):
   - `VITE_API_BASE_URL` = `https://YOUR_NGROK_URL/api`
   - `VITE_WEBSOCKET_URL` = `https://YOUR_NGROK_URL/ws`
   - `VITE_ENABLE_WEBSOCKET` = `true`

3. **Redeploy** the Vercel project so the new URL is used.

4. **Backend CORS** already allows `https://*.vercel.app`. To allow your exact Vercel URL as well, when starting the backend:
   ```powershell
   $env:APP_CORS_ALLOWED_ORIGINS = "http://localhost:5173,https://*.vercel.app,https://YOUR_VERCEL_APP.vercel.app"
   ```

Full steps and troubleshooting: see **DEPLOYMENT_GUIDE.md** (Part 2: Vercel + local backend).

---

## 🎨 NEW FEATURES IMPLEMENTED

### ✅ 12+ Unique Dashboard Colors
- Green, Blue, Teal, Purple, Red, Orange
- Yellow, Indigo, Cyan, Lime, Pink, Deep Orange
- Each with perfect WCAG AAA contrast

### ✅ Fully Responsive Design
- Desktop: 4-column grid
- Tablet: 2-column responsive
- Mobile: 2-column optimized with hamburger menu

### ✅ Mobile-First Navigation
- Hamburger icon on mobile < 1024px
- Smooth slide-in sidebar
- Full-height overlay without scroll issues

### ✅ Vercel Integration Ready
- Environment variables properly configured
- CORS allows Vercel domains
- WebSocket supports remote connections

---

## ☁️ Verifying Aiven Database (MySQL in Aiven)

To confirm your database is stored and reachable on **Aiven**:

### 1. Use Aiven connection in `.env`

Set these in your project `.env` (get values from [Aiven Console](https://console.aiven.io) → your MySQL service → **Connection information**):

```env
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/<database>?ssl-mode=REQUIRED
SPRING_DATASOURCE_USERNAME=<service_username>
SPRING_DATASOURCE_PASSWORD=<service_password>
SPRING_PROFILES_ACTIVE=prod
```

Use the **JDBC/URI** or host, port, and database name from Aiven. Enable SSL as Aiven requires it.

### 2. Check from the backend

1. Start the backend with the Aiven `.env` (or export those variables).
2. Open: **http://localhost:8080/actuator/health**
3. If the database is reachable, you should see something like `"status":"UP"` and often a `db` entry with status UP.

If the backend fails to start or health shows DOWN, the app is not connecting to Aiven (check URL, user, password, SSL, and firewall/allowlist).

### 3. Check in Aiven Console

- **Service → Overview:** Service status should be **Running**.
- **Metrics:** Check **Disk usage** and **Connections** to confirm storage and that the app is connecting.
- **Backups:** If enabled, confirm backups are listed and recent (data is stored and backed up).

### 4. Check from MySQL client (optional)

From Aiven Console, copy the **MySQL connection string** (or host, port, user, password). Then:

```powershell
# If you have MySQL client installed; use the host, user, and password from Aiven
mysql -h <aiven-host> -P <port> -u <username> -p <database_name> -e "SELECT 1; SHOW TABLES;"
```

If this connects and shows tables, data is stored and accessible on Aiven.

---

## 🔒 Key Configurations

### Backend Port
`backend/src/main/resources/application.yml`
```yaml
server:
  port: 8080
```

### Frontend API Endpoint
`.env.local`
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WEBSOCKET_URL=http://localhost:8080/ws
```

### CORS Origins
`backend/src/main/java/com/university/erp/config/SecurityConfig.java`
```json
Allowed Origins: [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://*.vercel.app"
]
```

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check MySQL is running: `mysql -u root -p` |
| **Port 8080 in use** | `netstat -ano \| findstr :8080` then stop process |
| **Frontend can't reach API** | Verify `VITE_API_BASE_URL` in `.env.local` |
| **Mobile looks broken** | Clear cache: DevTools → Network → Disable cache |
| **WebSocket fails** | Check backend is running and port 8080 accessible |

---

## 📊 Verify Everything Works

**Checklist:**
- [ ] Backend started (green "START" in terminal)
- [ ] Frontend loaded at http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Dashboard shows 6 colorful KPI cards
- [ ] Mobile view (F12) shows 2 columns properly
- [ ] Hamburger menu visible on mobile
- [ ] All pages load without horizontal scroll

---

## 📚 Full Documentation

See **README.md** and **DEPLOYMENT_GUIDE.md** (if present) for backend configuration, Vercel setup, and deployment.

---

## 🎯 Next Steps

1. **Local Testing:** Run `.\run_backend.ps1` and `.\run_frontend.ps1`
2. **Mobile Testing:** Open DevTools (F12) → Device Emulation
3. **Vercel Prep:** Update environment variables in Vercel dashboard
4. **Deployment:** Push to GitHub for auto-deploy

---

**Status:** ✅ Production Ready  
**Last Updated:** March 5, 2026  
**All Modules:** ✅ Intact (Transport, Academic, Analytics, Messaging)

