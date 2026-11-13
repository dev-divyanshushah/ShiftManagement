import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(16).default('shiftflow-wfm-jwt-development-secret-key-32-chars-2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('shiftflow-wfm-cookie-secret-key-salt-2026'),
  MANAGER_INVITE_CODES: z.string().default('MGR-APEX-2026,SHIFTFLOW-MGR,APEX-EXEC'),
  EMPLOYEE_INVITE_CODES: z.string().default('APEX-STAFF-2026,SHIFTFLOW-EMP,APEX-CARE'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export const managerInviteCodes = env.MANAGER_INVITE_CODES.split(',').map(s => s.trim());
export const employeeInviteCodes = env.EMPLOYEE_INVITE_CODES.split(',').map(s => s.trim());

