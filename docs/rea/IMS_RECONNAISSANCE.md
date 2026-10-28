# RIT IMS Reconnaissance Log

**Reference System**: RIT IMS (`https://ims.ritchennai.edu.in`)  
**Access Scope**: Student-level authenticated session (authorized student account)  
**Safety Protocol**:
- No extraction or storage of passwords, cookies, authorization tokens, or sensitive personal student records.
- All evidence gathered via sanitized visual screenshots and observable user-facing behaviour.
- Hypotheses clearly distinguished from verified observations.

---

## Global Chrome & Application Shell Observations

From Primary Evidence (`media_1793186912831_0f9af050.png`):
1. **Top Bar**:
   - Background: Pure White (`#FFFFFF`), subtle bottom hairline border.
   - Left: Hamburger toggle button (`☰`), dark icon.
   - Right: Notification bell icon (`🔔`) with unread indicator dot.
   - User Profile Button: Solid royal blue pill/rectangle (`#007bff` / `#0d6efd`) featuring a white user silhouette icon and the student's uppercase name: `AUSTIN JOSHUA M`.
2. **Left Navigation Drawer (Sidebar)**:
   - Header: Official RIT Tree Logo + Text: "RAJALAKSHMI INSTITUTE OF TECHNOLOGY".
   - Search input: Rounded grey container `🔍 Search...`.
   - Sidebar theme: Charcoal dark (`#2c3b41` / `#222d32`).
   - Item styling: White icon, white font, highlighted active state is a vibrant blue pill with rounded ends (`#007bff`).
   - Full Nav Item Order observed:
     1. `Dashboard`
     2. `My Time Table`
     3. `My Subject Registration`
     4. `Apply Leave / OD`
     5. `Attendance`
     6. `Apply Certificates`
     7. `CAT Mark`
     8. `LAB Mark`
     9. `Assignment Mark`
     10. `Grade Book`
     11. `Academic Fee`
     12. `Exam Fee`
     13. `Feedbacks`
3. **Footer**:
   - Left: `© All rights reserved.`
   - Right: RIT tree icon + `RIT-IMS`.

---

## Page-by-Page Reconnaissance Register

### 01. Login Page (`/login`)
- **Status**: OBSERVED
- **Visual Structure**: Split-screen branded login shell with institutional logo.
- **Interaction Behaviour**: Multi-role authentication with lockout countdown.

---

### 02. Student Dashboard / Home Page
- **Status**: **OBSERVED** (Evidence: `media_1793186912831_0f9af050.png`, `media_1793186930301_24ff61ae.png`)
- **Visual Structure**:
  - **KPI Metric Row**: 4 clean white rounded cards with subtle drop shadow:
    1. **CGPA**: Green circular donut progress ring (`#28a745`), showing center value `7.69`. Label: `CGPA`, Bold Stat: `7.69 / 10`, Subtext: `Overall performance`.
    2. **ATTENDANCE**: Teal/cyan circular donut progress ring (`#17a2b8`), showing center value `77%`. Label: `ATTENDANCE`, Bold Stat: `77%`, Subtext: `Average this semester`.
    3. **ARREARS**: Clean numeral card, showing `0` on left. Label: `ARREARS`, Bold Stat: `0`.
    4. **FEES PENDING**: Orange/gold circular donut progress ring (`#fd7e14` / `#f0ad4e`), showing center text `100% Paid`. Label: `FEES PENDING`, Bold Stat: `₹0`, Subtext: `AY 2026-2027`.
  - **Academic Calendar Card**:
    - Header: Month & Year (`October 2026`).
    - Legend:
      - Pale pink/red swatch: `Holiday`
      - Soft blue swatch: `No order Day`
      - Dark teal swatch: `Today`
    - Subtext 1: `✔ Semester period: 08 Jun 2026 – 12 Sep 2026`.
    - Subtext 2: `ℹ Click any weekday within the semester period to view that day's period-wise timetable.`
    - Calendar Grid:
      - Header row: Light blue header (`#cfe2ff`), columns `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`.
      - Sunday column highlighted with soft pink holiday background (`#f8d7da`).
      - Saturday column highlighted with soft pink holiday background.
      - "Today" cell highlighted in solid deep teal (`#17a2b8`) with bold white text (e.g. `28`).
- **Interaction Behaviour**: Clicking a weekday within the semester window opens the day's period-wise timetable breakdown.

---

