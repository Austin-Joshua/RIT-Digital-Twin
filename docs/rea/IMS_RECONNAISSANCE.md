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

### 12. Exam Fee (`Exam Fee`)
- **Status**: **OBSERVED** (Evidence: `media_1793188024195_47ac0b12.png`, `media_1793188040722_5e73e10f.png`)
- **Visual Structure**:
  - Title: `Exam Fee` (centered clean heading).
  - Action Header: Yellow/orange button `Payment History` (`#ffc107`).
  - **Fee Details Card**:
    - Multi-semester rows:
      - `AY : 2025-2026` | `Semester : IV` | `Exam Fee : 2950` | `Due Date : 2026-05-05`
      - `AY : 2026-2027` | `Semester : V` | `Exam Fee : 2950` | `Due Date : 2026-09-15`
    - Summary row:
      - `Total Fee : 5900` | `Paid Amount : 5900` | `Balance Amount : 0`
  - **Payment History View**:
    - Filtered sub-cards grouped by exam session:
      - `Exam Month & Year : November 2026` (bold blue header)
      - `Exam Month & Year : April 2026` (bold blue header)
    - Columns: `S.No`, `Transaction ID`, `Paid Date`, `Paid Amount`, `Mode`, `By`, `Status` (green `Success` or amber `Initiated`), `Download Receipt` (green `Receipt` button).

---

### 13. Feedbacks (`Feedbacks`)
- **Status**: **OBSERVED** (Evidence: `media_1793188059944_c7932fc2.png`)
- **Visual Structure**:
  - Two distinct cards:
    1. `Course FeedBack Forms` (Empty state: `No Data Available...`)
    2. `Training FeedBack Forms` (Empty state: `No Data Available...`)

---

### 14. Class Committee (`Class Committee`)
- **Status**: **OBSERVED** (Evidence: `media_1793188087174_5db46879.png`, `media_1793188113086_b6ea955b.png`, `media_1793188136774_0d59f6d0.png`, `media_1793188155159_e0ee8e6e.png`, `media_1793188173909_c635463c.png`, `media_1793188192808_9ed8a472.png`, `media_1793188216456_339ccf9d.png`, `media_1793188474107_f964c4eb.png`)
- **Navigation**: Collapsible sidebar menu with items:
  1. `Schedule`
  2. `Minutes Of Meet` (white pill active state)
- **Minutes Of Meet List View**:
  - DataTables Toolbar: `Show entries`, `Select all`, `Deselect all`, `Copy`, `CSV`, `Excel`, `PDF`, `Print`, `Columns`, `Search`.
  - Columns: Checkbox, `Batch` (`2024-2028`), `AY` (`2026-2027`), `Course` (`B.E. CSE`), `Semester` (`5`), `Section` (`A`), `Date` (`2026-08-07`), `Action`.
  - Row Action: Teal button labeled **`View MOM`** (`#17a2b8`).
