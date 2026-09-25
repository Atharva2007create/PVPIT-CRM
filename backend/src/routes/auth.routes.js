import { Router } from 'express';
import { login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { emptyAuthSchema, loginSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', requireAuth, validate(emptyAuthSchema), logout);
authRouter.get('/me', requireAuth, validate(emptyAuthSchema), me);
