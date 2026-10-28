# RIT IMS Reverse Engineering & Verification Checklist

This living checklist tracks the verification and backend integration status of student-accessible modules between the reference application (`https://ims.ritchennai.edu.in`) and the Digital Twin (`https://digital-twin-lemon.vercel.app`).

### Status Definitions
- **NOT INSPECTED**: No reference evidence or screenshot has been gathered yet.
- **OBSERVED**: Screenshot / sanitized evidence provided; UI structure and static elements documented.
- **AWAITING USER VERIFICATION**: Hypothesized interaction or workflow presented to user for manual browser confirmation.
- **VERIFIED**: User has confirmed exact behaviour, validation rules, and observable responses in live IMS.
- **IMPLEMENTED**: Changes applied to Digital Twin codebase following verified specifications.
- **BACKEND INTEGRATED**: Connected to real Spring Boot backend endpoints with graceful fallback.
- **CANDY DESIGN UPGRADED**: Upgraded with modern curvy candy pill buttons (`border-radius: 9999px`), elevated cards, and visual hierarchy matching `WhatIfSimulator.jsx` and `TransportDirectory.jsx`.
- **REGRESSION TESTED**: Code passed automated unit tests, build validation, and visual regression review.

---

## Page Verification Register

| # | Page / Workflow | Original IMS URL / Path | Digital Twin Route | Status | Provenance & Integration Notes |
|---|---|---|---|---|---|
| 01 | **Login Page & Authentication** | `/login` | `/login` | **CANDY UPGRADED** | `REAL_BACKEND` — Split-screen shell, lockout protection, CAPTCHA spec documented |
| 02 | **Student Dashboard** | `/home` or `/dashboard` | `/student` | **CANDY UPGRADED** | `REAL_BACKEND` + `DERIVED` — 4 KPI rings, TTL caching, calendar grid, candy quick links |
| 03 | **Apply Leave / OD** | Student → Leave Application | `/student/leave` | **CANDY UPGRADED** | `REAL_BACKEND` — 2-column form, `POST /academic/leave/apply`, elevated card, candy submit |
| 04 | **Academic Fee** | Student → Fee Payment | `/student/fee` | **CANDY UPGRADED** | `SYNTHETIC_DEMO` (Sandbox) — Candy 3-button topbar, elevated ledger, branded PDF receipts |
| 05 | **Exam Fee** | Student → Exam Fee | `/student/exam-fee` | **CANDY UPGRADED** | `SYNTHETIC_DEMO` (Sandbox) — Examination sessions (Nov 2026), candy download receipt |
| 06 | **Attendance** | Student → Attendance | `/student/attendance` | **CANDY UPGRADED** | `REAL_BACKEND` + `DERIVED` — Candy DataTables action bar, amber highlight for <75%, `/erp/student/attendance-summary` |
| 07 | **My Time Table** | Student → Timetable | `/student/timetable` | **CANDY UPGRADED** | `REAL_BACKEND` — Inverted 9 period rows x 6 weekday columns, candy view toggles, `/academic/student/timetable` |
| 08 | **My Subject Registration** | Student → Registration | `/student/registration` | **CANDY UPGRADED** | `REAL_BACKEND` — Open electives, real-time capacity progress, candy register buttons |
| 09 | **CAT Mark** | Student → CAT Mark | `/student/cat-mark` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — Two-tier header, candy DataTables bar, wired to `/erp/student/internal-marks` |
| 10 | **LAB Mark** | Student → LAB Mark | `/student/lab-mark` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — Two-tier header, Cycle-1/2/Model, wired to `/erp/student/internal-marks` |
| 11 | **Assignment Mark** | Student → Assignment Mark | `/student/assignment` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — 5-assignment ledger, candy toggle pills, wired to `/assignments/student` |
| 12 | **Grade Book** | Student → Grade Book | `/student/gradebook` | **CANDY UPGRADED** | `REAL_BACKEND` + `DERIVED` — Semester dropdown, candy submit & grade sheet buttons, `/student/gradebook` |
| 13 | **Apply Certificates** | Student → Certificates | `/student/certificates` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — Wired to `workflowApi.getCertificates` & `requestCertificate`, candy actions & modal |
| 14 | **Feedbacks** | Student → Feedback | `/student/feedbacks` | **CANDY UPGRADED** | `SYNTHETIC_DEMO` — Stacked elevated cards, Likert modal with candy rating pills |
| 15 | **Class Committee** | Student → Committee | `/student/committee/*` | **CANDY UPGRADED** | `SYNTHETIC_DEMO` — Schedule table, Minutes of Meet DataTables, Faculty/Student pills, candy "View MOM" pills |
| 16 | **No Due Request** | Student → No Due | `/student/no-due` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — Red highlight for <75%, wired to `/nodue/my-requests`, candy hall ticket download |
| 17 | **Assessments** | Student → Assessments | `/student/assessments` | **CANDY UPGRADED** | `SYNTHETIC_DEMO` — Schedule toggle, elevated timetable, candy hall ticket generator |
| 18 | **Messages** | Student → Messages | `/student/messages` | **CANDY UPGRADED** | `REAL_BACKEND` — 2-column layout, candy folder pills, wired to `/messages/inbox`, `/messages/outbox`, `/messages/send` |
| 19 | **Change Password** | Student → Change Password | `/student/change-password` | **CANDY UPGRADED** | `REAL_BACKEND` — Security callout box, candy Save button, `/auth/change-password` |
| 20 | **My Profile** | Student → Profile | `/student/profile` | **CANDY UPGRADED** | `REAL_BACKEND` + `SYNTHETIC_DEMO` — Avatar card, Student Info, 6 elevated accordions, authentic 15-column educational table, sanitized demo defaults |

---

## Multi-Portal Cross-Role Design Unification

| Role / Portal | Routes & Modules Upgraded | Key Features & Candy Tokens Applied | Status |
|---|---|---|---|
| **Parent Portal** | `/parent` (`ParentDashboard.jsx`) | `.ims-page-container`, `.ims-header-banner`, `.ims-card-elevated`, candy appointment & payment buttons, candy note share | **CANDY UPGRADED** |
| **HOD Portal** | `/hod`, `/hod/performance` (`HODDashboard.jsx`, `HODStudentPerformance.jsx`) | `.ims-header-banner`, `.ims-pill-select`, candy back navigation, elevated analytics cards | **CANDY UPGRADED** |
| **Faculty Portal** | `/faculty/academics`, `/faculty/attendance`, `/faculty/grading`, `/faculty/leaves`, `/faculty/timetable`, `/faculty/analytics`, `/faculty/proctor`, `/faculty/research`, `/assignments/grading`, `/admin/upload-marks` | 10 faculty modules upgraded with `.ims-header-banner`, `.ims-candy-btn` (Save, Approve, Reject, Export, Add), `.ims-pill-select`, `.ims-candy-search` | **CANDY UPGRADED** |
| **Enterprise & Admin** | `/management/certificates`, `/management/substitutions`, `/management/results`, `/management/users`, `/management/audit`, `/exam/timetable-gen`, `/classrooms/allocation`, `/transport/directory`, `/simulations/what-if`, `/clubs`, `/management`, `/simulations/safety`, `/simulations/energy`, `/simulations/crowd`, `/classrooms`, `/maintenance` | Curvy candy buttons, elevated card containers, zero square buttons across all management, simulation, and governance pages | **CANDY UPGRADED** |

