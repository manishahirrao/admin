'use client';

import { useEffect, useState } from 'react';
import { DataTable, Column } from '@/components/tables/DataTable';

interface TemplePartner {
  id: string;
  templeName: string;
  location: string;
  city: string;
  state: string;
  category: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  totalBookings: number;
  averageRating: number;
  revenueGenerated: number;
  activeServices: string[];
  completionRate: number;
  onTimeDeliveryRate: number;
}

interface Priest {
  id: string;
  name: string;
  templeId: string;
  templeName: string;
  specializations: string[];
  experienceYears: number;
  totalRitualsPerformed: number;
  averageRating: number;
  currentLoad: number;
  maxCapacity: number;
}

export default function TemplesPage() {
  const [activeTab, setActiveTab] = useState<'temples' | 'priests'>('temples');
  const [temples, setTemples] = useState<TemplePartner[]>([]);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'temples') {
        // Mock temple data
        const mockTemples: TemplePartner[] = [
          {
            id: '1',
            templeName: 'Shri Ram Mandir',
            location: 'Ayodhya',
            city: 'Ayodhya',
            state: 'Uttar Pradesh',
            category: ['Vishnu', 'Ram'],
            verificationStatus: 'verified',
            totalBookings: 245,
            averageRating: 4.8,
            revenueGenerated: 612500,
            activeServices: ['Satyanarayan Puja', 'Ram Puja', 'Chadhava'],
            completionRate: 98,
            onTimeDeliveryRate: 95,
          },
          {
            id: '2',
            templeName: 'Ganesh Temple',
            location: 'Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            category: ['Ganesh'],
            verificationStatus: 'verified',
            totalBookings: 189,
            averageRating: 4.6,
            revenueGenerated: 378000,
            activeServices: ['Ganesh Puja', 'Chadhava'],
            completionRate: 96,
            onTimeDeliveryRate: 92,
          },
         
        ];
        setTemples(mockTemples);
      } else {
        // Mock priest data
        const mockPriests: Priest[] = [
          {
            id: '1',
            name: 'Pandit Sharma',
            templeId: '1',
            templeName: 'Shri Ram Mandir',
            specializations: ['Satyanarayan Puja', 'Ram Puja', 'Vedic Rituals'],
            experienceYears: 15,
            totalRitualsPerformed: 450,
            averageRating: 4.9,
            currentLoad: 12,
            maxCapacity: 20,
          },
          {
            id: '2',
            name: 'Pandit Mishra',
            templeId: '2',
            templeName: 'Ganesh Temple',
            specializations: ['Ganesh Puja', 'Chadhava'],
            experienceYears: 10,
            totalRitualsPerformed: 320,
            averageRating: 4.7,
            currentLoad: 8,
            maxCapacity: 15,
          },
          {
            id: '3',
            name: 'Pandit Verma',
            templeId: '3',
            templeName: 'Lakshmi Temple',
            specializations: ['Lakshmi Puja', 'Diwali Rituals'],
            experienceYears: 8,
            totalRitualsPerformed: 180,
            averageRating: 4.6,
            currentLoad: 18,
            maxCapacity: 20,
          },
        ];
        setPriests(mockPriests);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const getVerificationBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getCapacityColor = (load: number, max: number) => {
    const percentage = (load / max) * 100;
    if (percentage >= 85) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const templeColumns: Column<TemplePartner>[] = [
    {
      key: 'templeName',
      label: 'Temple Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.location}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: false,
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((cat, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
              {cat}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      label: 'Status',
      sortable: true,
      render: (value) => getVerificationBadge(value),
    },
    {
      key: 'totalBookings',
      label: 'Bookings',
      sortable: true,
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'revenueGenerated',
      label: 'Revenue',
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: 'completionRate',
      label: 'Completion',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      ),
    },
  ];

  const priestColumns: Column<Priest>[] = [
    {
      key: 'name',
      label: 'Priest Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-600">{row.templeName}</div>
        </div>
      ),
    },
    {
      key: 'specializations',
      label: 'Specializations',
      sortable: false,
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((spec, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
              {spec}
            </span>
          ))}
          {value.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              +{value.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'experienceYears',
      label: 'Experience',
      sortable: true,
      render: (value) => `${value} years`,
    },
    {
      key: 'totalRitualsPerformed',
      label: 'Rituals',
      sortable: true,
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'currentLoad',
      label: 'Workload',
      sortable: true,
      render: (value, row) => {
        const percentage = (value / row.maxCapacity) * 100;
        return (
          <div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCapacityColor(value, row.maxCapacity)}`}>
              {value}/{row.maxCapacity}
            </div>
            <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600 mt-1">Manage temple partners and priests</p>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'temples', label: 'Temple Partners', count: temples.length },
              { id: 'priests', label: 'Priests', count: priests.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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

      {/* Data Table */}
      {activeTab === 'temples' ? (
        <DataTable
          data={temples}
          columns={templeColumns}
          loading={loading}
          onRowClick={(temple) => console.log('View temple:', temple.id)}
          keyExtractor={(temple) => temple.id}
        />
      ) : (
        <DataTable
          data={priests}
          columns={priestColumns}
          loading={loading}
          onRowClick={(priest) => console.log('View priest:', priest.id)}
          keyExtractor={(priest) => priest.id}
        />
      )}
    </div>
  );
}
