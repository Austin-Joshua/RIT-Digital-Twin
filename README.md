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

## Default Credentials

- Admin: `ADM-001 / ADM-001`
- Faculty: `FAC-001 / FAC-001`
- HOD: `hod_cse@ritchennai.edu.in / hodcse123`
- Student: `student@ritchennai.edu.in / student123`
- Parent: `parent@ritchennai.edu.in / parent123`

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
