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
   - Background: Pure White (`#FFFFFF`).
   - Left: Hamburger toggle button (`☰`), dark icon.
   - Right: Notification bell icon (`🔔`) with unread indicator dot.
   - User Profile Button: Solid royal blue pill/rectangle (`#007bff` / `#0d6efd`) featuring a white user silhouette icon and the student's uppercase name: `AUSTIN JOSHUA M`.
2. **Left Navigation Drawer (Sidebar)**:
   - Header: Official RIT Tree Logo + Text: "RAJALAKSHMI INSTITUTE OF TECHNOLOGY".
   - Search input: Rounded grey container `🔍 Search...`.
   - Sidebar theme: Charcoal dark (`#2c3b41` / `#222d32`).
   - Item styling: White icon, white font, highlighted active state is a vibrant blue pill with rounded ends (`#007bff`).
   - Full Nav Item Order observed:
     1. `Dashboard` (active)
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
      - Header row: Light blue header (`#cfe2ff` / `#d1ecf1`), columns `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`.
      - Sunday column highlighted with soft pink holiday background (`#f8d7da` / `#ffebee`).
      - Saturday column highlighted with soft pink holiday background.
      - "Today" cell highlighted in solid deep teal (`#17a2b8` / `#008b8b`) with bold white text (e.g. `28`).
- **Interaction Behaviour**: Clicking a weekday within the semester window opens the day's period-wise timetable breakdown.

---

### 03. My Time Table (`My Time Table`)
- **Status**: **OBSERVED** (Evidence: `media_1793186951849_8792f201.png`, `media_1793186973131_fb5439c3.png`, `media_1793186989023_18d70c30.png`)
- **Visual Structure**:
  - **Class Header Badge**: Bright blue rectangular pill in top left: `Class : B.E. CSE / 5 / A` (White text, `#007bff`).
  - **Timetable Matrix Table**:
    - Columns (7 total):
      - `DAY`
      - `MON DAY`
      - `TUES DAY`
      - `WEDNES DAY`
      - `THURS DAY`
      - `FRI DAY`
      - `SATUR DAY`
      *(Note: Day names are uppercase with space before "DAY")*.
    - Rows: Numbered 1 to 7 (`1`, `2`, `3`, `4`, `5`, `6`, `7`).
    - Cell Card Styling:
      - White background, light blue/grey border (`1px solid #cce5ff`).
      - Centered layout within each card.
      - Field 1: Label `Subject` (dark grey/black, bold 600).
      - Field 2: Blue bold text: `[Subject Name] ([Subject Code])`, e.g., `Deep Learning Techniques (AD23531)`, `Compiler Design (CS23512)`.
      - Field 3: Label `Staff` (dark grey/black, bold 600).
      - Field 4: Blue bold text: `[Staff Name] ([Staff Code])`, e.g., `VINITHA R (CS204)`, `DR. MADHAN V. (CS130)`.
    - Special Period Content:
      - Non-course periods:
        - `Mentoring` / `Staff: SOWMYA S (CS203)` (e.g., Thurs Period 6, Fri Period 7).
        - `Training & placement` / `Staff: ARAVINDH S (CS190)` (e.g., Fri Period 6).
      - Laboratory blocks (spanning multiple periods or merged).
      - Elective options (stacked multiple subject/staff cards within a single cell, e.g., Period 3 Mon/Tue for `Health Care Analytics`).
      - Empty cells for unscheduled slots.

---

*(Additional pages will be appended progressively as evidence is uploaded by the user)*
