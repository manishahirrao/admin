import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getBookingAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getTemplePerformance,
  getUserBehaviorAnalytics,
  exportAnalyticsData,
} from '@/lib/services/analytics.service';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const templeId = searchParams.get('templeId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const exportFormat = searchParams.get('export');

    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      templeId: templeId || undefined,
      category: category || undefined,
      status: status || undefined,
    };

    // Handle export requests
    if (exportFormat) {
      const exportType = type as 'bookings' | 'users' | 'revenue';
      const data = await exportAnalyticsData(
        exportType,
        filters,
        exportFormat as 'csv' | 'json'
      );

      const headers = new Headers();
      if (exportFormat === 'csv') {
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename="${type}-analytics.csv"`);
      } else {
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="${type}-analytics.json"`);
      }

      return new NextResponse(data, { headers });
    }

    // Handle different analytics types
    let analyticsData;

    switch (type) {
      case 'bookings':
        analyticsData = await getBookingAnalytics(filters);
        break;

      case 'users':
        analyticsData = await getUserAnalytics(filters);
        break;

      case 'revenue':
        analyticsData = await getRevenueAnalytics(filters);
        break;

      case 'temples':
        analyticsData = await getTemplePerformance(filters);
        break;

      case 'behavior':
        analyticsData = await getUserBehaviorAnalytics(filters);
        break;

      case 'overview':
      default:
        // Get comprehensive overview
        const [bookings, revenue, temples, behavior] = await Promise.all([
          getBookingAnalytics(filters),
          getRevenueAnalytics(filters),
          getTemplePerformance(filters),
          getUserBehaviorAnalytics(filters),
        ]);

        analyticsData = {
          bookings: {
            total: bookings.length,
            byStatus: groupBy(bookings, 'status'),
            byType: groupBy(bookings, 'booking_type'),
          },
          revenue: revenue,
          temples: temples,
          userBehavior: behavior,
        };
        break;
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function groupBy(array: any[], key: string) {
  return array.reduce((result, item) => {
    const group = item[key] || 'unknown';
    result[group] = (result[group] || 0) + 1;
    return result;
  }, {});
}
