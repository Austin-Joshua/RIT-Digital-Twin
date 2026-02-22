# RIT Digital Twin — Smart Campus Intelligence Platform

A full-stack institutional web application for managing smart campus operations: classroom allocation, energy optimization, transport management, sustainability tracking, and crowd simulation.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Recharts, Axios |
| Backend | Spring Boot 3.2 (Java 17), Spring Security (JWT) |
| Database | MySQL 8.0 |
| Infrastructure | Docker, Docker Compose |

---

## 🚀 Quick Start (Docker)

**Requirements:** Docker Desktop must be running.

```powershell
# Start all services (MySQL → Backend → Frontend)
docker-compose up --build -d

# Stop all services
docker-compose down

# Full reset (wipes database)
docker-compose down -v
docker-compose up --build -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger Docs | http://localhost:8080/swagger-ui/index.html |

---

## 🔑 Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Faculty | `faculty` | `faculty123` |
| Student | `student` | `student123` |

---

## 🛠️ Local Development

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
> Update `backend/src/main/resources/application.properties` to point to your local MySQL instance.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Project Structure

```
RIT-Digital-Twin/
├── backend/          # Spring Boot API
├── frontend/         # React app
├── database/         # schema.sql + seed-data.sql
├── docker-compose.yml
└── start_app.ps1     # PowerShell convenience script
```

---

## 📋 Modules

| Module | Description |
|---|---|
| Dashboard | Real-time KPIs and analytics |
| Classroom Allocation | Optimized room booking |
| Energy Optimization | Monitoring and AI simulation |
| Transport | Fleet management and route efficiency |
| Crowd Simulation | Evacuation drills and congestion monitoring |
| Sustainability | ESG composite scoring |

---

*Confidential — Institutional Use Only.*
