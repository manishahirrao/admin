import { createClient } from '@/lib/supabase/server';

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'unauthorized_access_attempt'
  | 'session_invalidated'
  | 'password_change'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'export_data'
  | 'bulk_update'
  | 'permission_change';

export interface AuditLogEntry {
  adminUserId: string;
  actionType: AuditActionType;
  resourceType: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an administrative action to the audit trail
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('audit_log').insert({
      admin_user_id: entry.adminUserId,
      action_type: entry.actionType,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      old_value: entry.oldValue || null,
      new_value: entry.newValue || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      ...entry.metadata,
    });
  } catch (error) {
    console.error('Error logging audit action:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Log a create action
 */
export async function logCreate(
  adminUserId: string,
  resourceType: string,
  resourceId: string,
  newValue: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'create',
    resourceType,
    resourceId,
    newValue,
    metadata,
  });
}

/**
 * Log an update action
 */
export async function logUpdate(
  adminUserId: string,
  resourceType: string,
  resourceId: string,
  oldValue: any,
  newValue: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'update',
    resourceType,
    resourceId,
    oldValue,
    newValue,
    metadata,
  });
}

/**
 * Log a delete action
 */
export async function logDelete(
  adminUserId: string,
  resourceType: string,
  resourceId: string,
  oldValue: any,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'delete',
    resourceType,
    resourceId,
    oldValue,
    metadata,
  });
}

/**
 * Log a login action
 */
export async function logLogin(
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'login',
    resourceType: 'auth',
    ipAddress,
    userAgent,
  });
}

/**
 * Log a logout action
 */
export async function logLogout(
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'logout',
    resourceType: 'auth',
    ipAddress,
    userAgent,
  });
}

/**
 * Log a data export action
 */
export async function logDataExport(
  adminUserId: string,
  exportType: string,
  filters: any,
  recordCount: number
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'export_data',
    resourceType: exportType,
    newValue: {
      filters,
      recordCount,
      exportedAt: new Date().toISOString(),
    },
  });
}

/**
 * Log a bulk update action
 */
export async function logBulkUpdate(
  adminUserId: string,
  resourceType: string,
  resourceIds: string[],
  changes: any
): Promise<void> {
  await logAuditAction({
    adminUserId,
    actionType: 'bulk_update',
    resourceType,
    newValue: {
      resourceIds,
      changes,
      count: resourceIds.length,
    },
  });
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  adminUserId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('admin_user_id', adminUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit: number = 100): Promise<any[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_log')
      .select(`
        *,
        admin_users (
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}
