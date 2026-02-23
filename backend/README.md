# University Enterprise ERP Backend

Enterprise-grade Spring Boot 3 backend for university management.

## Tech Stack
- **Framework**: Spring Boot 3.2+
- **Security**: JWT, Spring Security (Role Hierarchy)
- **Database**: MySQL, Spring Data JPA, Hibernate
- **Real-time**: WebSocket (STOMP)
- **Mapping**: MapStruct
- **Containerization**: Docker, Docker Compose

## Architecture
- **Layered**: Controller -> Service -> Repository
- **Security**: Stateless JWT, BCrypt, Stateless sessions
- **Role Hierarchy**: SUPER_ADMIN > ADMIN > HOD > FACULTY > STUDENT > PARENT

## Modules
1. **User Management**: Authentication & Role-based access.
2. **Academic**: Marks, Attendance, CGPA/GPA engine.
3. **Revaluation**: Multi-level approval workflow.
4. **AI Intelligence**: Timetable generator, Risk prediction.
5. **Analytics**: Department-level metric tracking.
6. **Transport**: Bus route & student mapping.
7. **Notifications**: Real-time STOMP alerts.

## Setup & Execution

### Prerequisites
- JDK 17
- Maven 3.6+
- MySQL 8.0 or Docker

### Run with Docker (Recommended)
1. Ensure Docker is running.
2. Execute:
   ```bash
   docker-compose up --build
   ```

### Run Locally
1. Configure MySQL database.
2. Update `application.yml` with credentials.
3. Run:
   ```bash
   mvn spring-boot:run
   ```

## API Documentation
Once running, access Swagger UI at:
`http://localhost:8080/swagger-ui.html`
