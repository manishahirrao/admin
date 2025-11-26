import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logCreate, logUpdate } from '@/lib/services/audit.service';

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

    // Fetch all rituals
    const { data: rituals, error } = await supabase
      .from('rituals')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(rituals || []);
  } catch (error) {
    console.error('Error fetching rituals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rituals' },
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
    const { name, description, category, base_price, duration_minutes, is_active } = body;

    // Create ritual
    const { data: ritual, error } = await supabase
      .from('rituals')
      .insert({
        name,
        description,
        category,
        base_price,
        duration_minutes,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await logCreate(user.id, 'ritual', ritual.id, ritual);

    return NextResponse.json(ritual);
  } catch (error) {
    console.error('Error creating ritual:', error);
    return NextResponse.json(
      { error: 'Failed to create ritual' },
      { status: 500 }
    );
  }
}
