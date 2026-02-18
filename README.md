# RIT Digital Twin - Smart Campus Intelligence Platform

## Rajalakshmi Institute of Technology, Chennai

Enterprise-grade digital twin platform for smart campus management with AI-powered analytics.

### Tech Stack
- **Frontend**: React 19 + Vite  
- **Backend**: Spring Boot 3.2 (Java 17+)  
- **Database**: MySQL 8.0  
- **Auth**: JWT + Role-based (Admin, Management, Faculty)  
- **Docs**: Swagger/OpenAPI  
- **Deploy**: Docker + Docker Compose  

### Quick Start

#### Prerequisites
- Java 17+, Maven, Node.js 18+, MySQL 8.0

#### Backend
```bash
cd backend
mvn spring-boot:run
```
API available at: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: http://localhost:5173

#### Docker (Full Stack)
```bash
docker-compose up --build
```

### Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Management | management | manage123 |
| Faculty | faculty | faculty123 |

### Core Modules
1. Smart Classroom Allocation Engine
2. Energy Consumption Simulation
3. Transport Route Optimization
4. Crowd Flow & Emergency Simulation
5. Sustainability Dashboard
6. Predictive Analytics Engine

### Project Structure
```
RIT-Digital-Twin/
├── backend/          # Spring Boot API
│   └── src/main/java/com/rit/digitaltwin/
│       ├── config/       # Security, Swagger, CORS
│       ├── controller/   # REST controllers
│       ├── dto/          # Data transfer objects
│       ├── entity/       # JPA entities
│       ├── exception/    # Global error handling
│       ├── repository/   # Data access layer
│       ├── security/     # JWT auth
│       └── service/      # Business logic
├── frontend/         # React + Vite
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       ├── layouts/      # Dashboard layout
│       ├── pages/        # Login, Dashboard, Modules
│       ├── services/     # API client
│       └── styles/       # Design system
├── database/         # SQL schemas
├── docker-compose.yml
└── README.md
```
