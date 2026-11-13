# ShiftFlow – Intelligent Workforce Management & Scheduling Platform

[![CI Pipeline](https://github.com/your-org/shiftflow-wfm/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/shiftflow-wfm/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%7C%2022.x%20%7C%2024.x-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-indigo.svg)](https://www.prisma.io/)

> **ShiftFlow** is an enterprise-grade Workforce Management (WFM) and Intelligent Employee Scheduling SaaS platform engineered specifically for modern contact centers, technical support operations, and omnichannel customer care teams.

---

## 1. Project Overview

Contact center operations grapple with fluctuating customer contact volumes, statutory labor restrictions, varying agent skill certifications, and complex employee availability constraints. ShiftFlow bridges the gap between workforce operations managers and frontline customer support specialists through an intelligent, constraint-based scheduling engine, automated Erlang-C break optimization, real-time conflict detection, and server-enforced role-based access control (RBAC).

---

## 2. Problem Statement

Traditional spreadsheet or legacy WFM tools suffer from:
- **Frequent Rule Collisions**: Double-booked agents, overtime limit violations, and shifts scheduled during approved leave or employee rest days.
- **Service Level Violations**: Suboptimal break placement causing floor staffing shortages during peak inbound queue surges.
- **Fragmented Communication**: Disconnect between manager roster authoring and employee shift swaps or leave applications.
- **Security Vulnerabilities**: Client-only authorization that fails under rigorous enterprise compliance standards.

ShiftFlow solves these problems through an automated constraint satisfaction solver backed by a relational data model, transactional consistency, and end-to-end audit logging.

---

## 3. Key Features

- **Multi-Pass Heuristic Scheduling Solver**: Generates compliant 7-day rosters considering role requirements, seniority, weekly hour limits, contractual availability, and leave records.
- **Erlang-C Break Allocation**: Staggers meal and rest intervals into inbound call-volume troughs, maintaining floor coverage above 70% at all times.
- **Deterministic Conflict Engine**: Detects overlaps, statutory overtime violations, and leave collisions with one-click transactional database resolution.
- **Atomic Shift Swaps**: When a manager approves a peer shift exchange, both employees' schedule assignments are swapped atomically in an ACID database transaction.
- **Production-Grade RBAC**: Server-side JWT/cookie authentication separating Manager capabilities from Employee self-service portals.
- **Comprehensive Audit Trail**: Records administrative roster changes, shift adjustments, and approval actions with timestamps and user identification.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, date-fns |
| **Backend** | Node.js, Express.js (ES Modules), Zod Validation, Helmet, Morgan, Rate Limiting |
| **Database & ORM** | PostgreSQL 16 (Production) / SQLite (Zero-Dependency Dev/Test), Prisma ORM |
| **Authentication** | Argon2/Bcrypt password hashing, Signed JWTs, HTTP-only SameSite Cookies |
| **Testing** | Vitest (Unit & Constraint Testing), Supertest (REST API Integration Testing) |
| **DevOps & CI** | Multi-stage Dockerfile, Docker Compose, GitHub Actions CI Workflow |

---

## 5. System Architecture

ShiftFlow follows a clean, decoupled multi-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Single-Page App                    │
│   React 18 + Vite + Tailwind CSS + Lucide + Recharts        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON / Cookies
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express API Server                │
│  - Middleware: Helmet, CORS, Rate Limiter, Auth JWT/Cookie │
│  - REST Routes: /auth, /employees, /shifts, /breaks, etc.   │
│  - Business Engines:                                        │
│      * Constraint Satisfaction Scheduling Solver            │
│      * Break Optimization Service (Erlang-C volume curve)   │
│      * Real-Time Conflict Detection & Resolution Service    │
│      * Audit Log Service                                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Relational Database                    │
│      SQLite (Local Dev/Test) / PostgreSQL 16 (Production)   │
└─────────────────────────────────────────────────────────────┘
```

For detailed architectural documentation, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 6. Application Modules

### Manager Portal
1. **Overview Dashboard**: Real-time KPIs, scheduled headcount, weekly coverage bar chart, active conflict alerts, and recent operational audit feed.
2. **Shift Scheduler**: Interactive Monday–Sunday matrix, weekly capacity meters, template palette, and automated schedule generation.
3. **Employee Management**: 8-column data grid, contract details, certified skill badges, and profile inspection drawers.
4. **Shift Templates**: Preconfigured shift codes, headcount thresholds, duration, and color indicators.
5. **Break Management**: Dynamic break roster aligned against hourly call curves.
6. **Demand Forecast**: Hourly capacity simulation based on Erlang-C staffing requirements.
7. **Conflict Alerts**: Severity-ranked alerts with one-click automated database fixes.
8. **Reports & Analytics**: Workforce utilization, scheduled hours distribution, and payroll previews.

### Employee Self-Service Portal
1. **My Dashboard**: Today's shift countdown, next break window, and scheduled weekly hours.
2. **My Schedule**: 7-day schedule view with direct peer swap request triggers.
3. **My Breaks**: Break status tracker (*Start Break / End Break*) updating the floor status in real time.
4. **Leave Requests**: PTO/sick leave submission and supervisor approval status feed.
5. **Shift Swaps**: Peer exchange proposals with automated manager approval routing.
6. **My Availability**: Weekly recurring availability preference selector.
7. **My Profile**: Certified competencies, employment terms, and contractual limits.

---

## 7. Database Architecture

The schema contains 14 relational models enforcing primary keys, foreign keys, cascade deletes, and composite indexes:

- `Organization`, `User`, `Department`, `Skill`, `Employee`, `EmployeeSkill`, `EmployeeAvailability`
- `ShiftTemplate`, `AssignedShift`, `BreakSchedule`, `LeaveRequest`, `ShiftSwapRequest`, `SchedulingConflict`, `Notification`, `AuditLog`

Detailed schema documentation is available in [`docs/DATABASE.md`](docs/DATABASE.md).

---

## 8. Scheduling Algorithm Overview

The scheduling solver in [`backend/services/schedulingEngine.js`](backend/services/schedulingEngine.js) executes a deterministic constraint satisfaction pipeline:

1. **Hard Constraints (Must NEVER be violated)**:
   - **No Double-Booking**: An employee can never be scheduled for overlapping shifts on the same day.
   - **Statutory Hour Caps**: Scheduled hours must never exceed `maxHoursPerWeek` (e.g. 40 hours).
   - **Contractual Availability**: Employees cannot be scheduled on days marked unavailable.
   - **Approved Absences**: Employees on approved PTO or sick leave are strictly excluded from assignment.
   - **Role Compatibility**: Employees must possess the job qualification required by the shift template.
2. **Soft Preferences (Heuristically optimized)**:
   - **Fairness & Hour Balancing**: Employees with the fewest weekly hours are prioritized for new shifts.
   - **Seniority Weighting**: Senior/Lead agents are preferentially assigned to high-priority peak shifts.

---

## 9. Authentication and Authorization

- **Password Hashing**: Strong `bcryptjs` (cost factor 10) password hashing.
- **Session Tokens**: Signed JSON Web Tokens (JWT) transmitted via HTTP-only, `SameSite=Lax` cookies or `Authorization: Bearer <token>` headers.
- **Server-Side RBAC**: Authorization middleware (`requireRole('MANAGER')`, `requireSelfOrManager`) guards every protected endpoint.
- **Registration Controls**: Requires cryptographic invitation codes (`MGR-APEX-2026`, `APEX-STAFF-2026`) to prevent unauthorized account creation.

---

## 10. Installation Instructions

### Prerequisites
- **Node.js**: v20.x, v22.x, or v24.x
- **npm**: v10.x or v11.x
- *(Optional for Containerized Deployment)*: Docker & Docker Compose

### Clone Repository
```bash
git clone https://github.com/your-org/shiftflow-wfm.git
cd shiftflow-wfm
```

### Install Dependencies
```bash
npm install
```

---

## 11. Environment Setup

Create your local `.env` file from the provided example:
```bash
cp .env.example .env
```

Default local environment values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=shiftflow-wfm-jwt-development-secret-key-32-chars-2026
COOKIE_SECRET=shiftflow-wfm-cookie-secret-key-salt-2026
MANAGER_INVITE_CODES=MGR-APEX-2026,SHIFTFLOW-MGR,APEX-EXEC
EMPLOYEE_INVITE_CODES=APEX-STAFF-2026,SHIFTFLOW-EMP,APEX-CARE
CLIENT_URL=http://localhost:3000
```

---

## 12. Database Setup

ShiftFlow comes configured with SQLite for zero-dependency local development and evaluation. Initialize the schema and benchmark seed data with a single command:

```bash
npm run db:setup
```
*(This executes `npx prisma db push` followed by `node prisma/seed.js`)*.

---

## 13. Development Commands

Run both the Vite frontend (`http://localhost:3000`) and the Express API server (`http://localhost:5000`) concurrently:
```bash
npm run dev
```

Run services individually:
```bash
# Frontend only
npm run dev:client

# Backend server only
npm run dev:server
```

---

## 14. Testing Instructions

ShiftFlow includes an automated testing suite covering unit tests for scheduling constraints, break allocations, conflict detections, and integration tests for authentication and core REST APIs.

Run all tests:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

---

## 15. Production Build

Compile the React frontend into production-minified static assets:
```bash
npm run build
```
*(Assets are output to `/dist`)*.

---

## 16. Deployment Instructions

### Option A: Docker Compose (Recommended for Production)
```bash
docker-compose up -d --build
docker-compose exec app npx prisma db push
docker-compose exec app node prisma/seed.js
```

### Option B: Cloud Hosting (Render, Railway, AWS ECS)
1. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).
2. Build command: `npm ci && npx prisma generate && npm run build`
3. Start command: `node backend/server.js`

Full deployment instructions are available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 17. Demo Account Instructions for Development

The database seed provides pre-configured enterprise demo accounts:

| Portal | Email | Password | Role | Pre-Assigned Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Manager Portal** | `manager@shiftflow.com` | `Manager@123` | Manager | Alexandra Vance (Director of Operations) |
| **Employee Portal** | `employee@shiftflow.com` (or `EMP-1001`) | `Employee@123` | Employee | Sarah Jenkins (Senior Support Specialist) |

**Authorized Registration Codes**:
- Manager Registration: `MGR-APEX-2026`
- Employee Registration: `APEX-STAFF-2026`

---

## 18. Future Scope

- **Real-Time WebSockets**: Instant floor broadcast alerts and push notifications using Socket.io.
- **Erlang-C Advanced Telephony Integration**: Direct webhook sync with Amazon Connect, Genesys Cloud, and Twilio Flex.
- **Machine Learning Forecast Engine**: Prophet/ARIMA time-series model forecasting call arrival volumes based on historical seasonal trends.
- **Biometric Time Clock Integration**: Clock-in and clock-out geolocation verification for hybrid contact centers.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

