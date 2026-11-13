import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ShiftFlow Workforce Management Backend',
      version: '1.0.0',
      database: 'connected',
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'ShiftFlow Workforce Management Backend',
      database: 'disconnected',
      error: err.message,
    });
  }
});

export default router;
