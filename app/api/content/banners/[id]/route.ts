import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logUpdate, logDelete } from '@/lib/services/audit.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    // Get old value for audit
    const { data: oldBanner } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    // Update banner
    const { data: banner, error } = await supabase
      .from('banners')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await logUpdate(user.id, 'banner', id, oldBanner, banner);

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get old value for audit
    const { data: oldBanner } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    // Delete banner
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log the action
    await logDelete(user.id, 'banner', id, oldBanner);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
