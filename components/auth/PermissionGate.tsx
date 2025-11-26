'use client';

import { usePermissions } from '@/lib/hooks/usePermissions';
import { AdminRole } from '@/types/admin.types';

interface PermissionGateProps {
  children: React.ReactNode;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  allowedRoles?: AdminRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  permissions?: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({
  children,
  resource,
  action = 'read',
  allowedRoles,
  fallback = null,
  requireAll = false,
  permissions,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, role, isSuperAdmin } =
    usePermissions();

  // Super admin can see everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }

    return <>{children}</>;
  }

  // Check single permission
  if (resource && !hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionGate() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, role, isSuperAdmin } =
    usePermissions();

  const canAccess = (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' = 'read'
  ): boolean => {
    if (isSuperAdmin) return true;
    return hasPermission(resource, action);
  };

  const canAccessAny = (
    permissions: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
  ): boolean => {
    if (isSuperAdmin) return true;
    return hasAnyPermission(permissions);
  };

  const canAccessAll = (
    permissions: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
  ): boolean => {
    if (isSuperAdmin) return true;
    return hasAllPermissions(permissions);
  };

  const hasRole = (allowedRoles: AdminRole[]): boolean => {
    if (isSuperAdmin) return true;
    return role ? allowedRoles.includes(role) : false;
  };

  return {
    canAccess,
    canAccessAny,
    canAccessAll,
    hasRole,
    isSuperAdmin,
    role,
  };
}
