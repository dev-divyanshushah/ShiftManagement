# ShiftFlow REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates a user and sets an HTTP-only cookie (`shiftflow_token`) and returns a JWT token.
- **Request Body:**
  ```json
  {
    "email": "manager@shiftflow.com",
    "password": "Manager@123",
    "rememberMe": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "cuid...",
      "email": "manager@shiftflow.com",
      "role": "MANAGER",
      "name": "Alexandra Vance",
      "organization": "Apex Contact Solutions"
    }
  }
  ```

### `POST /auth/register-manager`
Registers an operations manager using a valid organization invite code.
- **Header:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "fullName": "Marcus Brody",
    "workEmail": "marcus.brody@shiftflow.com",
    "password": "Password123!",
    "organizationName": "Apex Contact Solutions",
    "inviteCode": "MGR-APEX-2026"
  }
  ```

### `POST /auth/register-employee`
Registers an employee using a valid staff invite code.

### `GET /auth/me`
Returns current authenticated user profile and permissions.
- **Header:** `Authorization: Bearer <token>`

### `POST /auth/logout`
Clears session cookie and invalidates client session.

---

## 2. Shift Management Endpoints

### `GET /shifts`
Retrieves all shifts for the organization.
- **Access:** Managers see all shifts; Employees see published shifts.

### `POST /shifts`
Creates an individual shift assignment.
- **Access:** Manager only.

### `POST /shifts/generate`
Executes the constraint-based scheduling engine and transactionally inserts candidate roster.
- **Access:** Manager only.
- **Request Body:**
  ```json
  {
    "targetDepartment": "All",
    "respectAvailability": true,
    "respectHourLimits": true,
    "balanceFairness": true
  }
  ```

### `POST /shifts/publish`
Locks and publishes current draft shifts, notifying all employees.

---

## 3. Leave & Shift Swap Endpoints

### `POST /leaves`
Submits a time-off request.
- **Access:** Authenticated Employee.

### `PUT /leaves/:id/status`
Approves or rejects a leave request.
- **Access:** Manager only.

### `POST /swaps`
Proposes a mutual shift trade between colleagues.

### `PUT /swaps/:id/status`
Approves or declines a shift trade. When approved, both employees' shifts are atomically swapped in the database.
- **Access:** Manager only.

---

## 4. Conflict & Quality Endpoints

### `GET /conflicts`
Runs real-time validation checks for overlaps, overtime, and availability collisions.

### `POST /conflicts/resolve`
Applies a one-click database resolution to eliminate the underlying conflict.
- **Access:** Manager only.

### `GET /health`
System operational health check verifying API and database connectivity.

