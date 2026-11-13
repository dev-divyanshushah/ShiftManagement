# ShiftFlow Deployment Guide

This guide describes how to deploy ShiftFlow to staging or production environments.

---

## 1. Quick Start with Docker Compose

The easiest way to run ShiftFlow with a PostgreSQL database in production is using Docker Compose:

```bash
# 1. Clone repository
git clone https://github.com/your-org/shiftflow-wfm.git
cd shiftflow-wfm

# 2. Configure production secrets in .env
cp .env.example .env

# 3. Start application and PostgreSQL containers
docker-compose up -d --build

# 4. Initialize database schema & seed benchmark data
docker-compose exec app npx prisma db push
docker-compose exec app node prisma/seed.js

# 5. Verify health check
curl http://localhost:5000/api/health
```

---

## 2. Standalone Cloud Deployment (Render / Railway / AWS ECS)

### Environment Variables Required:
- `PORT`: `5000`
- `NODE_ENV`: `production`
- `DATABASE_URL`: `postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public`
- `JWT_SECRET`: 32+ character random string
- `COOKIE_SECRET`: Random salt string
- `CLIENT_URL`: `https://your-domain.com`

### Build Command:
```bash
npm ci && npx prisma generate && npm run build
```

### Start Command:
```bash
node backend/server.js
```

