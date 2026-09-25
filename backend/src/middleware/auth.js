import jwt from 'jsonwebtoken';
import { ACCOUNT_STATUS } from '../constants/account-status.js';
import { ROLE_VALUES } from '../constants/roles.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { serializeAuthenticatedUser } from '../utils/authenticated-user.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : null;
  if (!token) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired');
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Access token is invalid');
  }

  if (!payload?.sub || !ROLE_VALUES.includes(payload.role) || !Number.isInteger(payload.tokenVersion)) {
    throw new AppError(401, 'INVALID_TOKEN', 'Access token is invalid');
  }

  const user = await userRepository.findByIdForAuthentication(payload.sub);
  if (!user) throw new AppError(401, 'ACCOUNT_NOT_FOUND', 'Authenticated account is unavailable');
  if (user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(401, 'ACCOUNT_SUSPENDED', 'Account is suspended');
  }
  if (user.role !== payload.role || user.tokenVersion !== payload.tokenVersion) {
    throw new AppError(401, 'TOKEN_REVOKED', 'Access token has been revoked');
  }

  req.auth = { userId: user.id ?? user._id.toString(), tokenVersion: user.tokenVersion };
  req.user = serializeAuthenticatedUser(user);
  next();
});
