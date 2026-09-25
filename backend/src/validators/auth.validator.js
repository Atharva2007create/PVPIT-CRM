import { z } from 'zod';
import { env } from '../config/env.js';

const empty = z.object({});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().max(254),
    password: z.string().min(env.PASSWORD_MIN_LENGTH).max(128)
  }).strict(),
  params: empty,
  query: empty
});

export const emptyAuthSchema = z.object({ body: empty, params: empty, query: empty });

export const bootstrapAdminConfigSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  password: z.string().min(env.PASSWORD_MIN_LENGTH).max(128)
});
