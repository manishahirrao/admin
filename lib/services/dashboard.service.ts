import { createClient } from '@/lib/supabase/server';

export async function getDashboardMetrics(
  period: 'today' | 'week' | 'month' = 'today'
) {
  const supabase = await createClient();

  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      break;
  }

  // Fetch total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Fetch active bookings (upcoming and in_progress)
  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['upcoming', 'in_progress']);

  // Fetch pending deliveries
  const { count: pendingDeliveries } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('aashirwad_box_status', 'pending');

  // Get real booking trends
  const bookingTrends = await getBookingTrends(supabase, period, startDate);
  
  // Get real user engagement
  const userEngagement = await getUserEngagement(supabase, period, startDate);
  
  // Get real service category performance
  const serviceCategoryPerformance = await getCategoryPerformance(supabase, startDate);
  
  // Get real revenue distribution
  const revenueDistribution = await getRevenueDistribution(supabase, startDate);

  return {
    totalUsers: totalUsers || 0,
    activeBookings: activeBookings || 0,
    pendingDeliveries: pendingDeliveries || 0,
    bookingTrends,
    userEngagement,
    serviceCategoryPerformance,
    revenueDistribution,
  };
}

async function getBookingTrends(supabase: any, period: 'today' | 'week' | 'month', startDate: Date) {
  const days = period === 'today' ? 24 : period === 'week' ? 7 : 30;
  const data = [];
  
  if (period === 'today') {
    // Hourly data for today
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startDate);
      hourStart.setHours(i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(i + 1, 0, 0, 0);
      
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hourStart.toISOString())
        .lt('created_at', hourEnd.toISOString());
      
      data.push({
        date: `${i}:00`,
        value: count || 0,
      });
    }
  } else {
    // Daily data for week/month
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());
      
      data.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count || 0,
      });
    }
  }
  
  return data;
}

async function getUserEngagement(supabase: any, period: 'today' | 'week' | 'month', startDate: Date) {
  const days = period === 'today' ? 24 : period === 'week' ? 7 : 30;
  const data = [];
  
  if (period === 'today') {
    // Hourly active users for today
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startDate);
      hourStart.setHours(i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(i + 1, 0, 0, 0);
      
      const { count } = await supabase
        .from('user_journey_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', hourStart.toISOString())
        .lt('created_at', hourEnd.toISOString());
      
      data.push({
        date: `${i}:00`,
        value: count || 0,
      });
    }
  } else {
    // Daily active users
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', dayStart.toISOString())
        .lte('updated_at', dayEnd.toISOString());
      
      data.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count || 0,
      });
    }
  }
  
  return data;
}

async function getCategoryPerformance(supabase: any, startDate: Date) {
  // Get bookings by type with revenue
  const { data: rituals } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('booking_type', 'ritual')
    .eq('payment_status', 'completed')
    .gte('created_at', startDate.toISOString());
  
  const { data: chadhava } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('booking_type', 'chadhava')
    .eq('payment_status', 'completed')
    .gte('created_at', startDate.toISOString());
  
  const { data: holyItems } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('booking_type', 'holy_item')
    .eq('payment_status', 'completed')
    .gte('created_at', startDate.toISOString());
  
  const ritualsRevenue = rituals?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
  const chadhavaRevenue = chadhava?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
  const holyItemsRevenue = holyItems?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
  
  const totalRevenue = ritualsRevenue + chadhavaRevenue + holyItemsRevenue;
  
  return [
    { 
      category: 'Rituals', 
      revenue: ritualsRevenue, 
      bookings: rituals?.length || 0,
      growth: 0 // Calculate from previous period if needed
    },
    { 
      category: 'Chadhava', 
      revenue: chadhavaRevenue, 
      bookings: chadhava?.length || 0,
      growth: 0
    },
    { 
      category: 'Holy Items', 
      revenue: holyItemsRevenue, 
      bookings: holyItems?.length || 0,
      growth: 0
    },
  ];
}

async function getRevenueDistribution(supabase: any, startDate: Date) {
  const categories = await getCategoryPerformance(supabase, startDate);
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0);
  
  return categories.map(cat => ({
    category: cat.category,
    amount: cat.revenue,
    percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
  }));
}

export async function getActivityHeatmap(days: number = 7) {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('user_journey_events')
    .select('event_type, created_at')
    .gte('created_at', startDate.toISOString());

  if (error || !data || data.length === 0) {
    // Return empty heatmap if no data
    return generateEmptyHeatmapData();
  }

  // Process real data into heatmap format
  const heatmapData: { [key: string]: { [hour: number]: number } } = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Initialize all days and hours with 0
  dayNames.forEach(day => {
    heatmapData[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      heatmapData[day][hour] = 0;
    }
  });
  
  // Count events by day and hour
  data.forEach(event => {
    const date = new Date(event.created_at);
    const day = dayNames[date.getDay()];
    const hour = date.getHours();
    heatmapData[day][hour]++;
  });
  
  // Convert to array format
  const result = [];
  for (const day of dayNames) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({
        day,
        hour,
        value: heatmapData[day][hour],
      });
    }
  }
  
  return result;
}

function generateEmptyHeatmapData() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  
  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        day,
        hour,
        value: 0,
      });
    }
  }
  
  return data;
}
