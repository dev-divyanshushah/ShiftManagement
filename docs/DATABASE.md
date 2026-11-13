# ShiftFlow Database Architecture & Schema Specification

The ShiftFlow database is designed around strict referential integrity, relational constraints, foreign keys, and indexes for contact center workforce scheduling.

Prisma ORM is used as the data mapper and migration engine.

---

## 1. Relational Entity Models

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Organization   │◄──────┤   Department    │◄──────┤    Employee     │
└────────┬────────┘       └─────────────────┘       └────────┬────────┘
         │                                                   │
         ├───────────────────────────────────────────────────┼─────────────────┐
         │                                                   │                 │
         ▼                                                   ▼                 ▼
┌─────────────────┐                               ┌─────────────────┐ ┌─────────────────┐
│  ShiftTemplate  │                               │  AssignedShift  │ │  LeaveRequest   │
└────────┬────────┘                               └────────┬────────┘ └─────────────────┘
         │                                                 │
         └───────────────────┬─────────────────────────────┘
                             ▼
                  ┌─────────────────┐
                  │  BreakSchedule  │
                  └─────────────────┘
```

### Table Specifications:

1. **`Organization`**: Multi-tenant operational domain (`id`, `name`, `code`, `createdAt`, `updatedAt`).
2. **`User`**: Security credentials (`id`, `email`, `passwordHash`, `role`, `name`, `employeeId`, `organizationId`).
3. **`Department`**: Operational team (`id`, `name`, `code`, `organizationId`).
4. **`Skill`**: Certified competencies (`id`, `name`, `code`, `description`).
5. **`Employee`**: Worker contracts (`id`, `employeeId`, `name`, `email`, `role`, `seniority`, `maxHoursPerWeek`, `hourlyRate`, `status`).
6. **`EmployeeSkill`**: Join table binding certified skills to workers.
7. **`EmployeeAvailability`**: Weekly recurring availability flags (`employeeId`, `dayOfWeek`, `isAvailable`).
8. **`ShiftTemplate`**: Standardized definitions (`name`, `code`, `startTime`, `endTime`, `durationHours`, `minStaffing`, `color`).
9. **`AssignedShift`**: Actual seat assignments (`employeeId`, `templateId`, `day`, `date`, `startTime`, `endTime`, `durationHours`, `status`).
10. **`BreakSchedule`**: Rest intervals (`shiftId`, `employeeId`, `breakStart`, `breakEnd`, `durationMinutes`, `status`).
11. **`LeaveRequest`**: PTO & sick leave tracking (`employeeId`, `leaveType`, `startDate`, `endDate`, `totalDays`, `status`).
12. **`ShiftSwapRequest`**: Mutual peer shift exchanges (`requesterId`, `targetId`, `requesterShiftId`, `targetShiftId`, `status`).
13. **`SchedulingConflict`**: Active rule violation records (`type`, `severity`, `description`, `suggestedResolution`, `isResolved`).
14. **`Notification`**: Broadcast and targeted notifications (`targetEmployeeId`, `title`, `message`, `type`, `isRead`).
15. **`AuditLog`**: Immutable operational change log (`userId`, `action`, `entityType`, `entityId`, `details`, `ipAddress`).

---

## 2. PostgreSQL Production Setup

To migrate to PostgreSQL:
1. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/shiftflow?schema=public"
   ```
2. Copy PostgreSQL schema:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```
3. Push schema and seed:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

