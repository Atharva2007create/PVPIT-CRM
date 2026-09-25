import { ROLES } from './roles.js';

// Phase 1 defines only the authorization foundation. Domain permissions are
// intentionally deferred until the routes they protect are implemented.
export const PERMISSIONS = Object.freeze({
  ACCESS_STUDENT_WORKFLOW: 'workflow:student',
  ACCESS_ADMINISTRATOR_WORKFLOW: 'workflow:administrator'
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.STUDENT]: Object.freeze([PERMISSIONS.ACCESS_STUDENT_WORKFLOW]),
  [ROLES.ADMINISTRATOR]: Object.freeze([PERMISSIONS.ACCESS_ADMINISTRATOR_WORKFLOW])
});

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
