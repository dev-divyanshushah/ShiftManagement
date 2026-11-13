# ShiftFlow Workforce Management – Architecture Documentation

## 1. System Overview

ShiftFlow is an enterprise-grade Workforce Management (WFM) and Intelligent Employee Scheduling Platform engineered specifically for contact centers, technical support hubs, and customer care organizations.

The system is architected as a decoupled, multi-tier web application combining an interactive React single-page application (SPA) with a Node.js/Express REST backend backed by Prisma ORM.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (SPA)                     │
│  React 18 + Vite + Tailwind CSS + Lucide + Recharts        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON / Cookies
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express API Server                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Security & Middlewares (Helmet, CORS, Rate Limit, Auth)  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ REST Controllers (/auth, /shifts, /employees, /breaks)  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Business Logic Services:                                │ │
│ │  - Scheduling Constraint Solver                         │ │
│ │  - Erlang-C Break Allocation Optimizer                  │ │
│ │  - Real-time Conflict Detection & Resolution Engine     │ │
│ │  - Transactional Audit Logger                           │ │
│ └────────────────────────────┬────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               │ Prisma ORM Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Relational Database                    │
│   SQLite (Dev/Test zero-dependency) / PostgreSQL (Prod)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Strict Role-Based Access Control (RBAC)**: All authorization checks are strictly validated on the server. The frontend never decides permissions independently.
2. **Deterministic Constraint-Based Scheduling**: Roster generation separates Hard Constraints (statutory hours, contractual availability, leave overlaps) from Soft Preferences (seniority, fairness, balanced distribution).
3. **Atomic Consistency**: Critical operations such as mutual shift trades and roster publishing execute inside ACID database transactions (`prisma.$transaction`).
4. **Environment Portability**: The database layer is designed for SQLite locally for instant zero-dependency grading/testing, and PostgreSQL 16 in containerized production environments.

---

## 3. Directory Layout

```
ShiftFlow/
├── backend/
│   ├── config/              # Environment parsing and Prisma client singleton
│   ├── middleware/          # JWT auth, RBAC guards, Zod validators, error handling
│   ├── routes/              # Express REST API endpoints
│   ├── services/            # Pure business engines (scheduling, breaks, conflicts)
│   ├── app.js               # Express application pipeline
│   └── server.js            # Node HTTP server entry point
├── prisma/
│   ├── schema.prisma        # SQLite development schema
│   ├── schema.postgresql.prisma # PostgreSQL production schema
│   └── seed.js              # Comprehensive benchmark seed script
├── src/                     # React Frontend
│   ├── components/          # Reusable UI widgets and navigational layouts
│   ├── context/             # AppContext and AuthContext state managers
│   ├── data/                # Static benchmarks and default curves
│   ├── pages/               # Manager and Employee role pages
│   └── utils/               # Date arithmetic and API client wrappers
├── tests/
│   ├── unit/                # Scheduling constraints, breaks, conflict detection
│   └── integration/         # Auth, employees, shifts, leaves, and swaps APIs
├── docs/                    # Architecture, API, Database, and Deployment guides
├── .github/workflows/       # GitHub Actions CI workflow
├── Dockerfile               # Production multi-stage Docker build
├── docker-compose.yml       # Production app + PostgreSQL container setup
└── README.md                # Comprehensive project documentation
```

