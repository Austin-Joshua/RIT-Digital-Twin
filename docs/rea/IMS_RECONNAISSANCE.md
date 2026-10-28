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

### 06. Apply Certificates (`Apply Certificates`)
- **Status**: **OBSERVED & WORKFLOW VERIFIED** (Evidence: `media_1793187224431_ed85f313.png` through `media_1793187515978_ad4a51b2.png`)
- **Visual Structure**:
  - **Action Header**: Solid green button in top left: `Apply Certificate` (`#28a745`, white text).
  - **Certificate Application List Card**:
    - DataTables Controls: `Show [ 10 ] entries` and `Search: [ _________ ]`.
    - Columns:
      1. `S.No ⇅`
      2. `Date ⇅`
      3. `Certificate ⇅`
      4. `Purpose ⇅`
      5. `Status ⇅` (e.g. `Submitted For AO Verification` rendered in amber text)
      6. `Response ⇅`
      7. `Action`
    - Action Buttons in Row:
      - Teal/cyan `Edit` button (`#17a2b8`, white text)
      - Red `Delete` button (`#dc3545`, white text)
    - Empty state: `No data available in table`.
    - Table footer: `Showing X to Y of Z entries` / `Previous  1  Next`.
  - **Apply / Edit Certificate Modal Dialog**:
    - Header: Close button `×` on top right.
    - Fields:
      - `Certificate *`: Dropdown options (`Select Certificate`, `BONAFIDE`, `TC`, `COURSE COMPLETION`).
      - `Date *`: Date input (`YYYY-MM-DD`).
      - `Reason *`: Dropdown options (`Select Reason`, `Labour Welfare Board Scholarship`, `Farmer Welfare Scheme Scholarship`, `Construction Workers Welfare Board Scholarship`, `Higher Studies`, `Internship`).
      - `Hosteler *`: Dropdown select (`No` / `Yes`).
      - `Hostel Room No *`: Text input (displayed when Hosteler is relevant).
    - Actions:
      - Amber/gold `Preview` button (`#ffc107` / `#e0a800`) opens document preview.
      - Bottom-right button: Green outline labeled `Apply` on creation, switches to `Update` in edit mode (`border: 1px solid #28a745; color: #28a745;`).
  - **BONAFIDE Certificate Preview Modal**:
    - Header: Blue text `BONAFIDE Certificate Preview` with `×` close icon.
    - Formal document card:
      - Top right: `Date : DD-MM-YYYY`
      - Title: `BONAFIDE CERTIFICATE` (bold black uppercase).
      - Body text:
        `This is to certify that Mr. [STUDENT NAME]. Register No : [REG_NO], S/o Mr. [FATHER_NAME], is a bonafide student of our college studying in [YEAR] Year B.E., Degree course in [DEPARTMENT] during the academic year [AY].`
        `This Certificate is issued to enable him to apply for [PURPOSE] .`
      - Signature line at bottom right: `Principal`.
  - **SweetAlert Interaction Dialogs**:
    - **Creation Success**: Green circle with checkmark `✔`, message: `Certificate Applied Successfully`, blue `OK` button.
    - **Deletion Prompt**: Amber exclamation mark `!`, title: `Are You Sure?`, subtitle: `Do You Really Want To Delete !`, buttons: `No` (grey) and `Yes` (blue).
    - **Deletion Success**: Green circle with checkmark `✔`, message: `Certificate Application Deleted`, blue `OK` button. Table instantly clears back to empty state.

---

### 07. CAT Mark (`CAT Mark`)
- **Status**: **OBSERVED** (Evidence: `media_1793187558157_5c2321d9.png`, `media_1793187574467_97523814.png`)
- **Visual Structure**:
  - Title: `CAT Marks` (centered clean heading).
  - Two-Tier Header Hierarchy:
    - Tier 1 Header:
      - Blank above `Subject Code`, `Subject Name`, `Faculty Name`
      - `CAT - 1/III/05` (above CO-1)
      - `CAT - 1/III/05` (above CO-2)
      - `CAT- II/III/05` (above CO-3)
      - `CAT- III/III/05` (above CO-4)
      - `CAT- III/III/05` (above CO-5)
      - Blank above `Total (125 Marks)` and `Internal Weightage`
    - Tier 2 Header:
      - `Subject Code`
      - `Subject Name`
      - `Faculty Name`
      - `CO-1 (25 Marks)`
      - `CO-2 (25 Marks)`
      - `CO-3 (25 Marks)`
      - `CO-4 (25 Marks)`
      - `CO-5 (25 Marks)`
      - `Total (125 Marks)`
      - `Internal Weightage` (e.g. `21.84/30`, `26.4/30`, `18.48/30`, `57.6/75`, `13.92/20`, `11.36/20`)
  - Rows: Course scores mapped across all 5 Course Outcomes and computed against total internal weightage.

