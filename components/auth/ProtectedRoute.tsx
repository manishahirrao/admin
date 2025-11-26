'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { AdminRole } from '@/types/admin.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  allowedRoles?: AdminRole[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  resource,
  action = 'read',
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { hasPermission, role, isSuperAdmin } = usePermissions();

  useEffect(() => {
    // Check if user has required role
    if (allowedRoles && role && !allowedRoles.includes(role) && !isSuperAdmin) {
      router.push('/unauthorized');
    }
  }, [role, allowedRoles, isSuperAdmin, router]);

  // If no resource specified, just check role
  if (!resource) {
    if (allowedRoles && role && !allowedRoles.includes(role) && !isSuperAdmin) {
      return fallback || <UnauthorizedMessage />;
    }
    return <>{children}</>;
  }

  // Check permission for resource
  if (!hasPermission(resource, action)) {
    return fallback || <UnauthorizedMessage />;
  }

  return <>{children}</>;
}

function UnauthorizedMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
