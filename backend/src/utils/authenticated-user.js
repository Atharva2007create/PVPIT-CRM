import { permissionsForRole } from '../constants/permissions.js';
import { ROLE_VALUES } from '../constants/roles.js';

export function workflowForRole(role) {
  return ROLE_VALUES.includes(role) ? role : null;
}

export function serializeAuthenticatedUser(user) {
  const id = user.id ?? user._id?.toString();
  return {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    workflow: workflowForRole(user.role),
    status: user.status,
    permissions: permissionsForRole(user.role)
  };
}
