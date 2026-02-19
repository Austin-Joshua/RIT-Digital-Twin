# Digital Twin – Smart Campus Intelligence Platform

A production-ready institutional web application for managing smart campus operations, including classroom allocation, energy optimization, transport management, and sustainability tracking.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Axios
- **Backend**: Spring Boot (Java 17), Spring Security (JWT), JPA/Hibernate
- **Database**: MySQL 8.0
- **Deployment**: Docker, Docker Compose

## Prerequisites
- Java 17+
- Node.js 18+
- Docker Desktop
- Maven

## Setup & Running

### Option 1: Docker (Recommended)
1. Ensure Docker Desktop is running.
2. Build the backend JAR:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
   *(If `mvnw` fails, use `mvn clean package -DskipTests`)*
3. Run docker-compose:
   ```bash
   cd ..
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8080/api](http://localhost:8080/api)
   - Swagger Documentation: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Option 2: Local Development
1. **Database**:
   - Start a MySQL instance.
   - Run `database/schema.sql` to create the schema.
   - Update `backend/src/main/resources/application.properties` with your credentials.

2. **Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Default Credentials
- **Admin**: `admin` / `password`

## Modules
1. **Dashboard**: Real-time KPIs and Analytics.
2. **Classroom Allocation**: Optimized room booking based on strength and facilities.
3. **Energy Optimization**: Log viewing and AI-driven optimization simulation.
4. **Transport**: Fleet management and route efficiency analysis.
5. **Crowd Simulation**: Emergency evacuation drills and congestion monitoring.
6. **Sustainability**: Composite ESG scoring.

## License
Confidential - Institutional Use Only.
