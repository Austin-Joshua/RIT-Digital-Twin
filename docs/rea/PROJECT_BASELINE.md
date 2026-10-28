# RIT Digital Twin — Project Baseline & Implementation Inventory

**Generated**: October 2026  
**Repository**: [RIT-Digital-Twin](https://github.com/Austin-Joshua/RIT-Digital-Twin)  
**Branch**: `main`  
**Environments**:
- Production Frontend: `https://digital-twin-lemon.vercel.app` (Vercel)
- Production Backend: `https://rit-backend-0zvm.onrender.com` (Render, PostgreSQL, Docker)
- Reference Application: `https://ims.ritchennai.edu.in/login` (Original RIT IMS)

---

## 1. Project Architecture

The application is structured as a decoupled full-stack institutional ERP and smart campus platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RIT DIGITAL TWIN ARCHITECTURE                   │
├──────────────────────────────────┬─────────────────────────────────────┤
│  Frontend (Vite 8 + React 19)    │  Backend (Spring Boot 3.2.10)       │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • React Router v6                │ • Spring Security 6.2 (JWT Auth)   │
│ • Tailwind CSS + CSS Modules     │ • Spring Data JPA + Hibernate 6     │
│ • Framer Motion v13.4            │ • PostgreSQL 16 + Flyway (41 migrs) │
│ • Three.js v0.186 (3D Campus)    │ • WebSocket / STOMP Realtime        │
│ • Axios with Interceptors        │ • Apache PDFBox 2.0.31              │
│ • Vitest v5 (35/35 passing)      │ • JUnit 5 + Spring Boot Starter Test│
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Authentication & Authorization Model
- **Roles**: `STUDENT`, `FACULTY`, `HOD`, `ADMIN`, `PARENT`.
- **RBAC**: Guarded via `ProtectedRoute` and `RouteRoleGuard` on frontend; `@PreAuthorize("hasRole(...)")` and fail-closed department scoping on backend.
- **Tokens**: JWT access token + refresh token rotation in `localStorage`.

---

## 2. Route Inventory

### A. Authentication Routes
| Route | Component | Purpose |
|---|---|---|
| `/login` | `pages/auth/LoginPage.jsx` | Multi-role IMS credential & Google OAuth sign-in with live health probe |
| `/register` | `pages/auth/RegisterPage.jsx` | Student / User account onboarding |
| `/change-password` | `pages/auth/ChangePassword.jsx` | Self-service credential update |

### B. Student-Facing Routes (`/student/*` guarded by `StudentLayout`)
| Sub-Path | Component | Purpose | Status in Codebase |
|---|---|---|---|
| `/student` | `StudentDashboard.jsx` | KPI rings (CGPA, Attendance, Arrears, Fees), monthly timetable calendar, day period view | Implemented |
| `/student/timetable` | `Timetable.jsx` | Full weekly period matrix, room allocation, faculty name, PDF download | Implemented |
| `/student/registration` | `SubjectRegistration.jsx` | Semester curriculum course enrollment / elective selection | Implemented |
| `/student/leave` | `LeaveOD.jsx` | Leave & On-Duty application, warden letter upload, status tracking | Implemented |
| `/student/attendance` | `Attendance.jsx` | Subject-wise attendance percentages, hours conducted, leaves taken | Implemented |
| `/student/certificates` | `Certificates.jsx` | Bonafide, conduct, medium of instruction request & download | Implemented |
| `/student/cat-mark` | `CATMark.jsx` | Continuous Assessment Test (CAT 1, CAT 2, Model) score ledger | Implemented |
| `/student/lab-mark` | `LABMark.jsx` | Practical observation, model lab, and viva scores | Implemented |
| `/student/assignment` | `AssignmentMark.jsx` | Rubric-based assignment marks and submission status | Implemented |
| `/student/gradebook` | `GradeBook.jsx` | Semester-wise Anna University grade sheet, GPA, CGPA calculation | Implemented |
| `/student/fee` | `AcademicFee.jsx` | Tuition, bus, hostel fee ledger, payment breakdown, receipts | Implemented |
| `/student/exam-fee` | `ExamFee.jsx` | Anna University regular & arrear examination fee checkout | Implemented |
| `/student/feedbacks` | `Feedbacks.jsx` | Faculty teaching evaluation forms and surveys | Implemented |
| `/student/committee/schedule` | `CommitteeSchedule.jsx` | Class committee meeting schedule and agenda | Implemented |
| `/student/committee/minutes` | `CommitteeMinutes.jsx` | Class committee action items and student grievances | Implemented |
| `/student/nodue` | `NoDueRequest.jsx` | Multi-department digital clearance workflow | Implemented |
| `/student/messages` | `Messages.jsx` | Circulars, faculty announcements, institutional broadcasts | Implemented |
| `/student/transport` | `TransportRoute.jsx` | Campus bus routes, stop timings, driver contacts, bus pass | Implemented |
| `/student/profile` | `Profile.jsx` | Personal, parent, academic, admission, and quota details | Implemented |
| `/student/settings` | `ThemeSettingsPage.jsx` | Theme preference (Dark, Light, System) | Implemented |
| `/student/materials` | `CourseMaterials.jsx` | Lecture notes, question banks, syllabus downloads | Implemented |
| `/student/events` | `EventsClubs.jsx` | Campus technical symposiums, hackathons, guest lectures | Implemented |
| `/student/clubs` | `ClubsPage.jsx` | Student club listings, executive teams, registration | Implemented |
| `/student/library` | `Library.jsx` | OPAC book search, borrowed book due dates, renewals | Implemented |
| `/student/map` | `CampusMap.jsx` | Interactive 2D/3D campus geospatial facility map | Implemented |
| `/student/simulator` | `WhatIfSimulator.jsx` | Target CGPA grade predictor & academic risk simulator | Implemented |
| `/student/copilot` | `CampusAssistant.jsx` | AI Campus Assistant / Student Copilot | Implemented |

---

## 3. Existing Module & Backend Service Map

| Functional Domain | Backend Controller | Core Entities | Primary Endpoints |
|---|---|---|---|
| **Identity & Auth** | `AuthController.java` | `User`, `Role`, `RefreshToken`, `LoginLog` | `/api/auth/login`, `/api/auth/refresh-token`, `/api/auth/google` |
| **Student Academics** | `StudentAcademicsController.java`, `AcademicController.java` | `Student`, `StudentAcademic`, `Curriculum`, `Subject` | `/api/student/dashboard-summary`, `/api/student/gradebook`, `/api/student/cgpa` |
| **Leave & On-Duty** | `AcademicController.java` | `StudentLeaveRequest` | `/api/academic/leave/apply`, `/api/academic/leave/my-leaves`, `/api/academic/leave/{id}/status` |
| **Timetable Matrix** | `TimetableController.java` | `TimetableSlot`, `TimetableSubjectRequirement`, `Room` | `/api/academic/student/timetable`, `/api/academic/timetable/generate`, `/api/academic/timetable/export-pdf` |
| **Assessment Marks** | `AcademicController.java`, `MarksUploadController.java` | `Marks`, `InternalMark`, `MarkHistory` | `/api/academic/marks/student/{id}`, `/api/academic/student/cgpa` |
| **Digital Clearances** | `NoDueController.java` | `NoDueRequest`, `ClearanceDefinition` | `/api/nodue/my-requests`, `/api/nodue/request`, `/api/nodue/{id}/status` |
| **Campus Intelligence** | `DigitalTwinController.java`, `CampusCopilotController.java` | `Building`, `DigitalTwinMetrics`, `CampusDecision` | `/api/twin/telemetry`, `/api/copilot/chat`, `/api/twin/catalog` |
| **Transport Services** | `TransportController.java` | `TransportRoute`, `BusStop`, `StudentTransportMapping` | `/api/transport/routes`, `/api/transport/stops`, `/api/transport/my-route` |

---

## 4. UI Design Patterns Currently in Use

1. **Application Shell (`StudentLayout.jsx`)**:
   - Left vertical sidebar navigation (`Sidebar.jsx`) with college brand header ("RIT Digital Twin"), navigation categories, and collapsible Class Committee dropdown.
   - Top bar with mobile hamburger trigger, theme toggle (Dark/Light), notification bell with dropdown, and user profile pill with quick-action menu.
   - Responsive breakpoints: `>= 1024px` for permanent desktop drawer; `< 1024px` for modal slide-out drawer with backdrop.
2. **Dashboard Card System**:
   - `RingStat.jsx`: SVG radial progress indicator showing percentage, value, and label with status color coding (green, cyan, red, amber).
   - `ims-calendar-card`: Custom grid table rendering the academic calendar month, color-coded day states (holiday, no order day, today, out of range, has class), and period timetable inspection drawer.
3. **Typography & Styling**:
   - Font family: `Plus Jakarta Sans` and `Inter`.
   - Brand Navy: `#0B2C6B`, Brand Gold: `#FFD700` / `#B8860B`, Neutral Canvas: `#F8FAFC` (light), `#020617` (dark).
   - Glassmorphism & Framer Motion transitions across pages.

---

## 5. Features That Must Be Preserved

During the IMS visual and workflow alignment, the following Digital Twin features must remain intact:
1. **Real-time Digital Twin telemetry & campus simulation**: 3D Campus Map, Classroom Allocation, IoT sensors, Energy simulation.
2. **AI Campus Copilot & Student Assistant**: Natural language guidance, context-aware query responses.
3. **What-If Academic Simulator**: Student target GPA calculation and scenario analysis.
4. **Automated Timetable Generation & PDF Export**: Constraint-based scheduling and branded Anna University syllabus PDF timetable exports.
5. **Robust Security & Audit Infrastructure**: Token refresh rotation, brute-force lockout, fail-closed department data isolation.

---

## 6. Known Inconsistencies & Technical Risks

1. **Mock Data in Financial Modules**:
   - `AcademicFee.jsx` and `ExamFee.jsx` use static constants (`studentFees.js`) rather than live student ledger endpoints.
2. **UI Discrepancies vs. Original IMS**:
   - The original IMS uses a classic institutional portal layout (specific form layouts, table filters, tabbed sections, breadcrumb styling).
   - `LeaveOD.jsx`, `AcademicFee.jsx`, and `StudentDashboard.jsx` diverge visually from the original RIT IMS patterns.
3. **Session & Network Resiliency**:
   - Render free-tier sleep cycles require defensive timeout handling and clean recovery indicators.

