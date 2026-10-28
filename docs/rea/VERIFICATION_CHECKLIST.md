# RIT IMS Reverse Engineering & Verification Checklist

This living checklist tracks the verification status of student-accessible modules between the reference application (`https://ims.ritchennai.edu.in`) and the Digital Twin (`https://digital-twin-lemon.vercel.app`).

### Status Definitions
- **NOT INSPECTED**: No reference evidence or screenshot has been gathered yet.
- **AWAITING USER EVIDENCE**: Agent has requested specific page screenshots or network observations from user.
- **OBSERVED**: Screenshot / sanitized evidence provided; UI structure and static elements documented.
- **AWAITING USER VERIFICATION**: Hypothesized interaction or workflow presented to user for manual browser confirmation.
- **VERIFIED**: User has confirmed exact behaviour, validation rules, and observable responses in live IMS.
- **IMPLEMENTED**: Changes applied to Digital Twin codebase following verified specifications.
- **REGRESSION TESTED**: Code passed automated unit tests, build validation, and visual regression review.

---

## Page Verification Register

| # | Page / Workflow | Original IMS URL / Path | Digital Twin Route | Status | Notes |
|---|---|---|---|---|---|
| 01 | **Login Page & Authentication** | `/login` | `/login` | **REGRESSION TESTED** | Institutional split-screen auth, security lockout, and branded header |
| 02 | **Student Dashboard** | `/home` or `/dashboard` | `/student` | **REGRESSION TESTED** | Verified 4 KPI rings, legend swatches, and October 2026 calendar grid from primary screenshots |
| 03 | **Apply Leave / OD** | Student → Leave Application | `/student/leave` | **REGRESSION TESTED** | Authentic 2-column form (Leave Type, To Date, Documents 2MB limit; From Date, Reason), blue Request button, application history |
| 04 | **Academic Fee** | Student → Fee Payment | `/student/fee` | **REGRESSION TESTED** | 3-button topbar (Pay Academic Fee `#28a745`, Payment History `#ffc107`, Consolidated Receipt `#dc3545`), detailed fee ledger, official branded PDF receipts |
| 05 | **Exam Fee** | Student → Exam Fee | `/student/exam-fee` | **REGRESSION TESTED** | Exam fee sessions (Nov 2026, Apr 2026), 9 registered subjects, fee breakdown, green Receipt download button |
| 06 | **Attendance** | Student → Attendance | `/student/attendance` | **REGRESSION TESTED** | Exact `Attendence Report` title, 2026-2027 / Sem V, DataTables action bar, 9 columns, amber highlight for <75%, Anna University warning banner |
| 07 | **My Time Table** | Student → Timetable | `/student/timetable` | **REGRESSION TESTED** | Inverted 9 period rows x 6 weekday columns (`MON DAY`..`SATUR DAY`), blue badge `Class : B.E. CSE / 5 / A`, authentic subject/faculty tags |
| 08 | **My Subject Registration** | Student → Registration | `/student/registration` | **REGRESSION TESTED** | 8 theory + 1 lab courses registered with credits |
| 09 | **CAT Mark** | Student → CAT Mark | `/student/cat-mark` | **REGRESSION TESTED** | Two-tier header (CAT-1, CAT-2, CAT-3, Total 150, Internal 20, Status), authentic [STUDENT_NAME] marks, DataTables action bar, PDF export |
| 10 | **LAB Mark** | Student → LAB Mark | `/student/lab-mark` | **REGRESSION TESTED** | Two-tier header (Cycle-1 100, Cycle-2 100, Model 100, Total 300), authentic scores (Networks Lab 250), DataTables bar, PDF export |
| 11 | **Assignment Mark** | Student → Assignment Mark | `/student/assignment` | **REGRESSION TESTED** | Primary 5-assignment ledger (A1-A5, 10 marks each, Total 50), toggle to submission portal, DataTables bar, PDF export |
| 12 | **Grade Book** | Student → Grade Book | `/student/gradebook` | **REGRESSION TESTED** | Semester dropdown + blue Submit, blue Download Official Grade Sheet button, 8-column results, Anna University grade legend |
| 13 | **Apply Certificates** | Student → Certificates | `/student/certificates` | **REGRESSION TESTED** | 7-column table with Edit (`#17a2b8`) and Delete (`#dc3545`), green Apply button (`#28a745`), modal with amber Preview, live Bonafide modal, PDF download |
| 14 | **Feedbacks** | Student → Feedback | `/student/feedbacks` | **REGRESSION TESTED** | Stacked cards: `Course FeedBack Forms` and `Training FeedBack Forms`, authentic empty state, sample Likert evaluation modal |
| 15 | **Class Committee** | Student → Committee | `/student/committee/*` | **REGRESSION TESTED** | Schedule table; Minutes of Meet DataTables with teal View MOM button; detailed `Summary Of Meeting` with Faculty pills, Student pills, 8-course syllabus completion table, points discussed |
| 16 | **No Due Request** | Student → No Due | `/student/no-due` | **REGRESSION TESTED** | Yellow `Pay Exam Fee` button, `Subjects` table with CAT/Assignment scores, solid red highlight (`#dc3545`) for <75% attendance, `Labs` table, clearances status, green `Download Hall Ticket` button |
| 17 | **Assessments** | Student → Assessments | `/student/assessments` | **REGRESSION TESTED** | Authentic empty card state, toggle to End Sem schedule, 2-page Anna University / Autonomous Hall Ticket PDF generator |
| 18 | **Messages** | Student → Messages | `/student/messages` | **REGRESSION TESTED** | 2-column layout matching screenshot: blue `New message` button, folder list (`All Messages`, `Inbox`, `Outbox`), "You have no messages." text / compose form |
| 19 | **Change Password** | Student → Change Password | `/student/change-password` | **REGRESSION TESTED** | `New Password *`, `Repeat New Password *`, blue requirements box with live checkmarks, solid red `Save` button (`#dc3545`), `/profile/password` alias |
| 20 | **My Profile** | Student → Profile | `/student/profile` | **REGRESSION TESTED** | Top 2 cards (Avatar card + Student Info), 6 collapsible accordions: Personal, Academic, Parent, Educational (authentic 15-column table from screenshot), Address (`[STREET_ADDRESS]`), Document |