---

### 08. LAB Mark (`LAB Mark`)
- **Status**: **OBSERVED** (Evidence: `media_1793187594919_d30bb404.png`)
- **Visual Structure**:
  - Title: `LAB Marks` (centered clean heading).
  - Two-Tier Header Hierarchy:
    - Tier 1 Header:
      - `Exam Name:` spanning over `Cycle-1`, `Cycle-2`, `Model Exam`
    - Tier 2 Header:
      - `Subject Code`
      - `Subject Name`
      - `Faculty Name`
      - `100 Marks` (under `Cycle-1`)
      - `100 Marks` (under `Cycle-2`)
      - `100 Marks` (under `Model Exam`)
      - `Total (300 Marks)`
  - Highlighting / Alert Rule:
    - Incomplete or zero totals are highlighted with a **solid crimson/red background (`#dc3545`) with white text** (e.g. Total `0` or `142`).
    - Standard passing scores have clean white backgrounds.

---

### 09. Assignment Mark (`Assignment Mark`)
- **Status**: **OBSERVED** (Evidence: `media_1793187614417_1a497cbd.png` through `media_1793187700925_7155e557.png`)
- **Visual Structure**:
  - Title: `Assignment Marks` (centered clean heading).
  - Main Table Card:
    - Columns:
      1. `Subject Code` (shows Course Title in original IMS view)
      2. `Subject Name` (shows Course Code e.g. `CS23511`, `CS23512` in original IMS view)
      3. `Faculty Name` (e.g. `ARAVINDH`, `DR. MADHAN`, `ANJANA DEVI`, `SOWMYA`, `VINITHA`, `CHARUMATHY`)
      4. `Assignment Mark-1 (10-Marks)`
      5. `Assignment Mark-2 (10-Marks)`
      6. `Assignment Mark-3 (10-Marks)`
      7. `Assignment Mark-4 (10-Marks)`
      8. `Assignment Mark-5 (10-Marks)`
      9. `Total (50 - Marks)`
  - Data Layout:
    - 5 assignments evaluated out of 10 marks each.
    - Total evaluated out of 50 marks.
    - Supports course-wise score breakdowns.

---

