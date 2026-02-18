# 🚀 RIT Digital Twin – Deployment Guide

**Rajalakshmi Institute of Technology, Chennai**
Smart Campus Intelligence Platform

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24+ | Container runtime |
| Docker Compose | v2+ | Multi-container orchestration |
| Git | 2.x | Source control |

---

## Quick Start (Single Command)

```bash
# Clone and deploy
git clone <repository-url>
cd RIT-Digital-Twin

# Start all services
docker compose up -d --build
```

**Access:**
- 🌐 **Frontend**: http://localhost
- 🔧 **Backend API**: http://localhost:8080
- 📚 **Swagger Docs**: http://localhost/swagger-ui/
- 🗄️ **MySQL**: localhost:3306

**Default Credentials:**
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |

---

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │      │   Backend   │      │    MySQL    │
│  (Nginx:80) │─────▶│ (Spring:8080│─────▶│   (3306)   │
│  React SPA  │ /api │  Boot API)  │ JDBC │     8.0    │
└─────────────┘      └─────────────┘      └─────────────┘
     128 MB              768 MB               512 MB
```

---

## Configuration

### Environment Variables (.env)

Copy and customize the `.env` file:

```bash
cp .env .env.local    # Edit for your environment
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | `RitDigitalTwin@2026` | Database root password |
| `MYSQL_DATABASE` | `rit_digital_twin` | Database name |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile (dev/prod) |
| `JWT_SECRET` | *(long key)* | JWT signing secret |
| `JWT_EXPIRATION_MS` | `86400000` | Token TTL (24 hours) |
| `FRONTEND_PORT` | `80` | Frontend port |
| `BACKEND_PORT` | `8080` | Backend API port |

---

## Deployment Commands

### Build & Start
```bash
# Build images and start all containers
docker compose up -d --build

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### Stop & Restart
```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database)
docker compose down -v

# Restart a specific service
docker compose restart backend
```

### Scale (Horizontal)
```bash
# Run 3 backend replicas (requires load balancer)
docker compose up -d --scale backend=3
```

### Update Deployment
```bash
# Pull latest code and rebuild
git pull origin main
docker compose up -d --build
```

---

## Production Checklist

- [ ] Change `MYSQL_ROOT_PASSWORD` to a strong password
- [ ] Change `JWT_SECRET` to a unique random string (64+ chars)
- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure HTTPS (add SSL certificate + nginx config)
- [ ] Set up database backups
- [ ] Configure firewall rules (allow only 80/443)
- [ ] Set up monitoring (Prometheus/Grafana optional)

---

## Database Management

### Backup
```bash
# Backup database
docker exec rit-mysql mysqldump -u root -p rit_digital_twin > backup.sql

# Restore database
docker exec -i rit-mysql mysql -u root -p rit_digital_twin < backup.sql
```

### Schema
The schema is auto-initialized from:
- `database/schema.sql` – Table definitions
- `database/seed-data.sql` – Initial data (admin user, etc.)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `docker compose logs backend` – usually MySQL not ready |
| Frontend shows blank page | Check `docker compose logs frontend` – nginx config issue |
| MySQL connection refused | Wait for health check: `docker compose ps` should show "healthy" |
| Port already in use | Change ports in `.env`: `FRONTEND_PORT=8081` |
| Out of memory | Increase Docker memory limit in Docker Desktop settings |

### Health Checks
```bash
# Check all service statuses
docker compose ps

# Backend health
curl http://localhost:8080/actuator/health

# MySQL health
docker exec rit-mysql mysqladmin -u root -p ping
```

---

## File Structure

```
RIT-Digital-Twin/
├── docker-compose.yml        # Orchestration
├── .env                      # Environment config
├── DEPLOYMENT.md             # This file
├── backend/
│   ├── Dockerfile            # Multi-stage Maven → JRE
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/
├── frontend/
│   ├── Dockerfile            # Multi-stage Node → Nginx
│   ├── .dockerignore
│   ├── nginx.conf            # Reverse proxy + SPA routing
│   ├── package.json
│   └── src/
└── database/
    ├── schema.sql            # DDL
    └── seed-data.sql         # Initial data
```

---

*© 2026 Rajalakshmi Institute of Technology, Chennai*
