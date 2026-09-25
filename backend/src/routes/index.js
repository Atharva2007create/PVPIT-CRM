import { Router } from 'express';
import { getApiInfo, getHealth } from '../controllers/system.controller.js';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();
apiRouter.get('/', getApiInfo);
apiRouter.get('/health', getHealth);
apiRouter.use('/auth', authRouter);
