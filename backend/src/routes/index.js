import { Router } from 'express';
import { getApiInfo, getHealth } from '../controllers/system.controller.js';

export const apiRouter = Router();
apiRouter.get('/', getApiInfo);
apiRouter.get('/health', getHealth);
