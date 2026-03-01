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

### Environment Variables
The application reads several values from environment variables. A sample template is provided in the
[`.env.example`](../.env.example) file. Important variables include:

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` –
  JDBC connection details for the database.
- **JWT secret**: the property `app.jwt.secret` may be populated from either
  `JWT_SECRET` (used by Docker Compose) or `APP_JWT_SECRET` (shown in the `.env.example`).
  For convenience a harmless default (`ChangeMeInDev`) is used when neither variable is set,
  so the application can start in development without additional configuration.
- `APP_JWT_EXPIRATION_MS` – token expiration in milliseconds (defaults to 86400000).
- `APP_CORS_ALLOWED_ORIGINS` – comma‑separated list of permitted origins for CORS.

### Run with Docker (Recommended)
1. Ensure Docker is running.
2. Execute:
   ```bash
   docker-compose up --build
   ```

### Run Locally
1. Configure MySQL database and create schema `ritdb` (or adjust `SPRING_DATASOURCE_URL`).
2. Set the necessary environment variables (see above).
3. Run:
   ```bash
   mvn spring-boot:run
   ```

> If you don’t have Maven installed you can start the packaged JAR like:
> ```powershell
> $env:SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/ritdb'; \
> $env:SPRING_DATASOURCE_USERNAME='root'; \
> $env:SPRING_DATASOURCE_PASSWORD='password'; \
> $env:JWT_SECRET='mySecret'; \
> java -jar target/erp-1.0.0.jar --spring.profiles.active=dev
> ```

## API Documentation
Once running, access Swagger UI at:
`http://localhost:8080/swagger-ui.html`
