'use client';

import { useAuth } from './useAuth';
import {
  hasPermission,
  canAccessResource,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/utils/permissions';

export function usePermissions() {
  const { adminUser } = useAuth();

  const checkPermission = (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): boolean => {
    if (!adminUser) return false;
    return hasPermission(adminUser, resource, action);
  };

  const checkAccess = (resource: string): boolean => {
    if (!adminUser) return false;
    return canAccessResource(adminUser, resource);
  };

  const checkAnyPermission = (
    checks: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
  ): boolean => {
    if (!adminUser) return false;
    return hasAnyPermission(adminUser, checks);
  };

  const checkAllPermissions = (
    checks: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' }>
  ): boolean => {
    if (!adminUser) return false;
    return hasAllPermissions(adminUser, checks);
  };

  return {
    hasPermission: checkPermission,
    canAccess: checkAccess,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    role: adminUser?.role,
    isSuperAdmin: adminUser?.role === 'super_admin',
    isTempleAdmin: adminUser?.role === 'temple_admin',
    isPriestManager: adminUser?.role === 'priest_manager',
    isContentManager: adminUser?.role === 'content_manager',
  };
}
