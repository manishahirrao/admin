import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (adminError || !adminUser) {
      // Sign out if not an admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'You do not have admin access to this dashboard' },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Log the login action
    await supabase.from('audit_log').insert({
      admin_user_id: adminUser.id,
      action_type: 'login',
      resource_type: 'auth',
      resource_id: adminUser.id,
    });

    return NextResponse.json({
      user: data.user,
      adminUser,
      requires2FA: adminUser.two_factor_enabled,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