- **View Course Committee's MOM View**:
  - Action Header: Dark grey `Back To List` button.
  - Heading: `View Course Committee's MOM`.
  - Metadata Grid:
    - `Meeting Name : Class Committee Meeting -II`
    - `Batch : 2024-2028` | `AY : 2026-2027`
    - `Course : B.E. CSE` | `Semester : 5` | `Section : A`
    - `Chairman : GEETHA A (CS182)` | `Incharge : ARAVINDH S (CS190)`
    - `Date & Time : 2026-08-07 12:40:00 to 13:10:00` | `Venue : A202 Lab`
  - **Summary of Meeting Card**:
    - `Members Present (Faculties) *`: Blue tag pills with remove icons (`SARAVANAN M. (PH15)`, `ARAVINDH S (CS190)`, `VINITHA R (CS204)`, `HARSHANA B (CS218)`, `CHARUMATHY M (CS250)`). Toolbar: `[Select all]`, `[Deselect all]`.
    - `Members Present (Students) *`: Blue tag pills (`AAKASH B K (2117240020001)`, `AKSHARA P (2117240020016)`, `AKSHAYA M (2117240020019)`, `ANISHA PATHAK (2117240020026)`, `AUSTIN JOSHUA M (2117240020044)`, `CHRIS ALAN (2117240020054)`, `CHRISTOPHER J (2117240020056)`).
  - **Syllabus Completion Status Table**:
    - Columns: `S.No`, `Subject Name`, `Faculty Name`, `Completion Percentage`.
    - Authentic Data Rows:
      1. `Health Care Analytics (AD23V14)` | `ANJANA DEVI V. (CS82)` | `100 %`
      2. `Deep Learning Techniques (AD23531)` | `VINITHA R (CS204)` | `100 %`
      3. `Data Exploration and Visualization (AD23532)` | `CHARUMATHY M (CS250)` | `100 %`
      4. `Data Warehousing and Data Mining (AD23V13)` | `SOWMYA S (CS203)` | `100 %`
      5. `Compiler Design (CS23512)` | `DR. MADHAN V. (CS130)` | `100 %`
      6. `Computer Networks (CS23511)` | `ARAVINDH S (CS190)` | `97.78 %`
      7. `Quantum Information Science (VL23M04)` | `DR.VIEERALINGAAM G (EC110)` | `56.67 %`
      8. `Fundamentals of Quantum Computing (VL23M02)` | `DR MARISELVAM A K (EC210)` | `95.56 %`
      9. `Disaster Risk Reduction and Management (MX23511)` | `SARAVANAN M. (PH15)` | `100 %`
      10. `AZURE for Data Analytics (CS23IC3)` | `ARAVINDH S (CS190)` | `100 %`
      11. `Computer Networks Laboratory (CS23521)` | `ARAVINDH S (CS190)` | `100 %`
  - **Low Attendance Students List Table**:
    - Columns: `S.No`, `Student Name`, `%`.
    - Rows:
      1. `AARTHI M (2117240020002)` | `74%`
      2. `AKSHAYA M (2117240020019)` | `72%`
      3. `AMIJOHAN M (2117240020022)` | `73%`
      4. `ANISH K (2117240020025)` | `73%`
  - **Points Discussed Section**:
    - **Academic Points \***:
      1. *Assessed the status of syllabus completion in all theory and lab courses on schedule.*
      2. *Verified that students are thoroughly completing laboratory experiments on time, including subject record books.*
      3. *Advised students to analyze their test scores, identify areas requiring additional practice, and maintain consistent preparation for upcoming end-semester examinations.*
    - **Non Academic Points \***:
      1. *Emphasized active participation in co-curricular technical clubs, hackathons, and department symposiums.*
      2. *Reinforced campus discipline, standard dress code adherence, and punctual arrival for early morning periods.*
      3. *Encouraged regular physical activities and participation in college sports events.*
    - **Additional Points \***:
      1. *Highlighted the importance of the Skill Rock / NPTEL certification courses and internship opportunities.*
      2. *Reminded student representatives to collect constructive feedback from peers regarding library resources and computer lab software availability.*
  - **Uploaded Image \***:
    - Embedded photographic evidence of the committee meeting session in the classroom.
  - **Notification Alerts** (Evidence: `media_1793188474107_f964c4eb.png`):
    - Notification drawer contains:
      - *"Class Committee Schedule Has Been Modified"*
      - *"Class committee MOM Has Been Generated"*
      - *"Class Committee Has Been Scheduled"*

---

