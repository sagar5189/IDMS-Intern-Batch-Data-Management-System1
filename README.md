# Intern Management System

A full-stack Intern Management application built with **Spring Boot** (backend) and **Angular 17** (frontend).

---

## 📁 Project Structure

```
intern-management/
├── backend/          # Spring Boot REST API
└── frontend/         # Angular 17 SPA
```

---

## 🚀 Technology Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database  | MySQL 8+                            |
| Auth      | JWT (JJWT 0.12.3)                   |
| Frontend  | Angular 17, Angular Material 17     |
| Charts    | Chart.js + ng2-charts               |
| API Docs  | SpringDoc OpenAPI (Swagger UI)      |

---

## ⚙️ Backend Setup

### Prerequisites
- Java 17+
- Maven 3.9+
- MySQL 8+

### Configuration (`backend/src/main/resources/application.properties`)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/intern_management?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password

app.jwt.secret=InternHubJWTSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm
app.jwt.expiration=86400000

# Mail (optional — set app.notification.enabled=false to skip)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.notification.enabled=true
```

### Run

```bash
cd backend
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api/v1`  
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Demo Users (auto-seeded)

| Username  | Password  | Role    |
|-----------|-----------|---------|
| admin     | admin123  | ADMIN   |
| manager   | mgr123    | MANAGER |
| viewer    | view123   | VIEWER  |

---

## 🖥️ Frontend Setup

### Prerequisites
- Node.js 18+
- Angular CLI 17+

### Run

```bash
cd frontend
npm install
ng serve
```

App URL: `http://localhost:4200`

---

## 📡 REST API Reference

### Auth
| Method | Endpoint               | Description     |
|--------|------------------------|-----------------|
| POST   | /api/v1/auth/login     | Login           |
| POST   | /api/v1/auth/register  | Register        |

### Interns
| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | /api/v1/interns                   | List all interns          |
| POST   | /api/v1/interns                   | Create intern             |
| GET    | /api/v1/interns/{id}              | Get intern by DB id       |
| PUT    | /api/v1/interns/{id}              | Update intern             |
| DELETE | /api/v1/interns/{id}              | Delete intern             |
| GET    | /api/v1/interns/search            | Search/filter interns     |
| PATCH  | /api/v1/interns/{id}/performance  | Update performance score  |

### Batches
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/v1/batches               | List all batches         |
| POST   | /api/v1/batches               | Create batch             |
| GET    | /api/v1/batches/{id}          | Get batch                |
| PUT    | /api/v1/batches/{id}          | Update batch             |
| DELETE | /api/v1/batches/{id}          | Delete batch             |
| GET    | /api/v1/batches/active        | Active batches           |
| GET    | /api/v1/batches/summaries     | Batch summaries          |
| GET    | /api/v1/batches/{id}/overview | Batch overview + interns |

---

## 🔑 Intern ID Format

| ID Card Type | Format                     | Example              |
|--------------|----------------------------|----------------------|
| PREMIUM      | `EMP{YYYYMMDD}-{NNN}`      | `EMP20241129-001`    |
| FREE         | `TDA{YYYYMMDD}-{NNN}`      | `TDA20241129-001`    |

Sequence numbers are per-date-per-type and auto-increment.

---

## 🛡️ Role Permissions

| Action                      | ADMIN | MANAGER | VIEWER |
|-----------------------------|-------|---------|--------|
| View interns/batches        | ✅    | ✅      | ✅     |
| Create/Update interns       | ✅    | ✅      | ❌     |
| Create/Update batches       | ✅    | ✅      | ❌     |
| Delete interns/batches      | ✅    | ❌      | ❌     |

---

## ✅ Features Implemented

- ✅ Intern Registration with auto-generated ID
- ✅ Batch Management with auto end-date (+6 months)
- ✅ Search & Filter (name, batch, ID card type, status)
- ✅ Update intern details (ID is immutable)
- ✅ Delete intern records
- ✅ Batch Overview with intern list
- ✅ Performance Tracking (score + remarks)
- ✅ Role-based Access Control (ADMIN / MANAGER / VIEWER)
- ✅ JWT Authentication
- ✅ Email Notifications (registration, batch creation)
- ✅ Dashboard with statistics
- ✅ Scheduled batch status updates (daily)
- ✅ Swagger / OpenAPI documentation

---

## 🔮 Optional Future Enhancements

- Intern Performance Tracking dashboard/charts
- Email/SMS notifications on batch assignment
- Export intern list to CSV/Excel
