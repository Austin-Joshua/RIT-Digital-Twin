# RIT IMS — Verified Workflow Catalog

This catalog documents observed end-to-end workflows in the reference IMS.

**Format**:
`User Action` → `UI Response` → `Observable Network Request (if inspected)` → `Observable Response` → `Resulting State`

---

## 1. Authentication & Session Initiation
*Awaiting verification on CAPTCHA / redirection behaviour.*

## 2. Certificate Application Lifecycle (Verified)

### A. New Application
`Click "Apply Certificate"` → `Modal Dialog Opens` → `Select Certificate (e.g. BONAFIDE)` → `Select Reason (e.g. Internship)` → `Optional: Click "Preview" to inspect document` → `Click "Apply"` → `Modal Dialog: "Certificate Applied Successfully" [OK]` → `Record appears in "Certificate Application List" with Status: "Submitted For AO Verification" (amber) and Actions: [Edit] [Delete]`

### B. Edit Application
`Click [Edit] on record` → `Modal Dialog Opens pre-filled` → `Modify fields (e.g. Hostel Room No)` → `Button shows "Update"` → `Click "Update"` → `Record updated in table`

### C. Delete Application
`Click [Delete] on record` → `SweetAlert Confirmation: "Are You Sure? / Do You Really Want To Delete !" with [No] [Yes]` → `Click [Yes]` → `Confirmation: "Certificate Application Deleted" [OK]` → `Row removed from table`

---

## 3. Fee Payment & Receipt Workflow (Verified)

### A. Academic Fee Online Payment
`Navigate to Academic Fee` → `View 3-column Fee Ledger` → `Click "Pay Academic Fee" (green)` → `Payment Modal Opens showing Outstanding Balance & Wallet Balance` → `Enter Amount *` → `Click "Pay"` → `Payment Gateway Gateway Intercept` → `Success Notification` → `Ledger updates Paid Amount and Balance Amount to 0`

### B. Consolidated Institutional Receipt Generation
`Click "Consolidated Receipt" (red)` → `Sub-view opens displaying Academic Year records` → `Click green "Receipt" button` → `Browser PDF Viewer renders authentic RIT Consolidated Receipt with NAAC 'A++' header, NEFT transaction details, itemized fee particulars, amount in words, and legal verification notices`

---

## 4. Class Committee MOM Inspection Workflow (Verified)

`Expand "Class Committee" in Sidebar` → `Click "Minutes Of Meet"` → `DataTables list displays scheduled meetings` → `Click teal "View MOM" button` → `Navigate to "View Course Committee's MOM"` → `Inspect Meeting Metadata Grid (Chairman, Incharge, Venue, Time)` → `View interactive Attendee Tag Chips (Faculties & Students)` → `Inspect 11-course Syllabus Completion Status Table with real completion percentages` → `Inspect Low Attendance Students List` → `Review Academic, Non-Academic, and Additional Points Discussed` → `Inspect embedded classroom meeting photograph`

---

## 5. No Due Request Clearance Workflow (Verified)

`Click "No Due Request"` → `Page loads multi-tier clearance records` → `Section 1: Theory Subjects list showing CAT Marks, Assignment Marks, and Attendance % with Approved status` → `Section 2: Laboratory courses list with cycle marks and attendance` → `Section 3: Department Clearances (HOD, Library, Accounts, Hostel, Placement) showing individual clearance seals`

---

## 6. Student Messaging Workflow (Verified)

### A. Viewing Inbox / Outbox
`Click "Messages"` → `Default active tab: "Inbox"` → `Display "You have no messages." when empty` → `Switch tabs to "All Messages" or "Outbox" to view sent correspondence`

### B. Composing New Message
`Click green "New message" button` → `Compose form loads` → `Select Recipient * from dropdown (e.g. ADMIN, HOD - CSE, ARAVINDH S)` → `Enter Subject *` → `Type message Content * in textarea` → `Click blue "Submit"` → `Success confirmation dialog` → `Message logged to Outbox`

---

## 7. Change Password Workflow (Verified)

`Click "Change password"` → `Form displays with Current Password, New Password, and Repeat New Password fields` → `Click eye icons to toggle visibility` → `Password validation enforces minimum 8 chars, uppercase, lowercase, number, symbol` → `Click blue "Submit"` → `Password updated in system and session preserved`

---

## 8. Hall Ticket Download Workflow (Verified)

`Click "Assessments"` → `View Hall Tickets module` → `Card displays "Nov / Dec 2026 End Semester Examinations"` → `Eligibility indicator shows "Eligible"` → `Click green "Download Hall Ticket"` → `Official Anna University Hall Ticket PDF downloaded with student photograph, registered subject codes, exam dates, and exam hall regulations`

