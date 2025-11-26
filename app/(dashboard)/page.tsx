'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PerformanceChart, ChartDataPoint } from '@/components/dashboard/PerformanceChart';
import { ActivityHeatmap, HeatmapDataPoint } from '@/components/dashboard/ActivityHeatmap';
import { useDashboardRealtime } from '@/lib/hooks/useDashboardRealtime';

interface DashboardMetrics {
  totalUsers: number;
  activeBookings: number;
  pendingDeliveries: number;
  revenue: {
    current: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  bookingTrends?: ChartDataPoint[];
  userEngagement?: ChartDataPoint[];
  serviceCategoryPerformance?: ChartDataPoint[];
  revenueDistribution?: ChartDataPoint[];
  activityHeatmap?: HeatmapDataPoint[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const { connected, lastUpdate } = useDashboardRealtime(30000);

  useEffect(() => {
    fetchMetrics();
  }, [period, lastUpdate]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/metrics?period=${period}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          loading={loading}
          subtitle="Registered devotees"
        />

        <MetricCard
          title="Active Bookings"
          value={metrics?.activeBookings || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          loading={loading}
          subtitle="Upcoming & in progress"
        />

        <MetricCard
          title="Pending Deliveries"
          value={metrics?.pendingDeliveries || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
          loading={loading}
          subtitle="Aashirwad boxes"
        />

        <MetricCard
          title="Revenue"
          value={metrics ? formatCurrency(metrics.revenue.current) : '₹0'}
          change={metrics?.revenue.change}
          changeType={metrics?.revenue.changeType}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          loading={loading}
          subtitle={`vs previous ${period}`}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart
          type="line"
          data={metrics?.bookingTrends || []}
          title="Booking Trends"
          xAxisKey="date"
          yAxisKey="bookings"
          loading={loading}
          exportable
        />
        <PerformanceChart
          type="area"
          data={metrics?.userEngagement || []}
          title="User Engagement"
          xAxisKey="date"
          yAxisKey="users"
          loading={loading}
          exportable
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart
          type="bar"
          data={metrics?.serviceCategoryPerformance || []}
          title="Service Category Performance"
          xAxisKey="category"
          yAxisKey="revenue"
          loading={loading}
          exportable
        />
        <PerformanceChart
          type="pie"
          data={metrics?.revenueDistribution || []}
          title="Revenue Distribution"
          xAxisKey="category"
          yAxisKey="amount"
          loading={loading}
          exportable
        />
      </div>

      {/* Activity Heatmap */}
      <div className="mb-8">
        <ActivityHeatmap data={metrics?.activityHeatmap || []} loading={loading} />
      </div>
    </div>
  );
}
