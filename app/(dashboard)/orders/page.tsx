'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/tables/DataTable';

interface Order {
  id: string;
  orderId: string;
  referenceId: string;
  orderType: 'ritual' | 'chadhava' | 'holy_item';
  userName: string;
  userPhone: string;
  userEmail: string;
  serviceName: string;
  templeName?: string;
  priestName?: string;
  scheduledDate: string;
  totalValue: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        status: statusFilter,
      });
      
      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      upcoming: 'bg-green-100 text-green-800 border-green-300',
      in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      delayed: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[status as keyof typeof colors]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'ritual':
        return '🕉️';
      case 'chadhava':
        return '🙏';
      case 'holy_item':
        return '📿';
      default:
        return '📦';
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.referenceId}</div>
        </div>
      ),
    },
    {
      key: 'orderType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getOrderTypeIcon(value)}</span>
          <span className="text-sm capitalize">{value.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'User Details',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.userPhone}</div>
        </div>
      ),
    },
    {
      key: 'serviceName',
      label: 'Service',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.templeName && (
            <div className="text-xs text-gray-600">{row.templeName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'priestName',
      label: 'Priest',
      sortable: false,
      render: (value) => value || '-',
    },
    {
      key: 'scheduledDate',
      label: 'Date/Time',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      sortable: true,
      render: (value) => (
        <div className="font-semibold text-gray-900">{formatCurrency(value)}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value) => getPaymentStatusBadge(value),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all orders across services</p>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: 4 },
              { id: 'upcoming', label: 'Upcoming', count: 1 },
              { id: 'in_progress', label: 'In Progress', count: 1 },
              { id: 'completed', label: 'Completed', count: 1 },
              { id: 'delayed', label: 'Delayed', count: 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  statusFilter === tab.id
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        onRowClick={(order) => router.push(`/orders/${order.id}`)}
        keyExtractor={(order) => order.id}
      />
    </div>
  );
}
