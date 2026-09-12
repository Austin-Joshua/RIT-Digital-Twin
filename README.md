# RIT Digital Twin - Production Ready v2.0

Smart campus management platform with React + Spring Boot + MySQL.

## Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- MySQL 8+

### Local setup
```bash
npm install
cd frontend && npm install
cd ../backend && ./mvnw clean package -DskipTests
```

### Environment
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### Run
- Backend: `cd backend && ./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"`
- Frontend: `cd frontend && npm run dev`

## Accounts

There are no default passwords. Startup seeding does not create or reset accounts with a known password. Provision users through an administrator, and change any previously seeded account (`ADM-001`, faculty, HOD, student, or parent) before using a reachable database. Those old passwords are not valid login credentials.

## Major Features

- JWT auth with refresh token flow
- Role-based access (Admin/Faculty/HOD/Student/Parent)
- Timetable generation + export PDF
- Classroom allocation and booking workflow
- Audit smoke script: `powershell -ExecutionPolicy Bypass -File ".\audit-smoke.ps1"`

## Testing

```bash
cd frontend
npm run test
npm run test:coverage
```

## Deployment

- Frontend: Vercel (`vercel.json`)
- Backend: Render (`render.yaml`) or Railway (`railway.json`)
- Backend image support: `backend/Dockerfile`
