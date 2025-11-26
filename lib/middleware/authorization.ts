import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdminRole } from '@/types/admin.types';
import { checkRolePermission } from '@/lib/utils/permissions';

export interface AuthorizationOptions {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  allowedRoles?: AdminRole[];
}

/**
 * Middleware to check if the current user has permission to access a resource
 */
export async function requirePermission(
  request: NextRequest,
  options: AuthorizationOptions
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        error: 'Unauthorized - Please log in',
      };
    }

    // Get admin user details
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (adminError || !adminUser) {
      return {
        authorized: false,
        error: 'User not found or not an admin',
      };
    }

    // Check if user's role is in allowed roles (if specified)
    if (options.allowedRoles && !options.allowedRoles.includes(adminUser.role)) {
      await logUnauthorizedAccess(user.id, options.resource, options.action, request);
      return {
        authorized: false,
        error: 'Forbidden - Insufficient permissions',
      };
    }

    // Check permission
    const hasPermission = checkRolePermission(
      adminUser.role,
      options.resource,
      options.action
    );

    if (!hasPermission) {
      await logUnauthorizedAccess(user.id, options.resource, options.action, request);
      return {
        authorized: false,
        error: 'Forbidden - Insufficient permissions',
      };
    }

    return {
      authorized: true,
      user: adminUser,
    };
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      authorized: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Log unauthorized access attempts
 */
async function logUnauthorizedAccess(
  userId: string,
  resource: string,
  action: string,
  request: NextRequest
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('audit_log').insert({
      admin_user_id: userId,
      action_type: 'unauthorized_access_attempt',
      resource_type: resource,
      old_value: null,
      new_value: {
        action,
        path: request.nextUrl.pathname,
        method: request.method,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });
  } catch (error) {
    console.error('Error logging unauthorized access:', error);
  }
}

/**
 * Helper function to create authorization response
 */
export function unauthorizedResponse(error: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error }, { status: 401 });
}

/**
 * Helper function to create forbidden response
 */
export function forbiddenResponse(error: string = 'Forbidden'): NextResponse {
  return NextResponse.json({ error }, { status: 403 });
}

/**
 * Wrapper function for API routes that require authorization
 */
export function withAuthorization(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: AuthorizationOptions
) {
  return async (request: NextRequest, context: any) => {
    const authResult = await requirePermission(request, options);

    if (!authResult.authorized) {
      if (authResult.error?.includes('Unauthorized')) {
        return unauthorizedResponse(authResult.error);
      }
      return forbiddenResponse(authResult.error);
    }

    // Attach user to request for use in handler
    (request as any).adminUser = authResult.user;

    return handler(request, context);
  };
}
