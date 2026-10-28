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
| 01 | **Login Page & Authentication** | `/login` | `/login` | **OBSERVED** | Auth form, lockout, backend status badge implemented; awaiting captcha & human-verification confirmation |
| 02 | **Student Dashboard** | `/home` or `/dashboard` | `/student` | **OBSERVED** | Verified 4 KPI rings, legend swatches, and October 2026 calendar grid from primary screenshots |
| 03 | **Apply Leave / OD** | Student → Leave Application | `/student/leave` | **OBSERVED** | Verified Leave Form layout: Leave Type (`Leave`/`OD`), From Date, To Date, Reason, Documents file upload (2MB PNG/JPG), and blue `Request` button |
| 04 | **Academic Fee** | Student → Fee Payment | `/student/fee` | **OBSERVED** | Verified full 3-button topbar (`Pay Academic Fee`, `Payment History`, `Consolidated Receipt`), Student Details card, 3-column Fee Details ledger, payment modal, transaction history, and official institutional `Fee Receipt` PDF |
| 05 | **Exam Fee** | Student → Exam Fee | `/student/exam-fee` | **OBSERVED** | Verified `Exam Fee` details (Semester IV, Semester V fees of ₹2950, Total Fee, Paid Amount, Balance Amount), yellow Payment History button, session-wise history cards (Nov 2026, April 2026), and green Receipt download |
| 06 | **Attendance** | Student → Attendance | `/student/attendance` | **OBSERVED** | Verified `Attendence Report`, Academic Year 2026-2027, Semester V, DataTables toolbar (Select all, Copy, CSV, Excel, PDF, Print), 9 columns, gold highlight for <75%, `view` action, and Anna University 75% rule notice |
| 07 | **My Time Table** | Student → Timetable | `/student/timetable` | **OBSERVED** | Verified `Class : B.E. CSE / 5 / A` header, full 9-period grid x 6 days, Subject/Staff cards, elective stacking, Mentoring & Training slots |
| 08 | **My Subject Registration** | Student → Registration | `/student/registration` | **NOT INSPECTED** | Awaiting user upload |
| 09 | **CAT Mark** | Student → CAT Mark | `/student/cat-mark` | **OBSERVED** | Verified `CAT Marks` 2-tier header: Course Outcomes CO-1 to CO-5 (25 Marks each, 125 Total), CAT test series mapping, Total (125 Marks), and computed Internal Weightage |
| 10 | **LAB Mark** | Student → LAB Mark | `/student/lab-mark` | **OBSERVED** | Verified `LAB Marks` 2-tier header: Exam Name Cycle-1 (100), Cycle-2 (100), Model Exam (100), Total (300 Marks), and red cell highlight (`#dc3545`) for incomplete/low scores |
| 11 | **Assignment Mark** | Student → Assignment Mark | `/student/assignment` | **OBSERVED** | Verified `Assignment Marks` table with columns: Subject Code, Subject Name, Faculty Name, Assignment Mark-1 to Mark-5 (10-Marks each), and Total (50 - Marks) |
| 12 | **Grade Book** | Student → Grade Book | `/student/gradebook` | **OBSERVED** | Verified `Grade Book` filter (Semester select + blue Submit), `Download PDF` button, 8-column results table, full Anna University grading code legend (RA, RA*, W/WD, SA, SE, WH1, WH2), and official branded `Semester Results` PDF export |
| 13 | **Apply Certificates** | Student → Certificates | `/student/certificates` | **OBSERVED** | Verified `Apply Certificate` green button, `Certificate Application List` (S.No, Date, Certificate, Purpose, Status, Response, Action), modal (BONAFIDE/TC/COURSE COMPLETION, Reason dropdown, Hosteler No/Yes, amber `Preview` button), and live Bonafide certificate preview modal |
| 14 | **Feedbacks** | Student → Feedback | `/student/feedbacks` | **OBSERVED** | Verified 2 cards: `Course FeedBack Forms` and `Training FeedBack Forms` with `No Data Available...` empty state |
| 15 | **Class Committee** | Student → Committee | `/student/committee/*` | **OBSERVED** | Verified collapsible submenu (`Schedule`, `Minutes Of Meet`), DataTables list, teal `View MOM` button, detailed meeting metadata, Faculty/Student member tag clouds, 11-course syllabus completion table, low attendance table, 3-tier points discussed, and embedded classroom photo |
| 16 | **No Due Request** | Student → No Due | `/student/no-due` | **OBSERVED** | Verified multi-tier clearance structure: Subjects ledger (CAT, Assignment, Atten %, Dues, Status), Labs ledger (Cycle marks, Atten %, Dues, Status), and Department Clearances checklist (HOD, Library, Accounts, Hostel, Placement) |
| 17 | **Assessments** | Student → Assessments | `/student/assessments` | **OBSERVED** | Verified `Assessments` sub-module with `Hall Tickets` (End Semester Exam session, eligibility status, green download button, exam regulatory instructions) |
| 18 | **Messages** | Student → Messages | `/student/messages` | **OBSERVED** | Verified top action bar with green `New message` button, sub-tabs (`All Messages`, `Inbox`, `Outbox`), empty state (`You have no messages.`), and compose message form (Recipient dropdown, Subject, Content textarea, Submit) |
| 19 | **Change Password** | Student → Change Password | `/student/change-password` | **OBSERVED** | Verified `Change password` form (`Current Password *`, `New Password *`, `Repeat New Password *` with eye toggles), password complexity requirements banner, blue `Submit` button, and top-right profile dropdown (`My Profile`, `Logout`) |
| 20 | **My Profile** | Student → Profile | `/student/profile` | **OBSERVED** | Verified 4-tab structured profile: `Personal Details`, `Academic Details` (EMIS, UMIS, Admitted Mode, First Graduate, Scholarship, Lateral Entry), `Parent Details` (Father/Mother phone, occupation, office addresses), and `Educational Details` (SSLC/HSC) |

