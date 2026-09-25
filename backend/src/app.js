import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { apiRouter } from './routes/index.js';
import { AppError } from './utils/app-error.js';
import { getHealth } from './controllers/system.controller.js';

export function createApp({ logging = env.NODE_ENV !== 'test' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestId);
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || origin === env.CLIENT_ORIGIN) return callback(null, true);
      return callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed'));
    }
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  if (logging) app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.get('/health', getHealth);
  app.use('/api/v1', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
