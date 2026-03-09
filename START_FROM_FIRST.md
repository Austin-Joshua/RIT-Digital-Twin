# Start Everything from the First — RIT Digital Twin

Follow these steps in order for a clean, working setup.

---

## Option A: Docker (recommended)

**Prerequisite:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**.

```powershell
cd "c:\Users\austi\OneDrive\Desktop\RIT Digital Twin\RIT-Digital-Twin"
docker compose up --build -d
```

| Service    | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8080/api |
| **Swagger** | http://localhost:8080/swagger-ui/index.html |

**Stop:** `docker compose down`  
**Full reset (wipe DB):** `docker compose down -v` then `docker compose up --build -d`

---

## Option B: Local development (no Docker)

**Prerequisites:**

1. **MySQL 8.0** running on `localhost:3306`
   - User: `root`
   - Password: `123456` (or set `SPRING_DATASOURCE_PASSWORD` in `.env`)
   - Database: `rit_digital_twin` (created automatically if missing)
2. **JDK 21** (script uses `C:\Program Files\Java\jdk-21.0.10` or system Java)
3. **Node.js 20+** and **npm**
4. **Maven 3.9+** or project Maven wrapper

**Step 1 — Start backend**

```powershell
cd "c:\Users\austi\OneDrive\Desktop\RIT Digital Twin\RIT-Digital-Twin"
.\run_backend.ps1
```

Leave this terminal open. Wait until you see something like: `Started ErpApplication in X seconds`.

**Step 2 — Start frontend** (new terminal)

```powershell
cd "c:\Users\austi\OneDrive\Desktop\RIT Digital Twin\RIT-Digital-Twin"
.\run_frontend.ps1
```

**Step 3 — Open the app**

| Service    | URL |
|-----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080/api |
| **Swagger** | http://localhost:8080/swagger-ui/index.html |

---

## Default login credentials

| Role    | Username | Password |
|--------|----------|----------|
| Admin  | `admin@ritchennai.edu.in` | `admin123` |
| Faculty | `faculty@ritchennai.edu.in` | `faculty123` |
| Student | `student@ritchennai.edu.in` | `student123` |

---

## Troubleshooting

- **Port 8080 in use:** Stop the process using it or run `.\stop_backend.ps1` if you have it.
- **Port 5173 in use:** Change `port` in `frontend/vite.config.js` or stop the other app.
- **Backend won’t start:** Ensure MySQL is running and `.env` has the correct `SPRING_DATASOURCE_*` values.
- **Docker “pipe not found”:** Start Docker Desktop and wait until it’s fully running, then run `docker compose up --build -d` again.
