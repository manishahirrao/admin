'use client';

import { useAuth } from './useAuth';

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export_data'
  | 'bulk_update';

/**
 * Hook for logging audit actions from the client side
 */
export function useAuditLog() {
  const { adminUser } = useAuth();

  const logAction = async (
    actionType: AuditActionType,
    resourceType: string,
    resourceId?: string,
    data?: {
      oldValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
    }
  ) => {
    if (!adminUser) {
      console.warn('Cannot log audit action: No admin user');
      return;
    }

    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminUserId: adminUser.id,
          actionType,
          resourceType,
          resourceId,
          ...data,
        }),
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const logCreate = async (
    resourceType: string,
    resourceId: string,
    newValue: any
  ) => {
    await logAction('create', resourceType, resourceId, { newValue });
  };

  const logUpdate = async (
    resourceType: string,
    resourceId: string,
    oldValue: any,
    newValue: any
  ) => {
    await logAction('update', resourceType, resourceId, { oldValue, newValue });
  };

  const logDelete = async (
    resourceType: string,
    resourceId: string,
    oldValue: any
  ) => {
    await logAction('delete', resourceType, resourceId, { oldValue });
  };

  const logExport = async (
    exportType: string,
    filters: any,
    recordCount: number
  ) => {
    await logAction('export_data', exportType, undefined, {
      newValue: { filters, recordCount },
    });
  };

  const logBulkUpdate = async (
    resourceType: string,
    resourceIds: string[],
    changes: any
  ) => {
    await logAction('bulk_update', resourceType, undefined, {
      newValue: { resourceIds, changes, count: resourceIds.length },
    });
  };

  return {
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    logBulkUpdate,
  };
}
