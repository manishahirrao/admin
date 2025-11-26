import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardMetrics, getActivityHeatmap } from '@/lib/services/dashboard.service';

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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'today':
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active bookings count (upcoming and in_progress)
    const { count: activeBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['upcoming', 'in_progress']);

    // Get pending deliveries count
    const { count: pendingDeliveries } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('aashirwad_box_status', 'pending');

    // Get revenue for the period
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('payment_status', 'completed')
      .gte('created_at', startDate.toISOString());

    const revenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

    // Calculate previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const { data: previousRevenueData } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('payment_status', 'completed')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousRevenue = previousRevenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
    const revenueChange = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Get comprehensive metrics including charts data
    const metrics = await getDashboardMetrics(period as 'today' | 'week' | 'month');
    const activityHeatmap = await getActivityHeatmap(7);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeBookings: activeBookings || 0,
      pendingDeliveries: pendingDeliveries || 0,
      revenue: {
        current: revenue,
        change: Math.round(revenueChange * 10) / 10,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease',
      },
      bookingTrends: metrics.bookingTrends,
      userEngagement: metrics.userEngagement,
      serviceCategoryPerformance: metrics.serviceCategoryPerformance,
      revenueDistribution: metrics.revenueDistribution,
      activityHeatmap,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
