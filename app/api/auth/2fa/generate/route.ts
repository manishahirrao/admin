import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTwoFactorSecret } from '@/lib/services/twoFactor.service';

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

    // Get admin user details
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 2FA secret and QR code
    const setupData = await generateTwoFactorSecret(user.id, adminUser.email);

    return NextResponse.json(setupData);
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    return NextResponse.json(
      { error: 'Failed to generate 2FA secret' },
      { status: 500 }
    );
  }
}
