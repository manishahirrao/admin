import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/services/audit.service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { actionType, resourceType, resourceId, oldValue, newValue, metadata } = body;

    if (!actionType || !resourceType) {
      return NextResponse.json(
        { error: 'Action type and resource type are required' },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Log the action
    await logAuditAction({
      adminUserId: user.id,
      actionType,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging audit action:', error);
    return NextResponse.json(
      { error: 'Failed to log audit action' },
      { status: 500 }
    );
  }
}
