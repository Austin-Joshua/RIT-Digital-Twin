# RIT IMS — API & Data Observations (Phase 2 Audit)

This document details observable HTTP request contracts, backend endpoints, response structures, and data flows mapped during Phase 2 of the REA process.

**Strict Privacy & Security Rule**:
- All authorization tokens, session cookies, passwords, and sensitive student personal identifiers are strictly redacted.
- Only request structure, query parameters, status codes, and response schemas are recorded.

---

## 1. Authentication & Security Endpoints

### `POST /api/auth/login`
- **Controller**: `AuthController.authenticateUser`
- **Request Body**:
  ```json
  {
    "username": "[REDACTED_USER_ID]",
    "password": "[REDACTED_SECRET]"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": 101,
      "username": "2117240020001",
      "email": "student.cse@ritchennai.edu.in",
      "role": "ROLE_STUDENT",
      "firstName": "STUDENT",
      "lastName": "CANDIDATE"
    }
  }
  ```
- **Security Protections**: Rate-limiting and IP lockout handled by `BruteForceProtectionService.java`.

### `POST /api/auth/change-password`
- **Controller**: `AuthController.changePassword`
- **Request Body**:
  ```json
  {
    "newPassword": "[REDACTED_NEW_PASSWORD]"
  }
  ```
- **Fidelity Note**: Does NOT require current password, exactly matching authentic IMS interface observed in `media_1793188708733_2e3f9772.png`.

---

## 2. Academics & Attendance Endpoints

### `GET /api/erp/student/attendance-summary`
- **Controller**: `ErpCoreController.studentAttendanceSummary`
- **Authorized Role**: `ROLE_STUDENT`
- **Data Flow**:
  UI (`Attendance.jsx`) → `api.get('/erp/student/attendance-summary')` → `ErpCoreController` → `ErpCoreService.attendanceSummaryForStudent()` → DB.
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "subjectCode": "CS23511",
      "subjectName": "Computer Networks",
      "facultyName": "ARAVINDH S",
      "totalHours": 45,
      "presentHours": 41,
      "odHours": 0,
      "percentage": 91.11
    },
    {
      "subjectCode": "CS23512",
      "subjectName": "Compiler Design",
      "facultyName": "DR. MADHAN V.",
      "totalHours": 48,
      "presentHours": 34,
      "odHours": 0,
      "percentage": 70.83
    }
  ]
  ```

### `GET /api/erp/student/internal-marks`
- **Controller**: `ErpCoreController.studentInternalMarks`
- **Authorized Role**: `ROLE_STUDENT`
- **Data Flow**:
  UI (`CATMark.jsx`, `LABMark.jsx`, `AssignmentMark.jsx`) → `api.get('/erp/student/internal-marks')` → `ErpCoreController` → `ErpCoreService.internalMarksForStudent()` → DB.
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "studentSubjectId": 501,
      "subjectCode": "CS23511",
      "subjectName": "Computer Networks",
      "cat1Marks": 35.0,
      "cat2Marks": 23.0,
      "cat3Marks": 33.0,
      "assignmentMarks": 10.0,
      "attendanceMarks": 5.0,
      "totalInternal": 12.13
    }
  ]
  ```

---

## 3. Workflow & Certificates Endpoints

### `GET /api/workflow/certificates/{studentId}`
- **Controller**: `WorkflowController.getCertificates`
- **Authorized Role**: `ROLE_STUDENT` (must match own record)
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": 12,
      "studentId": 101,
      "certificateType": "BONAFIDE",
      "status": "APPROVED",
      "remarks": "Verified and signed by Principal Office",
      "createdAt": "2026-10-12T09:30:00Z"
    }
  ]
  ```

### `POST /api/workflow/certificates/request/{studentId}?type={type}`
- **Controller**: `WorkflowController.requestCertificate`
- **Authorized Role**: `ROLE_STUDENT` (must match own record)
- **Status Codes**: 200 OK, 400 Bad Request if type missing.

---

## 4. Leave & OD Application Endpoints

### `POST /api/academic/leave/apply`
- **Controller**: `AcademicController.applyLeave`
- **Authorized Role**: `ROLE_STUDENT`
- **Request Body**:
  ```json
  {
    "type": "LEAVE",
    "startDate": "2026-11-02",
    "endDate": "2026-11-03",
    "reason": "Personal work"
  }
  ```
- **Validation Rules**: `type` must be either `LEAVE` or `OD`; `endDate` must be on or after `startDate`.

### `GET /api/academic/leave/my-leaves`
- **Controller**: `AcademicController.getMyLeaveRequests`
- **Authorized Role**: `ROLE_STUDENT`
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": 44,
      "type": "OD",
      "startDate": "2026-09-18",
      "endDate": "2026-09-19",
      "reason": "Paper Presentation at Symposium",
      "status": "APPROVED",
      "appliedDate": "2026-09-15"
    }
  ]
  ```

---

## 5. Messaging & Communication Endpoints

### `GET /api/messages/inbox` & `GET /api/messages/outbox`
- **Controller**: `MessageController.getInbox` / `getOutbox`
- **Authorized Role**: `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN`
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "id": 801,
      "senderId": 12,
      "senderName": "Dr. Madhan V.",
      "recipientId": 101,
      "subject": "Class Committee Meeting Announcement",
      "content": "Class committee meeting scheduled for tomorrow at 10 AM.",
      "sentAt": "2026-10-20T10:00:00Z",
      "isRead": true
    }
  ]
  ```

### `POST /api/messages/send`
- **Controller**: `MessageController.sendMessage`
- **Request Body**:
  ```json
  {
    "to": "faculty.mentor@ritchennai.edu.in",
    "subject": "Regarding OD Permission",
    "content": "Respected Sir, kindly approve my OD request for the symposium."
  }
  ```

---

## 6. Clearances & No Due Endpoints

### `GET /api/nodue/my-requests`
- **Controller**: `NoDueController.getMyNoDueRequests`
- **Authorized Role**: `ROLE_STUDENT`
- **Response Shape (200 OK)**:
  ```json
  [
    {
      "department": "Library",
      "status": "CLEARED",
      "updatedAt": "2026-10-25T14:20:00Z"
    },
    {
      "department": "Laboratory",
      "status": "CLEARED",
      "updatedAt": "2026-10-25T15:10:00Z"
    }
  ]
  ```
