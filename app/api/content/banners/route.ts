import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logCreate } from '@/lib/services/audit.service';

export async function GET(request: NextRequest) {
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

    // Fetch all banners
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(banners || []);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

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
    const { title, image_url, link_url, display_order, start_date, end_date, target_segments, is_active } = body;

    // Create banner
    const { data: banner, error } = await supabase
      .from('banners')
      .insert({
        title,
        image_url,
        link_url,
        display_order,
        start_date,
        end_date,
        target_segments,
        is_active,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await logCreate(user.id, 'banner', banner.id, banner);

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
