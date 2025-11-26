'use client';

import React from 'react';
import { Clock, Phone, User, IndianRupee, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  ritualName: string;
  deity: string;
  devoteeName: string;
  devoteePhone: string;
  scheduledTime: Date;
  totalValue: number;
  status: 'today' | 'this_week' | 'next_week' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, action: string) => Promise<void>;
  isLoading?: boolean;
}

const PRIORITY_COLORS = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-500',
};

const STATUS_COLORS = {
  today: 'border-red-200 bg-red-50',
  this_week: 'border-amber-200 bg-amber-50',
  next_week: 'border-blue-200 bg-blue-50',
  completed: 'border-green-200 bg-green-50',
};

export function OrderCard({ order, onStatusUpdate, isLoading }: OrderCardProps) {
  const handleAction = async (action: string) => {
    if (isLoading) return;
    await onStatusUpdate(order.id, action);
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md
        ${PRIORITY_COLORS[order.priority]}
        ${STATUS_COLORS[order.status]}
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      {/* Header */}
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          {order.ritualName}
        </h4>
        <p className="text-xs text-gray-600">
          Deity: <span className="font-medium">{order.deity}</span>
        </p>
      </div>

      {/* Devotee Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-700">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{order.devoteeName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Phone className="w-4 h-4 mr-2 text-gray-400" />
          <a
            href={`tel:${order.devoteePhone}`}
            className="hover:text-orange-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {order.devoteePhone}
          </a>
        </div>
      </div>

      {/* Schedule & Value */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{format(new Date(order.scheduledTime), 'MMM dd')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>{format(new Date(order.scheduledTime), 'hh:mm a')}</span>
        </div>
      </div>

      {/* Total Value */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">Total Value</span>
        <div className="flex items-center font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          <span>{order.totalValue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status !== 'completed' && (
        <div className="space-y-2">
          {order.status === 'today' && (
            <button
              onClick={() => handleAction('start_ritual')}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Live Ritual
            </button>
          )}
          
          <button
            onClick={() => handleAction('upload_video')}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Video
          </button>
          
          <button
            onClick={() => handleAction('mark_shipped')}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Shipped
          </button>
        </div>
      )}

      {order.status === 'completed' && (
        <div className="text-center py-2 text-sm text-green-600 font-medium">
          ✓ Completed
        </div>
      )}
    </div>
  );
}