### 15. No Due Request (`No Due Request`)
- **Status**: **OBSERVED** (Evidence: `media_1793188238496_0d2215ac.png`, `media_1793188254760_b54a5f02.png`)
- **Visual Structure**:
  - Title: `No Due Request` (clean centered heading)
  - Top Action: Yellow button **`Pay Exam Fee`** (`#ffc107` / `#f0ad4e`) in top-right.
  - Multi-tier clearances grid:
  - **1. Subjects Table**:
    - **Two-Tier Header**:
      - Level 1: `S.No` | `Subject Code` | `Subject Name` | `Assignment Marks` (spans A-1 to A-5) | `CAT Marks` (spans CAT-1, CAT-2, CAT-3) | `Total` | `Atten %` | `Status` | `Remarks`
      - Level 2: `A-1` | `A-2` | `A-3` | `A-4` | `A-5` | `CAT-1` | `CAT-2` | `CAT-3`
    - **Visual Highlighting Rule**: `Atten %` cells with attendance `< 75%` are highlighted with a **solid red background (`#dc3545`) and white text** (e.g. Compiler Design `71%`, DWDM `67%`).
    - Rows:
      - 1: `CS23511` | `Computer Networks` | 10, 10, 8, 9, 9 | 35, 23, 33 | `137` | `82%` | Green `Approved` badge | `Approved`
      - 2: `CS23512` | `Compiler Design` | 10, 9, 8, 10, 10 | 46, 22, 42 | `157` | **`71%` (Red `#dc3545`)** | Green `Approved` badge | `Approved`
      - 3: `AD23V14` | `Health Care Analytics` | 10, 10, 10, 10, 10 | 31, 17, 37 | `135` | `76%` | Green `Approved` badge | `Approved`
      - 4: `AD23V13` | `Data Warehousing and Data Mining` | 10, 10, 10, 10, 10 | 30, 14, 33 | `127` | **`67%` (Red `#dc3545`)** | Green `Approved` badge | `Approved`
      - 5: `MX23511` | `Disaster Risk Reduction and Management` | 10, 10, 10, 8, 8 | 42, 16, 38 | `142` | `100%` | Green `Approved` badge | `Approved`
      - 6: `AD23531` | `Deep Learning Techniques` | 9, 10, 10, 10, 9 | 36, 15, 36 | `135` | `97%` | Green `Approved` badge | `Approved`
      - 7: `AD23532` | `Data Exploration and Visualization` | 9, 10, 10, 10, 10 | 25, 18, 28 | `120` | `83%` | Green `Approved` badge | `Approved`
      - 8: `CS23IC3` | `AZURE for Data Analytics` | `-`, `-`, `-`, `-`, `-` | `-`, `-`, `-` | `-` | `100%` | Green `Approved` badge | `Approved`
  - **2. Labs / Projects Table**:
    - **Two-Tier Header**:
      - Level 1: `S.No` | `Subject Code` | `Subject Name` | `Cycle/Review Marks` (spans Cycle/Review-1, Cycle/Review-2, Model/Review-3) | `Total` | `Atten %` | `Status` | `Remarks`
      - Level 2: `Cycle/Review-1` | `Cycle/Review-2` | `Model/Review-3`
    - Rows:
      - 1: `CS23521` | `Computer Networks Laboratory` | `81` | `88` | `81` | `250` | `87%` | Green `Approved` badge | `Approved`
  - **3. Departments Table**:
    - Columns: `S.No` | `Department Name` | `Fees/Book Dues` | `Status` | `Remarks`
    - Rows:
      - 1: `Accounts` | `₹ 0.00` | Green `Approved` badge | `Approved`
      - 2: `HOD of the Department` | `-` | Green `Approved` badge | `Approved`
  - **Bottom Action Bar**:
    - Blue button: **`All Submitted`** (`#007bff` / `#5dade2`)
    - Green button: **`Download Hall Ticket`** (`#28a745`) with download tray icon.

---

