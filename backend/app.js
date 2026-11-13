import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import templateRoutes from './routes/template.routes.js';
import breakRoutes from './routes/break.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import swapRoutes from './routes/swap.routes.js';
import conflictRoutes from './routes/conflict.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body & Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));

// Request Logger in non-test mode
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Welcome / Health
app.get('/', (req, res) => {
  res.json({
    service: 'ShiftFlow Workforce Management API',
    status: 'online',
    version: '1.0.0',
    documentation: '/docs',
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

