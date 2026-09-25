import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(error, req, res, _next) {
  let normalized = error;

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    normalized = new AppError(400, 'INVALID_JSON', 'Request body contains invalid JSON');
  } else if (error instanceof mongoose.Error.CastError) {
    normalized = new AppError(400, 'INVALID_ID', 'A supplied identifier is invalid');
  } else if (error?.code === 11000) {
    normalized = new AppError(409, 'DUPLICATE_RESOURCE', 'A resource with the same unique value already exists', error.keyValue);
  } else if (error instanceof ZodError) {
    normalized = new AppError(422, 'VALIDATION_ERROR', 'Validation failed', error.flatten());
  }

  const statusCode = normalized.statusCode ?? 500;
  const response = {
    success: false,
    error: {
      code: normalized.code ?? 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'An unexpected error occurred' : normalized.message
    },
    requestId: req.requestId
  };

  if (statusCode === 500 && env.NODE_ENV !== 'test') console.error(error);
  res.status(statusCode).json(response);
}
