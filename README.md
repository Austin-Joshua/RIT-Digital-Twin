# RIT Digital Twin – Smart Campus Intelligence Platform

Developed for **Rajalakshmi Institute of Technology**

This is a comprehensive full-stack platform for simulating, monitoring, and optimizing campus operations including Classroom Allocation, Energy Usage, Transport Logistics, Crowd Flow, and Sustainability.

---

## 🚀 Features

*   **Smart Classroom Allocation Engine**: AI-driven assignment of classrooms based on capacity and demand.
*   **Energy Optimization Module**: Monitor consumption and simulate optimizations.
*   **Transport Fleet Optimization**: Analyze bus routes for efficiency.
*   **Crowd Flow & Emergency Simulation**: Real-time density monitoring and alert system.
*   **Sustainability Dashboard**: Track Carbon Footprint and Green Initiatives.
*   **Predictive Analytics**: Forecast infrastructure demands.

---

## 🛠 Tech Stack

### Frontend
- **React JS** (Vite)
- **Recharts** for Data Visualization
- **Axios** for API Integration
- **Context API** for State Management
- **RIT Institutional Design System** (Navy Blue & Gold Theme)

### Backend
- **Spring Boot 3** (Java 17)
- **Spring Security** + **JWT** (Role Based Access Control)
- **JPA / Hibernate**
- **MySQL 8** Database
- **Swagger / OpenAPI** Documentation

### DevOps
- **Docker** & **Docker Compose**

---

## 📦 Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local logic dev)
- Node.js 18+ (for local UI dev)

### Quick Start (Docker)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Austin-Joshua/RIT-Digital-Twin.git
    cd RIT-Digital-Twin
    ```

2.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**:
    *   Frontend: `http://localhost:3000`
    *   Backend API: `http://localhost:8080`
    *   Swagger Docs: `http://localhost:8080/swagger-ui/index.html`

### Default Credentials
*   **Email**: `admin@ritchennai.edu.in`
*   **Password**: `admin123`

---

## 📂 Project Structure

```
RIT-Digital-Twin/
├── backend/            # Spring Boot Application
│   ├── src/main/java/com/rit/digitaltwin
│   │   ├── config/     # Security & App Config
│   │   ├── controller/ # REST Endpoints
│   │   ├── model/      # Database Entities
│   │   ├── repository/ # JPA Repositories
│   │   ├── service/    # Business Logic & Simulations
│   └── Dockerfile
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── pages/      # Feature Modules
│   │   ├── context/    # Auth Context
│   └── Dockerfile
└── docker-compose.yml  # Orchestration
```

---

## 🔒 Security
The platform uses JWT (JSON Web Tokens) for securing all endpoints. 
- `/api/v1/auth/**` are public.
- All other endpoints require a valid Bearer Token.

---

Developed with ❤️ by the RIT Digital Twin Team.