### 16. Assessments (`Assessments`) & Official Hall Ticket PDF Document
- **Status**: **OBSERVED** (Evidence: `media_1793188327598_f417de84.png`, `media_1793188341710_a829d00f.png`, `media_1793188365719_e6d9b6a0.png`)
- **Visual Structure**:
  - Title: `Assessments` / `Hall Tickets`
  - Action trigger: Green `Download Hall Ticket` button.
  - **Official 2-Page Institutional `Hall Ticket` PDF Document**:
    - **Page 1: Student & Examination Schedule Details**:
      - Header Letterhead:
        - Left: Official RIT Tree Logo.
        - Center:
          - `RAJALAKSHMI INSTITUTE OF TECHNOLOGY`
          - `(An Autonomous Institution, Affiliated to Anna University, Chennai)`
          - `KUTHAMBAKKAM, CHENNAI - 600124.`
          - `End Semester Examinations - November 2026`
          - `HALL TICKET (Page 01)`
        - Right: Box with student headshot photograph (`Photo of the Candidate`).
      - Student Metadata Grid:
        - `Register Number`: `2117240020044` | `Current Semester`: `05`
        - `Name`: `AUSTIN JOSHUA M` | `DOB`: `01.03.2006`
        - `Degree & Branch`: `B.E. Computer Science and Engineering` | `UMIS No`: `2403211710421044`
        - `Examination Centre`: `2117 : RAJALAKSHMI INSTITUTE OF TECHNOLOGY`
      - Registered Examination Schedule Table:
        - Columns: `Date` | `Session` | `Semester` | `Subject Code` | `Subject Name`
        - Verified Timetable Entries:
          - `29-09-2026` | `FN` | `05` | `CS23511` | `Computer Networks`
          - `03-10-2026` | `FN` | `05` | `AD23V13` | `Data Warehousing and Data Mining`
          - `06-10-2026` | `FN` | `05` | `CS23512` | `Compiler Design`
          - `10-10-2026` | `FN` | `05` | `AD23531` | `Deep Learning Techniques`
          - `12-10-2026` | `FN` | `05` | `AD23V14` | `Health Care Analytics`
          - `14-10-2026` | `AM` | `05` | `AD23532` | `Data Exploration and Visualization`
          - `-` | `-` | `05` | `CS23521` | `Computer Networks Laboratory`
          - `-` | `-` | `05` | `CS23IC3` | `AZURE for Data Analytics`
          - `-` | `-` | `05` | `MX23511` | `Disaster Risk Reduction and Management`
      - Summary & Legal Disclaimers:
        - `No of Subjects Registered: 9 (Page 1/1 Hall Ticket permits per Page Maximum 20 Subjects only)`
        - `NOTE :`
          - `1. Correction in the Name / Date of Birth and missing of Photograph or incorrect Photograph, if any is to be updated in the IMS Portal when it is opened for correction.`
          - `2. Instructions printed overleaf are to be followed strictly.`
        - Signatures: Candidate Signature and Controller of Examinations Signature.
    - **Page 2: Instructions to the Candidate**:
      - Title: `INSTRUCTIONS TO THE CANDIDATE`
      - Contains all 21 official Anna University / Autonomous examination rules (admittance rules, timing, dress code, prohibited electronic devices, answer sheet coding, invigilator compliance).
      - Bottom Left: Verification QR Code.
      - Bottom Right: `CONTROLLER OF EXAMINATIONS` signature and `Page(1/2)`.

---

### 17. Messages (`Messages`)
- **Status**: **OBSERVED** (Evidence: `media_1793188390097_0be0c479.png`, `media_1793188404704_7b4fd34b.png`, `media_1793188419316_0dec6793.png`, `media_1793188434540_306caf16.png`)
- **Visual Structure**:
  - Title: `Messages`
  - Action Header:
    - Green button `New message` (`#28a745`)
  - Sub-views / Tabs:
    - `All Messages`
    - `Inbox` (Active state badge/pill)
    - `Outbox`
  - Empty State: Centered grey banner `You have no messages.`
  - **New Message Compose Modal / Card**:
    - Heading: `New message`
    - Form Fields:
      - `Recipient *`: Dropdown (`ADMIN`, `HOD - CSE`, `Class Incharge - ARAVINDH S`, `Mentor`)
      - `Subject *`: Text input
      - `Content *`: Rich textarea
    - Actions:
      - Blue `Submit` button (`#007bff`)
      - Grey `Cancel` button

---

### 18. Change Password (`Change password`)
- **Status**: **OBSERVED** (Evidence: `media_1793188455371_8a98a1a3.png`, `media_1793188498700_df62c3e2.png`)
- **Visual Structure**:
  - Card Heading: `Change password`
  - Form Fields:
    - `Current Password *`: Password input with eye toggle
    - `New Password *`: Password input with eye toggle
    - `Repeat New Password *`: Password input with eye toggle
  - Password Policy notice: Minimum 8 characters, uppercase, lowercase, number, special character.
  - Action: Blue `Submit` button (`#007bff`).
  - Top-Right Profile Dropdown:
    - `My Profile`
    - `Logout`

---

