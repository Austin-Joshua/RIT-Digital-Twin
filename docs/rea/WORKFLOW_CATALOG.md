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

