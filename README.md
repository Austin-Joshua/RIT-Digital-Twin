# RIT Digital Twin

Intelligent university system for RIT: ERP records, a spatial digital twin, campus state, prediction, simulation, and decision support. React + Spring Boot + MySQL.

RIT Digital Twin is not a live sensor network. Occupancy is estimated from timetable section size against room capacity. Energy is a stored planning formula (`base load + 5.5 kW` per scheduled class) and is labeled simulated, not metered. Crowd history is used for a prediction only when stored samples exist. Scenario results are simulated and do not replace campus state. Authorization stores a planning choice. It does not change rooms, transport, or broadcasts.

Source labels stay explicit: LIVE, SIMULATED, HISTORICAL, PREDICTED, ESTIMATED. A missing source stays empty. It is not filled with a replacement number.

The admin loop is Campus → Alerts → Decisions, with Map and Simulation as the next step for the same building. Demo cards are a labeled script and do not write campus records.

## Quick Start

### Prerequisites
- Node.js 20+
- Java 21+
- MySQL 8+

### Local setup
```bash
npm install
cd frontend && npm install
cd ../backend && ./mvnw clean package -DskipTests
```

### Environment
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### Run
- Backend: `cd backend && ./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"`
- Frontend: `cd frontend && npm run dev`

## Accounts

There are no production passwords. `ADM-001` and the older faculty, HOD, student, and parent addresses are not login credentials. Do not reuse a local demo password on a reachable database.

### Local DEMO profile only

The `dev` profile loads a labeled DEMO dataset so RIT Digital Twin can be exercised. It is not live, historical, or sensor data. It does not write crowd history, GPS, meter readings, or a prediction confidence.

On each local startup the profile realigns one timetable slot to the current Asia/Kolkata clock so the slot is in progress. It does not change the system clock. It rewrites passwords only for these five accounts:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `DEMO-ADM` | `Demo-CampusOS-2026` |
| HOD | `DEMO-HOD` | `Demo-CampusOS-2026` |
| Faculty | `DEMO-FAC` | `Demo-CampusOS-2026` |
| Student | `DEMO-STU` | `Demo-CampusOS-2026` |
| Parent | `DEMO-PAR` | `Demo-CampusOS-2026` |

Expected local state after startup:

1. Building `DEMO-MAIN` / Main Academic Block, stored base load `150.00` kW. The 3D mesh matches that name only for drawing. Operational identity is the numeric building id.
2. Room A capacity 60 and Room B capacity 40, both stored classrooms of that building.
3. Section `CSE-A` large enough that section size divided by Room B capacity is over 100 percent. The alert percentage is calculated, not stored.
4. One DEMO timetable slot in Room B covering the current campus clock. Source label is ESTIMATED.
5. `DEMO-ANNEX` / Unmetered Annex has no base load, so energy is unavailable, not zero.
6. Crowd prediction stays unavailable until stored historical density samples exist.
7. Authorizing a decision writes `campus_decision` and does not change the timetable, room capacity, or alert.

## Major surfaces

- Admin home (`/`): RIT Digital Twin command, alerts, decisions, labeled sources
- HOD campus state (`/hod/twin`), map (`/hod/map`), and simulation (`/hod/simulation`): the same campus records the HOD APIs already allow. Decision authorization is available only where the backend already allows HOD.
- Faculty campus state (`/faculty/twin`) and map (`/faculty/map`): rooms, alerts, and decision visibility. Faculty cannot run a simulation or authorize a decision.
- Spatial map (`/map`): campus, building, room. Past / Now / Next slot. Admin route. HOD and faculty use their own map routes.
- Simulation lab (`/simulations`): what-if scenarios, labeled simulated. Admin route. HOD uses `/hod/simulation`. Faculty has no run action.
- RIT Digital Twin Copilot: answers from records this login can already see. Optional Gemini wording stays on the backend.
- Roles: Admin, HOD, Faculty, Student, Parent. Navigation hides items the role cannot use
- Existing ERP: timetable, classrooms, attendance, marks, fees, certificates, transport, people
- JWT auth with refresh. WebSocket campus updates require a token
- Audit smoke script: `powershell -ExecutionPolicy Bypass -File ".\audit-smoke.ps1"`

## Testing

```bash
cd frontend
npm run test
npm run test:coverage
```

### Class logins

CSE-A and CSBS-C keep one account for each student. Three sign-ins resolve to that same holder and are not rewritten after a password change:

- Register number + password `Rit-` plus the last 6 digits of the register number
- Register number + phone. If no phone was stored, the local phone is `9` plus the last 9 digits of the register number
- College email `{register}@cse.ritchennai.edu.in` or `{register}@csbs.ritchennai.edu.in` + that same phone

The parent of that student is a separate account: username `P-{register}`, password `Rit-Mock-2026`, phone `8` plus the last 9 digits, email `{register}.parent@cse.ritchennai.edu.in` or `@csbs.ritchennai.edu.in`. Username, email, and phone all open that parent account, not the student account.

Other staff logins that have never changed their password use mock password `Rit-Mock-2026`. Username and email stay as stored. A missing phone is filled from the account id and is accepted as the password for that same account. `DEMO-*` passwords are left to the local DEMO profile.

Five wrong secrets lock the account. A later correct login clears the counter. Changing a password revokes the previous refresh session.

### Gemini

The copilot can ask Gemini to explain campus records the signed-in role is already allowed to see. Gemini does not calculate occupancy, energy, or predictions, and it cannot change campus records.

Set the key only in the backend environment. Do not put it in `frontend/.env`, Vite variables, or the browser.

```bash
GEMINI_API_KEY=<your-local-key>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_ENABLED=true
GEMINI_TIMEOUT_MS=30000
```

Leave `GEMINI_API_KEY` empty if you do not want the model. The copilot then keeps its stored answer and says AI assistance is temporarily unavailable.

### Schema

Development uses Hibernate `ddl-auto: update` so the local DEMO profile can start. Production uses Flyway (`ddl-auto: none`) and the scripts in `backend/src/main/resources/db/migration`. Do not run a destructive migration against an existing database.

## Deployment

- Frontend: Vercel (`vercel.json`)
- Backend: Render (`render.yaml`) or Railway (`railway.json`)
- Backend image support: `backend/Dockerfile`
