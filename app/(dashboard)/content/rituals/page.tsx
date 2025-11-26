'use client';

import { useEffect, useState } from 'react';
import { DataTable, Column } from '@/components/tables/DataTable';

interface Ritual {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRituals();
  }, []);

  const fetchRituals = async () => {
    try {
      const response = await fetch('/api/content/rituals');
      if (response.ok) {
        const data = await response.json();
        setRituals(data);
      }
    } catch (error) {
      console.error('Error fetching rituals:', error);
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

  const columns: Column<Ritual>[] = [
    {
      key: 'name',
      label: 'Ritual Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <div className="max-w-md truncate text-sm text-gray-600">
          {value || 'No description'}
        </div>
      ),
    },
    {
      key: 'base_price',
      label: 'Base Price',
      sortable: true,
      render: (value) => (
        <div className="font-semibold text-gray-900">{formatCurrency(value)}</div>
      ),
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      sortable: true,
      render: (value) => `${value} min`,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ritual Management</h1>
          <p className="text-gray-600 mt-1">Manage ritual offerings and pricing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Ritual
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={rituals}
          columns={columns}
          loading={loading}
          onRowClick={(ritual) => console.log('Edit ritual:', ritual.id)}
          keyExtractor={(ritual) => ritual.id}
        />
      </div>

      {rituals.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rituals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first ritual offering.
          </p>
        </div>
      )}
    </div>
  );
}
