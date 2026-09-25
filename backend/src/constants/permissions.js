import { ROLES } from './roles.js';

export const PERMISSIONS = Object.freeze({
  AUTHENTICATED_ACCESS: 'identity:authenticated',
  BASIC_STUDENT_IDENTITY: 'identity:student',
  BASIC_ADMINISTRATOR_IDENTITY: 'identity:administrator',
  ACCESS_STUDENT_WORKFLOW: 'workflow:student',
  ACCESS_ADMINISTRATOR_WORKFLOW: 'workflow:administrator'
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.STUDENT]: Object.freeze([
    PERMISSIONS.AUTHENTICATED_ACCESS,
    PERMISSIONS.BASIC_STUDENT_IDENTITY,
    PERMISSIONS.ACCESS_STUDENT_WORKFLOW
  ]),
  [ROLES.ADMINISTRATOR]: Object.freeze([
    PERMISSIONS.AUTHENTICATED_ACCESS,
    PERMISSIONS.BASIC_ADMINISTRATOR_IDENTITY,
    PERMISSIONS.ACCESS_ADMINISTRATOR_WORKFLOW
  ])
});

export function permissionsForRole(role) {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
