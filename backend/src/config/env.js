import 'dotenv/config';
import { z } from 'zod';

const regexPattern = z.string().min(1).refine((value) => {
  try {
    new RegExp(value, 'i');
    return true;
  } catch {
    return false;
  }
}, 'Must be a valid regular expression');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  MONGODB_URI: z.string().min(1).refine(
    (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    'Must be a MongoDB connection URI'
  ),
  JWT_SECRET: z.string().min(32, 'Must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().min(2),
  PASSWORD_MIN_LENGTH: z.coerce.number().int().min(8).max(128),
  CLIENT_ORIGIN: z.url(),
  STUDENT_EMAIL_PATTERN: regexPattern,
  ADMINISTRATOR_EMAIL_PATTERN: regexPattern,
  INITIAL_ADMIN_NAME: z.string().trim().min(2).optional(),
  INITIAL_ADMIN_EMAIL: z.email().optional(),
  INITIAL_ADMIN_PASSWORD: z.string().optional()
});

export function parseEnvironment(source) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return Object.freeze(parsed.data);
}

export const env = parseEnvironment(process.env);
