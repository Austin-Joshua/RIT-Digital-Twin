# Quick Setup Guide

## Digital Twin – Smart Campus Intelligence Platform

This guide will help you get the platform running in under 5 minutes.

---

## Prerequisites

- Docker Desktop installed
- Git installed
- 8GB RAM available

---

## Step 1: Clone and Navigate

```bash
git clone <repository-url>
cd RIT-Digital-Twin
```

---

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# The default values work out of the box
# Edit only if you need custom configuration
```

---

## Step 3: Start Services

```bash
# Build and start all services
docker-compose up --build -d

# Wait for services to initialize (about 60 seconds)
docker-compose ps
```

---

## Step 4: Access Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web Application |
| Backend API | http://localhost:8080 | REST API |
| Swagger Docs | http://localhost:8080/swagger-ui.html | API Documentation |
| MySQL | localhost:3307 | Database (if needed) |

---

## Step 5: Login

Use the default credentials:

```
Email: admin@institution.edu
Password: admin123
```

---

## Common Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build frontend
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Build Failures
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up --build -d
```

---

## Development Mode

### Backend Only
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

---

## Next Steps

1. **Customize**: Update logo, colors, and institution name in frontend/src
2. **Configure**: Edit .env for production settings
3. **Deploy**: Use docker-compose.prod.yml for production
4. **Secure**: Change default JWT secret and passwords

---

## Support

For issues or questions, please refer to:
- README.md - Full documentation
- API Documentation - http://localhost:8080/swagger-ui.html
- Database Schema - database/schema.sql

---

**Ready to empower your campus with data-driven intelligence!**
