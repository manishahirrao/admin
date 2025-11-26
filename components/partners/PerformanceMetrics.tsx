'use client';

import React from 'react';
import { TrendingUp, Star, CheckCircle, IndianRupee, Clock, Video } from 'lucide-react';

interface PerformanceData {
  completionRate: number;
  averageRating: number;
  ritualsCompleted: number;
  revenueGenerated: number;
  onTimeCompletion: number;
  videoDeliveryTime: number;
}

interface PerformanceMetricsProps {
  data: PerformanceData;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  color: string;
}

function MetricCard({ icon, label, value, suffix, trend, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">
          {value}{suffix}
        </p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      label: 'Completion Rate',
      value: data.completionRate.toFixed(1),
      suffix: '%',
      color: 'bg-green-50',
      trend: 5.2,
    },
    {
      icon: <Star className="w-5 h-5 text-amber-600" />,
      label: 'Average Rating',
      value: data.averageRating.toFixed(1),
      suffix: '/5',
      color: 'bg-amber-50',
      trend: 2.1,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      label: 'Rituals Completed',
      value: data.ritualsCompleted,
      suffix: '',
      color: 'bg-blue-50',
    },
    {
      icon: <IndianRupee className="w-5 h-5 text-purple-600" />,
      label: 'Revenue Generated',
      value: `₹${(data.revenueGenerated / 1000).toFixed(1)}K`,
      suffix: '',
      color: 'bg-purple-50',
      trend: 12.5,
    },
    {
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      label: 'On-Time Completion',
      value: data.onTimeCompletion.toFixed(1),
      suffix: '%',
      color: 'bg-orange-50',
      trend: -1.3,
    },
    {
      icon: <Video className="w-5 h-5 text-red-600" />,
      label: 'Avg Video Delivery',
      value: data.videoDeliveryTime.toFixed(0),
      suffix: 'hrs',
      color: 'bg-red-50',
      trend: -8.4,
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
}
