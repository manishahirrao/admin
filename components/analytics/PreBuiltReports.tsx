'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Building, UserCheck } from 'lucide-react';

interface PreBuiltReportsProps {
  data: any;
  filters: any;
}

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

export function PreBuiltReports({ data, filters }: PreBuiltReportsProps) {
  // Mock data for demonstration
  const revenueByService = [
    { name: 'Rituals', value: 450000, percentage: 45 },
    { name: 'Chadhava', value: 300000, percentage: 30 },
    { name: 'Holy Items', value: 150000, percentage: 15 },
    { name: 'Live Darshan', value: 100000, percentage: 10 },
  ];

  const userAcquisition = [
    { month: 'Jan', organic: 120, referral: 80, social: 40 },
    { month: 'Feb', organic: 150, referral: 90, social: 50 },
    { month: 'Mar', organic: 180, referral: 100, social: 60 },
    { month: 'Apr', organic: 200, referral: 120, social: 70 },
    { month: 'May', organic: 220, referral: 130, social: 80 },
    { month: 'Jun', organic: 250, referral: 150, social: 90 },
  ];

  const cartAbandonment = [
    { stage: 'Cart Created', users: 1000 },
    { stage: 'Added Items', users: 850 },
    { stage: 'Checkout Started', users: 600 },
    { stage: 'Payment Initiated', users: 450 },
    { stage: 'Order Completed', users: 380 },
  ];

  const templePerformance = [
    { temple: 'Varanasi Temple', bookings: 450, revenue: 225000, rating: 4.8 },
    { temple: 'Haridwar Temple', bookings: 380, revenue: 190000, rating: 4.7 },
    { temple: 'Tirupati Temple', bookings: 320, revenue: 160000, rating: 4.9 },
    { temple: 'Shirdi Temple', bookings: 280, revenue: 140000, rating: 4.6 },
    { temple: 'Mumbai Temple', bookings: 250, revenue: 125000, rating: 4.5 },
  ];

  const priestUtilization = [
    { name: 'Pandit Sharma', utilization: 85, rituals: 34 },
    { name: 'Pandit Kumar', utilization: 78, rituals: 31 },
    { name: 'Pandit Verma', utilization: 92, rituals: 37 },
    { name: 'Pandit Singh', utilization: 65, rituals: 26 },
    { name: 'Pandit Patel', utilization: 88, rituals: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue by Service Type */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Service Type</h3>
            <p className="text-sm text-gray-600">Total revenue distribution across services</p>
          </div>
          <TrendingUp className="w-6 h-6 text-orange-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByService}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByService.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {revenueByService.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{item.value.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Acquisition Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Acquisition Sources</h3>
            <p className="text-sm text-gray-600">New users by acquisition channel</p>
          </div>
          <Users className="w-6 h-6 text-orange-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userAcquisition}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="organic" stroke="#ea580c" strokeWidth={2} />
            <Line type="monotone" dataKey="referral" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="social" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cart Abandonment Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cart Abandonment Analysis</h3>
            <p className="text-sm text-gray-600">User drop-off at each checkout stage</p>
          </div>
          <ShoppingCart className="w-6 h-6 text-orange-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cartAbandonment}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#ea580c" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Insight:</strong> 62% of users who start checkout complete their order. 
            Focus on reducing drop-off between "Checkout Started" and "Payment Initiated".
          </p>
        </div>
      </div>

      {/* Temple Performance Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Temple Performance Comparison</h3>
            <p className="text-sm text-gray-600">Top performing temples by bookings and revenue</p>
          </div>
          <Building className="w-6 h-6 text-orange-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Temple</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Bookings</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Rating</th>
              </tr>
            </thead>
            <tbody>
              {templePerformance.map((temple, index) => (
                <tr key={temple.temple} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">{temple.temple}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">{temple.bookings}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    ₹{temple.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ⭐ {temple.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priest Utilization Rates */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Priest Utilization Rates</h3>
            <p className="text-sm text-gray-600">Workload distribution across priests</p>
          </div>
          <UserCheck className="w-6 h-6 text-orange-600" />
        </div>
        <div className="space-y-4">
          {priestUtilization.map((priest) => (
            <div key={priest.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{priest.name}</span>
                <span className="text-sm text-gray-600">{priest.rituals} rituals</span>
              </div>
              <div className="relative">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      priest.utilization > 85 ? 'bg-red-500' :
                      priest.utilization > 70 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${priest.utilization}%` }}
                  />
                </div>
                <span className="absolute right-0 top-0 text-xs font-medium text-gray-700">
                  {priest.utilization}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
