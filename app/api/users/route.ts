import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Fetch users from profiles table
    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Transform data to match frontend interface
    const users = profiles?.map((profile) => ({
      id: profile.id,
      fullName: profile.full_name || 'N/A',
      phone: profile.phone || 'N/A',
      email: profile.email || 'N/A',
      registrationDate: profile.created_at,
      activityScore: Math.floor(Math.random() * 100), // TODO: Calculate from actual data
      cartValue: 0, // TODO: Calculate from cart data
      orderCount: 0, // TODO: Calculate from bookings
      lastActivity: profile.updated_at || profile.created_at,
      status: 'active', // TODO: Determine from actual activity
    })) || [];

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
