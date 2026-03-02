# RIT Digital Twin — Smart Campus Intelligence Platform

A full-stack institutional web application for managing smart campus operations: classroom allocation, energy optimization, transport management, sustainability tracking, and crowd simulation.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite 7), Tailwind CSS 4, Recharts, Framer Motion |
| Backend | Spring Boot 3.2 (Java 25), Spring Security (JWT) |
| Database | MySQL 8.0 |
| Infrastructure | Docker, Docker Compose, Vercel (frontend), Render (backend) |

---

## 🛠️ Prerequisites

| Software | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v24+ |
| [JDK](https://www.oracle.com/java/technologies/downloads/) | 25 |
| [MySQL](https://dev.mysql.com/downloads/mysql/) | 8.0+ |
| [Maven](https://maven.apache.org/) | 3.9+ |
| *(Optional)* [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest |

> **Note on Maven**: The `run_backend.ps1` script will automatically use your system Maven or the included Maven wrapper (`mvnw.cmd`).

---

## 🚀 Quick Start (Docker)

```powershell
# Start all services (MySQL → Backend → Frontend)
docker-compose up --build -d

# Stop all services
docker-compose down

# Full reset (wipes database)
docker-compose down -v && docker-compose up --build -d
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
| Admin | `admin@ritchennai.edu.in` | `admin123` |
| Faculty | `faculty@ritchennai.edu.in` | `faculty123` |
| Student | `student@ritchennai.edu.in` | `student123` |

---

## 🛠️ Local Development

### Backend
```powershell
.\run_backend.ps1
```

### Frontend
```powershell
.\run_frontend.ps1
```

---

## 🌐 Deployment

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://digital-twin-lemon.vercel.app |
| Backend | Render | https://rit-digital-twin-backend.onrender.com |

### 📖 Deployment Guides

- **[Vercel Frontend to Backend Setup](./FRONTEND_BACKEND_SETUP.md)** - Quick start guide for connecting Vercel frontend to backend
- **[Detailed Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Comprehensive architecture and troubleshooting guide

---

## 📦 Project Structure

```
RIT-Digital-Twin/
├── backend/          # Spring Boot API
├── frontend/         # React app (Vite)
├── database/         # schema.sql + seed-data.sql
├── docker-compose.yml
├── run_backend.ps1   # Backend startup script
├── run_frontend.ps1  # Frontend startup script
└── stop_backend.ps1  # Backend shutdown script
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
