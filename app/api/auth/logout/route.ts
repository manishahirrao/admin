import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user before signing out
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Log the logout action
      await supabase.from('audit_log').insert({
        admin_user_id: user.id,
        action_type: 'logout',
        resource_type: 'auth',
        resource_id: user.id,
      });
    }

    // Sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
