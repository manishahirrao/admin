'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/tables/DataTable';

interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  registrationDate: string;
  activityScore: number;
  cartValue: number;
  orderCount: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'high_value' | 'at_risk';
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      high_value: 'bg-purple-100 text-purple-800',
      at_risk: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getHighValueBadge = (cartValue: number) => {
    if (cartValue >= 5000) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white ml-2">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          High Value
        </span>
      );
    }
    return null;
  };

  const getPriorityIndicator = (cartValue: number) => {
    if (cartValue >= 10000) {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium text-red-600">Priority</span>
        </div>
      );
    } else if (cartValue >= 5000) {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
          <span className="text-xs font-medium text-orange-600">High</span>
        </div>
      );
    }
    return null;
  };

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <span className="font-medium">{value}</span>
          {getHighValueBadge(row.cartValue)}
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: false,
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'activityScore',
      label: 'Activity Score',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'cartValue',
      label: 'Cart Value',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{formatCurrency(value)}</div>
          {getPriorityIndicator(row.cartValue)}
        </div>
      ),
    },
    {
      key: 'orderCount',
      label: 'Orders',
      sortable: true,
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and track user journeys and engagement</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => {
              const sorted = [...users].sort((a, b) => b.cartValue - a.cartValue);
              setUsers(sorted);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort by Cart Value
          </button>
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

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onRowClick={(user) => router.push(`/users/${user.id}`)}
        keyExtractor={(user) => user.id}
      />
    </div>
  );
}
