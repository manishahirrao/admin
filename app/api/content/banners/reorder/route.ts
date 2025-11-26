import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { banners } = await request.json();

    if (!Array.isArray(banners)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Update display order for each banner
    const updates = banners.map(async (banner) => {
      return supabase
        .from('banners')
        .update({ display_order: banner.display_order })
        .eq('id', banner.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering banners:', error);
    return NextResponse.json(
      { error: 'Failed to reorder banners' },
      { status: 500 }
    );
  }
}
