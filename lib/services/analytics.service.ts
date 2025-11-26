import { createClient } from '@/lib/supabase/server';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  templeId?: string;
  category?: string;
  status?: string;
}

export async function getBookingAnalytics(filters: AnalyticsFilters = {}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('bookings')
    .select('*');
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters.templeId) {
    query = query.eq('temple_id', filters.templeId);
  }
  if (filters.category) {
    query = query.eq('booking_type', filters.category);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function getUserAnalytics(filters: AnalyticsFilters = {}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('profiles')
    .select('*');
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function getRevenueAnalytics(filters: AnalyticsFilters = {}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('bookings')
    .select('total_amount, payment_status, created_at, booking_type')
    .eq('payment_status', 'completed');
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters.templeId) {
    query = query.eq('temple_id', filters.templeId);
  }
  if (filters.category) {
    query = query.eq('booking_type', filters.category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  const totalRevenue = data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
  const bookingCount = data?.length || 0;
  const averageOrderValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;
  
  // Group by category
  const revenueByCategory: { [key: string]: number } = {};
  data?.forEach(booking => {
    const category = booking.booking_type || 'other';
    revenueByCategory[category] = (revenueByCategory[category] || 0) + (booking.total_amount || 0);
  });
  
  return {
    totalRevenue,
    bookingCount,
    averageOrderValue,
    revenueByCategory,
    rawData: data,
  };
}

export async function getTemplePerformance(filters: AnalyticsFilters = {}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('bookings')
    .select(`
      *,
      temples:temple_id (
        id,
        name
      )
    `);
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Group by temple
  const templeStats: { [key: string]: any } = {};
  
  data?.forEach(booking => {
    const templeId = booking.temple_id;
    const templeName = booking.temples?.name || 'Unknown';
    
    if (!templeStats[templeId]) {
      templeStats[templeId] = {
        id: templeId,
        name: templeName,
        bookingCount: 0,
        revenue: 0,
        completedBookings: 0,
      };
    }
    
    templeStats[templeId].bookingCount++;
    if (booking.payment_status === 'completed') {
      templeStats[templeId].revenue += booking.total_amount || 0;
      templeStats[templeId].completedBookings++;
    }
  });
  
  return Object.values(templeStats);
}

export async function getUserBehaviorAnalytics(filters: AnalyticsFilters = {}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('user_journey_events')
    .select('*');
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Analyze event types
  const eventCounts: { [key: string]: number } = {};
  const uniqueUsers = new Set();
  
  data?.forEach(event => {
    eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    uniqueUsers.add(event.user_id);
  });
  
  return {
    totalEvents: data?.length || 0,
    uniqueUsers: uniqueUsers.size,
    eventCounts,
    rawData: data,
  };
}

export async function exportAnalyticsData(
  type: 'bookings' | 'users' | 'revenue',
  filters: AnalyticsFilters = {},
  format: 'csv' | 'json' = 'csv'
) {
  let data: any[] = [];
  
  switch (type) {
    case 'bookings':
      data = await getBookingAnalytics(filters);
      break;
    case 'users':
      data = await getUserAnalytics(filters);
      break;
    case 'revenue':
      const revenueData = await getRevenueAnalytics(filters);
      data = revenueData.rawData || [];
      break;
  }
  
  if (format === 'csv') {
    return convertToCSV(data);
  }
  
  return JSON.stringify(data, null, 2);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}
