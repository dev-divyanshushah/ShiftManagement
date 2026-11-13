# ShiftFlow WFM – Project Supervisor Handover & Evaluation Guide

**Target Audience:** Project Supervisor / Academic Evaluator / Lead Systems Architect  
**Project:** ShiftFlow Intelligent Workforce Management Platform  
**Repository Branch:** `main`  
**Handover Status:** Complete, Verified & Deployment-Ready  

---

## 1. Quick Start Guide (5-Minute Evaluation)

To inspect, evaluate, and test the entire platform on any standard development machine (Windows, macOS, or Linux):

```bash
# Step 1: Install dependencies
npm install

# Step 2: Initialize the relational database & seed benchmark records
npm run db:setup

# Step 3: Run the automated test suite (Unit & Integration tests)
npm test

# Step 4: Launch full-stack application (Frontend on :3000, Backend on :5000)
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and the backend API at [http://localhost:5000/api/health](http://localhost:5000/api/health).

---

## 2. Pre-Configured Benchmark Accounts

| Role | Email | Password | Pre-Assigned Profile | Key Modules Accessible |
| :--- | :--- | :--- | :--- | :--- |
| **Operations Manager** | `manager@shiftflow.com` | `Manager@123` | Alexandra Vance (Director of Operations) | Overview, Scheduler, Employees, Shift Templates, Break Allocation, Demand Forecast, Conflicts, Reports, Settings |
| **Frontline Specialist** | `employee@shiftflow.com` (or `EMP-1001`) | `Employee@123` | Sarah Jenkins (Senior Support Specialist) | My Dashboard, My Schedule, My Breaks, Leave Requests, Shift Swaps, My Availability, My Profile |

*Authorized Registration Invitation Codes:*
- Manager Registration: `MGR-APEX-2026`
- Employee Registration: `APEX-STAFF-2026`

---

## 3. Architecture & Verification

The codebase is organized into clean, decoupled tiers:

1. **Frontend (`/src`)**:
   - Modern React 18 single-page app built with Vite and Tailwind CSS.
   - Preserves 100% of the approved visual design system (Linear / Ramp inspired).
   - Driven by centralized contexts (`AppContext` and `AuthContext`) communicating with the backend via a unified fetch client (`src/utils/api.js`).

2. **Backend Server (`/backend`)**:
   - Built on Node.js and Express.js (ES module syntax).
   - Protected by `helmet`, strict CORS, `express-rate-limit`, and cookie parsing.
   - Enforces server-side RBAC: `requireRole('MANAGER')` and `requireSelfOrManager`. An employee ID supplied in client payloads is never trusted without session verification.

3. **Data Layer (`/prisma`)**:
   - Prisma ORM schema featuring 14 relational models:
     `Organization`, `User`, `Department`, `Skill`, `Employee`, `EmployeeSkill`, `EmployeeAvailability`, `ShiftTemplate`, `AssignedShift`, `BreakSchedule`, `LeaveRequest`, `ShiftSwapRequest`, `SchedulingConflict`, `Notification`, and `AuditLog`.
   - Uses SQLite (`dev.db`) locally for zero-dependency instant startup, and PostgreSQL 16 (`prisma/schema.postgresql.prisma`) for containerized deployment.

4. **Business Logic Engines (`/backend/services`)**:
   - `schedulingEngine.js`: Multi-pass heuristic constraint satisfaction solver separating Hard Constraints from Soft Preferences.
   - `breakAllocationService.js`: Dynamic meal/rest window generator preserving at least 70% floor staffing coverage against hourly Erlang-C call curves.
   - `conflictService.js`: Collision validator that performs real database modifications upon resolution.
   - `auditService.js`: Transactional operational change tracking.

---

## 4. Test Suite Execution & Results

The test suite contains **25 automated tests** across 5 test suites.

To run tests:
```bash
npm test
```

### Test Coverage Summary:
- **Unit Tests (12 Tests)**:
  - `tests/unit/schedulingEngine.test.js`: Validates interval overlap logic, max weekly hours limits (`maxHoursPerWeek`), contractual day availability, role qualifications, and capacity shortfall detection.
  - `tests/unit/breakAllocation.test.js`: Validates break boundary rules and staggered distribution across staff.
  - `tests/unit/conflictDetection.test.js`: Validates detection of shift overlaps, statutory overtime, rest day assignments, and approved leave collisions.
- **Integration Tests (13 Tests)**:
  - `tests/integration/auth.test.js`: Validates login, password hash verification, role assignment, unauthorized invite code rejection, and route protection.
  - `tests/integration/api.test.js`: Validates `/api/health`, employee management, shift generation, leave request submission, and manager approval.

---

## 5. Deployment Options for the Supervisor

### Option A: Docker Compose (Recommended)
The repository includes a production-ready `docker-compose.yml` and a multi-stage `Dockerfile`:
```bash
# 1. Start application and PostgreSQL 16 containers
docker-compose up -d --build

# 2. Sync schema and seed database
docker-compose exec app npx prisma db push
docker-compose exec app node prisma/seed.js

# 3. Verify health status
curl http://localhost:5000/api/health
```

### Option B: Cloud PaaS (Render / Railway / AWS ECS / Fly.io)
1. Set the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: `postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public`
   - `JWT_SECRET`: Random 32+ character secret
   - `COOKIE_SECRET`: Random salt
   - `CLIENT_URL`: `https://your-production-domain.com`
2. Build Command:
   ```bash
   npm ci && npx prisma generate && npm run build
   ```
3. Start Command:
   ```bash
   node backend/server.js
   ```

---

## 6. Security & Credentials Check

- **Zero Plaintext Passwords**: All passwords stored using `bcryptjs` with salt factor 10.
- **Zero Committed Secrets**: `.env` is ignored by `.gitignore`. Only `.env.example` with documented placeholders is tracked.
- **No Local DB Committed**: `dev.db` and journal files are ignored by `.gitignore`.
- **Stateless Session Tokens**: JWTs signed with `JWT_SECRET` and delivered via HTTP-only cookies.

---

## 7. Known Limitations & Future Extensibility

1. **Bi-directional WebSockets**: Real-time push updates currently utilize polling; a WebSocket gateway (Socket.io) is documented in architecture for sub-second roster changes.
2. **Multi-Timezone Scheduling**: Operates relative to the organization's home timezone; multi-region time shifting can be added for 24/7 follow-the-sun contact centers.
3. **Third-Party Telephony CTI**: Erlang-C model parameters are ready to connect to cloud telephony APIs (Amazon Connect, Twilio Flex, Genesys Cloud).

---

## 8. Handover Sign-Off Checklist

- [x] Dependencies install cleanly with `npm install`
- [x] Database initializes with `npm run db:setup`
- [x] All 25 unit and integration tests pass with `npm test`
- [x] Production build passes cleanly with `npm run build`
- [x] Full-stack application runs with `npm run dev`
- [x] Health check returns HTTP 200 at `/api/health`
- [x] Zero secrets, passwords, or database files committed
- [x] Complete documentation: `README.md`, `ARCHITECTURE.md`, `API.md`, `DATABASE.md`, `DEPLOYMENT.md`
- [x] Ready for supervisor review and cloud deployment

