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
| 04 | **Academic Fee** | Student → Fee Payment | `/student/fee` | **NOT INSPECTED** | Awaiting user upload |
| 05 | **Exam Fee** | Student → Exam Fee | `/student/exam-fee` | **NOT INSPECTED** | Awaiting user upload |
| 06 | **Attendance** | Student → Attendance | `/student/attendance` | **OBSERVED** | Verified `Attendence Report`, Academic Year 2026-2027, Semester V, DataTables toolbar (Select all, Copy, CSV, Excel, PDF, Print), 9 columns, gold highlight for <75%, `view` action, and Anna University 75% rule notice |
| 07 | **My Time Table** | Student → Timetable | `/student/timetable` | **OBSERVED** | Verified `Class : B.E. CSE / 5 / A` header, full 9-period grid x 6 days, Subject/Staff cards, elective stacking, Mentoring & Training slots |
| 08 | **My Subject Registration** | Student → Registration | `/student/registration` | **NOT INSPECTED** | Awaiting dashboard verification |
| 09 | **CAT Mark** | Student → CAT Mark | `/student/cat-mark` | **OBSERVED** | Verified `CAT Marks` 2-tier header: Course Outcomes CO-1 to CO-5 (25 Marks each, 125 Total), CAT test series mapping, Total (125 Marks), and computed Internal Weightage |
| 10 | **LAB Mark** | Student → LAB Mark | `/student/lab-mark` | **OBSERVED** | Verified `LAB Marks` 2-tier header: Exam Name Cycle-1 (100), Cycle-2 (100), Model Exam (100), Total (300 Marks), and red cell highlight (`#dc3545`) for incomplete/low scores |
| 11 | **Assignment Mark** | Student → Assignment Mark | `/student/assignment` | **NOT INSPECTED** | Awaiting dashboard verification |
| 12 | **Grade Book** | Student → Grade Book | `/student/gradebook` | **NOT INSPECTED** | Awaiting dashboard verification |
| 13 | **Apply Certificates** | Student → Certificates | `/student/certificates` | **OBSERVED** | Verified `Apply Certificate` green button, `Certificate Application List` (S.No, Date, Certificate, Purpose, Status, Response, Action), modal (BONAFIDE/TC/COURSE COMPLETION, Reason dropdown, Hosteler No/Yes, amber `Preview` button), and live Bonafide certificate preview modal |
| 14 | **Feedbacks** | Student → Feedback | `/student/feedbacks` | **NOT INSPECTED** | Awaiting dashboard verification |
| 15 | **Class Committee** | Student → Committee | `/student/committee/*` | **NOT INSPECTED** | Awaiting dashboard verification |
| 16 | **No Due Request** | Student → No Due | `/student/nodue` | **NOT INSPECTED** | Awaiting dashboard verification |
| 17 | **Messages / Circulars** | Student → Messages | `/student/messages` | **NOT INSPECTED** | Awaiting dashboard verification |
| 18 | **My Profile** | Student → Profile | `/student/profile` | **NOT INSPECTED** | Awaiting dashboard verification |
| 19 | **Change Password** | Student → Change Password | `/student/change-password` | **NOT INSPECTED** | Awaiting dashboard verification |

