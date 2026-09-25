import { hasPermission } from '../constants/permissions.js';
import { AppError } from '../utils/app-error.js';

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have access to this resource'));
  }
  return next();
};

export const authorizePermission = (permission) => (req, _res, next) => {
  if (!hasPermission(req.user.role, permission)) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have the required permission'));
  }
  return next();
};

