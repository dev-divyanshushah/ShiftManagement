# ===================================================
# Stage 1: Build Frontend Assets
# ===================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client and build frontend bundle
RUN npx prisma generate
RUN npm run build

# ===================================================
# Stage 2: Production Runtime
# ===================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and engine
COPY prisma ./prisma
RUN npx prisma generate

# Copy built frontend distribution and backend code
COPY --from=builder /app/dist ./dist
COPY backend ./backend
COPY src/data ./src/data
COPY src/utils ./src/utils

# Expose API and web port
EXPOSE 5000

# Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/server.js"]

