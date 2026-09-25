import { ACCOUNT_STATUS } from '../constants/account-status.js';
import { ROLES } from '../constants/roles.js';
import { emailMatchesRole, matchingEmailRoles, normalizeEmail } from '../config/email-patterns.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/app-error.js';
import { serializeAuthenticatedUser } from '../utils/authenticated-user.js';
import { decodeAccessToken, signAccessToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';

const invalidCredentials = () => new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

export const authService = {
  async login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const emailRoles = matchingEmailRoles(normalizedEmail);
    if (emailRoles.length === 0) {
      throw new AppError(422, 'INVALID_EMAIL_PATTERN', 'Email does not match an approved account format');
    }

    const user = await userRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) throw invalidCredentials();
    if (user.status === ACCOUNT_STATUS.SUSPENDED) {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Account is suspended');
    }
    if (user.status !== ACCOUNT_STATUS.ACTIVE) throw invalidCredentials();

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) throw invalidCredentials();

    if (!emailRoles.includes(user.role)) {
      throw new AppError(422, 'EMAIL_ROLE_MISMATCH', 'Email format does not match the stored account role');
    }

    user.lastLoginAt = new Date();
    await userRepository.updateLastLogin(user.id ?? user._id, user.lastLoginAt);
    const accessToken = signAccessToken(user);
    const tokenPayload = decodeAccessToken(accessToken);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: tokenPayload.exp - tokenPayload.iat,
      expiresAt: new Date(tokenPayload.exp * 1000).toISOString(),
      user: serializeAuthenticatedUser(user)
    };
  },

  getCurrentUser(user) {
    return serializeAuthenticatedUser(user);
  },

  async logout({ userId, tokenVersion }) {
    const user = await userRepository.incrementTokenVersion(userId, tokenVersion);
    if (!user) throw new AppError(401, 'TOKEN_REVOKED', 'Access token has been revoked');
  },

  async bootstrapAdministrator({ name, email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!emailMatchesRole(normalizedEmail, ROLES.ADMINISTRATOR)) {
      throw new AppError(422, 'INVALID_ADMIN_EMAIL_PATTERN', 'Administrator email does not match the configured pattern');
    }

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.role !== ROLES.ADMINISTRATOR) {
        throw new AppError(409, 'EMAIL_ROLE_CONFLICT', 'Email already belongs to a different account role');
      }
      return { created: false, user: serializeAuthenticatedUser(existing) };
    }

    const passwordHash = await hashPassword(password);
    let user;
    try {
      user = await userRepository.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: ROLES.ADMINISTRATOR,
        status: ACCOUNT_STATUS.ACTIVE
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const concurrentExisting = await userRepository.findByEmail(normalizedEmail);
      if (!concurrentExisting || concurrentExisting.role !== ROLES.ADMINISTRATOR) throw error;
      return { created: false, user: serializeAuthenticatedUser(concurrentExisting) };
    }
    return { created: true, user: serializeAuthenticatedUser(user) };
  }
};
