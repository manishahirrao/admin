import { AdminUser, AdminRole, Permission } from '@/types/admin.types';

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    { resource: '*', actions: ['create', 'read', 'update', 'delete'] },
  ],
  temple_admin: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'content', actions: ['read'] },
    { resource: 'rituals', actions: ['read', 'update'] },
    { resource: 'holy_items', actions: ['read'] },
    { resource: 'temples', actions: ['read', 'update'] },
    { resource: 'priests', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  priest_manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'rituals', actions: ['read'] },
    { resource: 'priests', actions: ['create', 'read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  content_manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'content', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'banners', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'rituals', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'holy_items', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'temples', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
  ],
};

export function hasPermission(
  user: AdminUser,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  // Super admin has all permissions
  if (user.role === 'super_admin') {
    return true;
  }

  return user.permissions.some(
    (p) =>
      (p.resource === resource || p.resource === '*') &&
      p.actions.includes(action)
  );
}

export function canAccessResource(user: AdminUser, resource: string): boolean {
  return hasPermission(user, resource, 'read');
}

/**
 * Check if a role has permission to perform an action on a resource
 */
export function checkRolePermission(
  role: AdminRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) {
    return false;
  }

  // Super admin has all permissions
  if (role === 'super_admin') {
    return true;
  }

  return permissions.some(
    (p) =>
      (p.resource === resource || p.resource === '*') &&
      p.actions.includes(action)
  );
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  user: AdminUser,
  checks: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
): boolean {
  return checks.some((check) => hasPermission(user, check.resource, check.action));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  user: AdminUser,
  checks: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
): boolean {
  return checks.every((check) => hasPermission(user, check.resource, check.action));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get all resources a role can access
 */
export function getAccessibleResources(role: AdminRole): string[] {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.map((p) => p.resource);
}