### 03. My Time Table (`My Time Table`)
- **Status**: **OBSERVED** (Evidence: `media_1793186951849_8792f201.png`, `media_1793186973131_fb5439c3.png`, `media_1793186989023_18d70c30.png`, `media_1793187037292_f1d8e536.png`)
- **Visual Structure**:
  - **Class Header Badge**: Bright blue rectangular pill in top left: `Class : B.E. CSE / 5 / A` (White text on `#007bff`).
  - **Timetable Matrix Table**:
    - Columns (7 total):
      - `DAY`
      - `MON DAY`
      - `TUES DAY`
      - `WEDNES DAY`
      - `THURS DAY`
      - `FRI DAY`
      - `SATUR DAY`
      *(Day names are uppercase with space before "DAY")*.
    - Rows: **9 Periods total** (`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`).
    - Cell Card Styling:
      - White background, light blue/grey border (`1px solid #cce5ff`).
      - Centered layout within each card.
      - Field 1: Label `Subject` (dark grey/black, bold 600).
      - Field 2: Blue bold text: `[Subject Name] ([Subject Code])`, e.g., `Deep Learning Techniques (AD23531)`.
      - Field 3: Label `Staff` (dark grey/black, bold 600).
      - Field 4: Blue bold text: `[Staff Name] ([Staff Code])`, e.g., `VINITHA R (CS204)`.
    - Special Period Content:
      - `Mentoring` / `Staff: SOWMYA S (CS203)` (Thurs Period 6, Fri Period 7).
      - `Training & placement` / `Staff: ARAVINDH S (CS190)` (Fri Period 6).
      - Multidisciplinary / Honors / Minor Electives in Periods 8 & 9 (e.g. `Fundamentals of Quantum Computing (VL23M02)`, `Quantum Information Science (VL23M04)`).
      - Laboratory blocks (spanning multiple periods or merged).
      - Elective options (stacked multiple subject/staff cards within a single cell).
      - Empty cells for unscheduled slots.

---

### 04. Apply Leave / OD (`Apply Leave / OD`)
- **Status**: **OBSERVED** (Evidence: `media_1793187059834_e565fc87.png`, `media_1793187078989_c488d8c6.png`)
- **Visual Structure**:
  - Container Header: `Leave Form` (Clean blue heading).
  - Main Card: White card with border and light shadow.
  - Form Fields Layout (2-column grid):
    - Row 1:
      - `Leave Type`: Dropdown select with options:
        1. `Select Leave Type` (default prompt)
        2. `Leave`
        3. `OD`
      - `From Date`: Date input with placeholder `Enter From Date` (renders `YYYY-MM-DD` value upon selection).
    - Row 2:
      - `To Date`: Date input with placeholder `Enter To Date`.
      - `Reason`: Single-line text input with placeholder `Enter Reason`.
    - Row 3:
      - `Documents`: Standard browser file selector (`Choose File` / `No file chosen`).
      - Helper caption below file input: `file should be in 2MB. PNG, JPG ,JPEG Formats Only` (blue text).
    - Actions:
      - Bottom right aligned button: `Request` (solid royal blue button `#007bff`, white text, rounded corners).

---

### 05. Attendance (`Attendance`)
- **Status**: **OBSERVED** (Evidence: `media_1793187165833_95845726.png`, `media_1793187187717_b97ec8df.png`)
- **Visual Structure**:
  - Page Title: `Attendence Report` (centered/clean header).
  - Context Meta Header:
    - Left: `Academic Year : 2026-2027`
    - Right: `Semester: V` (Roman numeral format).
  - DataTables Toolbar:
    - Left controls:
      - `Show [ 10 ] entries` dropdown.
      - Action button: `Select all` (solid blue `#007bff`).
      - Action button: `Deselect all` (solid blue `#007bff`).
      - Export buttons: `Copy` | `CSV` | `Excel` | `PDF` | `Print` | `Columns` (grey border buttons).
    - Right controls:
      - `Search: [ _________ ]`
  - Data Table:
    - Columns:
      1. Checkbox column (selection for batch operations)
      2. `Sl/No ⇅`
      3. `Subject Code ⇅`
      4. `Subject Name ⇅`
      5. `Faculty Name ⇅`
      6. `No Of Periods Attended ⇅`
      7. `Total No Of Periods ⇅`
      8. `Attendance Percentage ⇅`
      9. `Action`
    - **Visual Threshold Highlighting**:
      - Any attendance percentage `< 75%` is highlighted with a **solid amber/gold background (`#ffc107`)** across the cell with dark bold text (e.g., Row 2: 71%, Row 4: 67%).
      - Standard percentages (>= 75%) have clean white backgrounds.
    - Action Column: Blue button labeled `view` in each row.
  - Footer & Statutory Regulatory Notice:
    - Pagination summary: `Showing 1 to 9 of 9 entries` / `Previous  1  Next`.
    - Notice in bold blue font:
      `Important : If you secured less than 75% attendance, not eligible to write the particular subject.`

---

*(Additional pages will be appended progressively as evidence is uploaded by the user)*
