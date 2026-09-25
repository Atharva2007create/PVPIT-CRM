import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const HASH_ROUNDS = 12;

export function validatePasswordLength(password) {
  return typeof password === 'string' && password.length >= env.PASSWORD_MIN_LENGTH;
}

export function hashPassword(password) {
  return bcrypt.hash(password, HASH_ROUNDS);
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
