import { hasPermission } from '../constants/permissions.js';
import { AppError } from '../utils/app-error.js';

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have access to this resource'));
  }
  return next();
};

export const requirePermission = (permission) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
  if (!hasPermission(req.user.role, permission)) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have the required permission'));
  }
  return next();
};

export const authorizeRoles = requireRole;
export const authorizePermission = requirePermission;
