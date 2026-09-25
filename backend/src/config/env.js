import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  MONGODB_URI: z.string().min(1).refine(
    (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    'Must be a MongoDB connection URI'
  ),
  JWT_SECRET: z.string().min(32, 'Must contain at least 32 characters'),
  CLIENT_ORIGIN: z.url()
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
