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

    // Fetch all holy items
    const { data: items, error } = await supabase
      .from('holy_items')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(items || []);
  } catch (error) {
    console.error('Error fetching holy items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holy items' },
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
    const { name, description, category, price, stock_quantity, image_url, is_active } = body;

    // Create holy item
    const { data: item, error } = await supabase
      .from('holy_items')
      .insert({
        name,
        description,
        category,
        price,
        stock_quantity,
        image_url,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the action
    await logCreate(user.id, 'holy_item', item.id, item);

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating holy item:', error);
    return NextResponse.json(
      { error: 'Failed to create holy item' },
      { status: 500 }
    );
  }
}