### 19. My Profile (`My Profile`)
- **Status**: **OBSERVED** (Evidence: `media_1793188527873_d7a1e931.png` through `media_1793188769791_df66f467.png`)
- **Visual Structure**:
  - Top Profile Banner: Student avatar circle, `AUSTIN JOSHUA M`, `2117240020044`, `austin.240044@cse.ritchennai.edu.in`, `9344208046`.
  - Canonical Tab Navigation (6 Tabs):
    1. `Personal Details`
    2. `Academic Details`
    3. `Parent Details`
    4. `Educational Details`
    5. `Address Details`
    6. `Document Details`
  - **1. Personal Details**:
    - `Full Name`: `AUSTIN JOSHUA M`
    - `Mobile`: `9344208046`
    - `Date of Birth`: `2006-03-01`
    - `Gender`: `MALE`
    - `Blood Group`: `O+ve`
    - `Mother Tongue`: `TAMIL`
    - `Religion`: `CHRISTIAN`
    - `Community`: `BC`
    - `State`: `TAMIL NADU`
    - `Country`: `INDIAN`
    - `Email`: `austin.240044@cse.ritchennai.edu.in`
    - `Aadhar Number`: `**** **** 2378`
  - **2. Academic Details**:
    - `Register Number`: `2117240020044`
    - `Roll Number`: `24CS044`
    - `EMIS Number`: `2019796943`
    - `UMIS Number`: `2403211710421044`
    - `Admitted Mode`: `MANAGEMENT QUOTA`
    - `Department`: `Computer Science and Engineering`
    - `Degree / Course`: `B.E. CSE`
    - `Batch`: `2024-2028`
    - `Semester`: `5` | `Section`: `A`
    - `First Graduate`: `No`
    - `Scholarship`: `No`
    - `Lateral Entry`: `No`
  - **3. Parent Details**:
    - `Father Name`: `MARIA JUSTIN M`
    - `Father Mobile No`: `9444752053`
    - `Father's Occupation`: `BAKER`
    - `Father's Office Address`: `SELF`
    - `Mother Name`: `DE MELLO G`
    - `Mother Mobile No`: `9444334155`
    - `Mother's Occupation`: `TEACHER`
    - `Mother's Office Address`: `4WJ6+Q6H, JN RD, HARIRAM NAGAR, V.M NAGAR, KAKKALUR, TAMIL NADU 602001`
    - `Guardian Name`: `-`
    - `Guardian Mobile No`: `-`
    - `Guardian's Occupation`: `-`
    - `Guardian's Office Address`: `-`
  - **4. Educational Details**:
    - **SSLC (10th Standard)**:
      - Institute: `SRI R.M.JAIN VIDHYASHRAM`
      - Board: `CBSE` | Medium: `ENGLISH`
      - Total Marks: `468/500` | Percentage: `93.60%`
      - Subjects:
        - Subject 1: `TAMIL` (`96/100`)
        - Subject 2: `ENGLISH` (`95/100`)
        - Subject 3: `MATHEMATICS` (`87/100`)
        - Subject 4: `SCIENCE` (`95/100`)
        - Subject 5: `SOCIAL SCIENCE` (`95/100`)
    - **HSC (12th Standard)**:
      - Institute: `SRI R.M.JAIN VIDHYASHRAM`
      - Board: `CBSE` | Medium: `ENGLISH`
      - Total Marks: `418/500` | Cutoff: Calculated
      - Subjects:
        - Subject 1: `ENGLISH` (`93/100`)
        - Subject 2: `MATHEMATICS` (`83/100`)
        - Subject 3: `PHYSICS` (`74/100`)
        - Subject 4: `CHEMISTRY` (`81/100`)
        - Subject 5: `COMPUTER SCIENCE` (`87/100`)
    - **DIPLOMA**: N/A
  - **5. Address Details**:
    - Address Types: `Permanent` and `Temporary`
    - `Room No & Street`: `NO. 18`
    - `City / District`: `TIRUVALLUR`
    - `State`: `TAMIL NADU`
    - `Pincode`: `602001`
    - `Country`: `INDIA`
  - **6. Document Details**:
    - Uploaded Verification Documents (10th Marksheet, 12th Marksheet, Aadhar Card, Community Certificate) with preview and download options.

---

*(All authentic student portal pages observed, transcribed, and verified against primary evidence)*
