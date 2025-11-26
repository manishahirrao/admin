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
    const statusFilter = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone,
          email
        ),
        rituals:ritual_id (
          name
        ),
        temples:temple_id (
          name
        )
      `, { count: 'exact' });

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Apply sorting and pagination
    const { data: bookings, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Transform data to match frontend interface
    const orders = bookings?.map((booking) => ({
      id: booking.id,
      orderId: `ORD-${booking.id.substring(0, 8).toUpperCase()}`,
      referenceId: booking.reference_id || `REF-${booking.id.substring(0, 6)}`,
      orderType: booking.booking_type || 'ritual',
      userName: booking.profiles?.full_name || 'N/A',
      userPhone: booking.profiles?.phone || 'N/A',
      userEmail: booking.profiles?.email || 'N/A',
      serviceName: booking.rituals?.name || booking.service_name || 'N/A',
      templeName: booking.temples?.name || booking.temple_name || null,
      priestName: booking.priest_name || null,
      scheduledDate: booking.scheduled_date || booking.created_at,
      totalValue: booking.total_amount || 0,
      status: booking.status || 'upcoming',
      paymentStatus: booking.payment_status || 'pending',
      aashirwadBoxStatus: booking.aashirwad_box_status,
      videoStatus: booking.video_status,
      createdAt: booking.created_at,
    })) || [];

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
