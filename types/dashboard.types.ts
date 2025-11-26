export interface DashboardMetrics {
  totalUsers: number;
  activeBookings: number;
  pendingDeliveries: number;
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  bookingTrends: TrendData[];
  userEngagement: EngagementData;
  serviceCategoryPerformance: CategoryPerformance[];
  revenueDistribution: RevenueBreakdown[];
}

export interface TrendData {
  date: string;
  value: number;
  category?: string;
}

export interface EngagementData {
  activeUsers: number;
  sessionDuration: number;
  bounceRate: number;
}

export interface CategoryPerformance {
  category: string;
  bookings: number;
  revenue: number;
  growth: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface HeatmapDataPoint {
  hour: number;
  day: string;
  value: number;
}