### 10. Grade Book (`Grade Book`)
- **Status**: **OBSERVED** (Evidence: `media_1793187719944_ade78812.png` through `media_1793187837601_9720d71e.png`)
- **Visual Structure**:
  - Title: `Grade Book` (clean left-aligned heading).
  - Filter Card:
    - `Semester *`: Select dropdown (`Select Semester`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`).
    - Blue button: `Submit` (`#007bff`, solid blue).
  - Results Table & Action Bar:
    - DataTables Controls: `Show [ 10 ] entries`, `Search: [ _________ ]`.
    - Dedicated Action Button: Blue button labeled **`Download PDF`** (`#007bff`, solid blue).
    - Table Columns:
      1. Checkbox column
      2. `Academic Year ⇅` (e.g. `2025-2026`)
      3. `Semester ⇅` (e.g. `04` with leading zero)
      4. `Subject Code ⇅` (e.g. `CS23411`)
      5. `Subject Title ⇅` (e.g. `Database Management Systems`)
      6. `Grade ⇅` (e.g. `A`, `B+`, `A+`, `RA`)
      7. `Result ⇅` (e.g. `PASS`, `RA`)
      8. `Exam Month and Exam Year ⇅` (e.g. `April 2026`)
  - **Official Regulatory Grading Legend** (printed directly beneath the table):
    - `RA – Reappearance is required`
    - `RA* - Absent for End Exam`
    - `W/WD – Withdrawal`
    - `SA – Shortage of Attendance`
    - `SE – Sports Exemption`
    - `WH1 – Suspected Malpractice`
    - `WH2 – Contact COE office`
  - **Official `Semester Results` PDF Generation**:
    - Header: RIT Tree Logo, `Rajalakshmi Institute of Technology`, `(An Autonomous Institution, Affiliated to Anna University, Chennai)`, `Kuthambakkam, Chennai - 600124`.
    - Document Title: `Semester Results`.
    - Metadata Box:
      - `Student Name : [NAME]` | `Academic Year : [AY]`
      - `Register No : [REG_NO]` | `Semester : [SEM]`
      - `Course : B.E. CSE`
    - Columns: `Subject Semester`, `Subject Code`, `Subject Title`, `Grade`, `Result`, `Exam Date`.

---

### 11. Academic Fee (`Academic Fee`)
- **Status**: **OBSERVED & WORKFLOW VERIFIED** (Evidence: `media_1793187867080_0363baba.png` through `media_1793187967746_d1b9e692.png`)
- **Visual Structure**:
  - Title: `Academic Fee` (centered clean heading).
  - **Top Action Bar**:
    - Green button: `Pay Academic Fee` (`#28a745`, white text)
    - Yellow button: `Payment History` (`#ffc107`, dark text)
    - Red button: `Consolidated Receipt` (`#dc3545`, white text)
    - In sub-views (`Payment History`, `Consolidated Receipt`), an additional dark grey `Back` button (`#6c757d`) appears.
  - **Card 1: Student Details**:
    - Key-value metadata: `Course : B.E. CSE` | `Admitted Mode : MANAGEMENT QUOTA`
  - **Card 2: Fee Details Ledger (3-Column Grid)**:
    - Row 1: `Current AY : 2026-2027` | `Opening Balance : 0` | `Tuition Fee : 87000`
    - Row 2: `Hostel Fee : 0` | `Other Fee : 138000` | `AU / Library Fee : 625`
    - Row 3: `Fine & Breakage : 0` | `Total Fee : 225625` | `Paid Amount : 225625`
    - Row 4: `Reversal Amount : 0` | `Balance Amount : 0` | `Wallet Balance : 0`
    - Row 5: `Last Updated On : 2026-04-28`
  - **Pay Academic Fee Modal Dialog**:
    - Header: Close button `×`.
    - Status line: `Balance : 0` | `Wallet Balance : 0`.
    - Input: `Enter Amount *` (required numeric input).
    - Action: Green `Pay` button (`#28a745`) on bottom right.
  - **Payment History View**:
    - Card header: `Payment History` with sub-heading `AY : 2026-2027` (bold blue).
    - Columns: `S.No`, `Transaction ID`, `Paid Date`, `Paid Amount`, `Mode`, `By`, `Status` (green `Success`), `Download Receipt` (green `Receipt` button).
  - **Consolidated Receipts View**:
    - Card header: `Consolidated Receipts`.
    - Columns: `S.No`, `AY`, `Total Fee`, `Paid Fee`, `Download Receipt` (green `Receipt` button).
  - **Official `Fee Receipt` PDF Document**:
    - Header: RIT Tree Logo, `Rajalakshmi Institute of Technology`, `Accredited by NAAC...`, `Fee Receipt`.
    - Meta box: `Receipt No : 2026-2027/1178`, `Date : 28-04-2026`, `AUSTIN JOSHUA M`, `2117240020044`, `B.E. CSE / III`.
    - Table: `Particulars` (`Tuition Fee`, `Other Fee`, `AU / Library Fee`) | `Amount (₹)`.
    - Summary & Legal: `NEFT No`, `Rupees (₹) in words`, `Note : Cheque subject to realisation`, `Computer generated receipt, no signature required`.
  - **Official `Consolidated Receipt` PDF Document** (Evidence: `media_1793187997759_66589766.png`):
    - Document Title: `Consolidated Receipt (2026-2027)`.
    - Metadata: `AUSTIN JOSHUA M`, `2117240020044`, `B.E. CSE / III`.
    - Ledger Table: `Date` (`28-04-2026`), `NEFT No` (`138736812`), `Particulars` (Tuition Fee, Other Fee, AU/Library Fee), `Amount` (87000, 138000, 625), `Total Amount (₹)` (`225625`), and a bottom `Summary` row.
    - Legal disclaimer: `Rupees (₹)` in words, `Cheque subject to realisation`, and computer generated disclaimer.

---

*(Additional pages will be appended progressively as evidence is uploaded by the user)*
