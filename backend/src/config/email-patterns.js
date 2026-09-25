import { env } from './env.js';
import { ROLES } from '../constants/roles.js';

const patterns = Object.freeze({
  [ROLES.STUDENT]: new RegExp(env.STUDENT_EMAIL_PATTERN, 'i'),
  [ROLES.ADMINISTRATOR]: new RegExp(env.ADMINISTRATOR_EMAIL_PATTERN, 'i')
});

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function emailMatchesRole(email, role) {
  const pattern = patterns[role];
  return pattern ? pattern.test(normalizeEmail(email)) : false;
}

export function matchingEmailRoles(email) {
  return Object.keys(patterns).filter((role) => emailMatchesRole(email, role));
}
