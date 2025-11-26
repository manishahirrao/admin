'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  loading = false,
  onClick,
  subtitle,
}: MetricCardProps) {
  const isPositive = changeType === 'increase';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              {subtitle && <span className="text-sm text-gray-500 ml-2">{subtitle}</span>}
            </div>
          )}
          {!change && subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
