import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ISSUER = 'pvpit-crm';

export function signAccessToken(user, { expiresIn = env.JWT_EXPIRES_IN } = {}) {
  return jwt.sign(
    { role: user.role, tokenVersion: user.tokenVersion },
    env.JWT_SECRET,
    { subject: user.id ?? user._id.toString(), issuer: ISSUER, expiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { issuer: ISSUER });
}

export function decodeAccessToken(token) {
  return jwt.decode(token);
}
