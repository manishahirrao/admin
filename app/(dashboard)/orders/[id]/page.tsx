'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderDetail {
  id: string;
  orderId: string;
  orderType: 'ritual' | 'chadhava' | 'holy_item';
  userName: string;
  userPhone: string;
  userEmail: string;
  userAddress: string;
  serviceName: string;
  templeName?: string;
  priestName?: string;
  scheduledDate: string;
  totalValue: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  aashirwadBox?: {
    status: 'pending' | 'prepared' | 'shipped' | 'delivered';
    trackingNumber?: string;
    courier?: string;
    shippedDate?: string;
    expectedDeliveryDate?: string;
    deliveredDate?: string;
  };
  videoProof?: {
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    uploadDate?: string;
    videoUrl?: string;
    duration?: number;
  };
  timeline: Array<{
    id: string;
    timestamp: string;
    event: string;
    description: string;
    performedBy: string;
  }>;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'aashirwad' | 'video' | 'timeline'>('overview');

  useEffect(() => {
    fetchOrderDetail();
  }, [params.id]);

  const fetchOrderDetail = async () => {
    try {
      // Mock data
      const mockOrder: OrderDetail = {
        id: params.id,
        orderId: 'ORD-2024-001',
        orderType: 'ritual',
        userName: 'Rajesh Kumar',
        userPhone: '+91 98765 43210',
        userEmail: 'rajesh@example.com',
        userAddress: '123 Main St, Mumbai, Maharashtra 400001',
        serviceName: 'Satyanarayan Puja',
        templeName: 'Shri Ram Mandir',
        priestName: 'Pandit Sharma',
        scheduledDate: '2024-12-01T10:00:00Z',
        totalValue: 2500,
        status: 'in_progress',
        paymentStatus: 'completed',
        aashirwadBox: {
          status: 'shipped',
          trackingNumber: 'TRACK123456',
          courier: 'Blue Dart',
          shippedDate: '2024-11-26T14:00:00Z',
          expectedDeliveryDate: '2024-11-29T18:00:00Z',
        },
        videoProof: {
          status: 'uploaded',
          uploadDate: '2024-11-26T11:00:00Z',
          videoUrl: 'https://example.com/video.mp4',
          duration: 180,
        },
        timeline: [
          {
            id: '1',
            timestamp: '2024-11-26T11:00:00Z',
            event: 'Video Proof Uploaded',
            description: 'Ritual video uploaded by temple',
            performedBy: 'Shri Ram Mandir',
          },
          {
            id: '2',
            timestamp: '2024-11-26T14:00:00Z',
            event: 'Aashirwad Box Shipped',
            description: 'Package shipped via Blue Dart',
            performedBy: 'Admin',
          },
        ],
      };
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
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
      upcoming: 'bg-green-100 text-green-800',
      in_progress: 'bg-amber-100 text-amber-800',
      completed: 'bg-gray-100 text-gray-800',
      delayed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      prepared: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      uploaded: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.orderId}</h1>
            <p className="text-gray-600 mt-1">{order.serviceName} • {order.templeName}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Scheduled Date</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(order.scheduledDate)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Payment Status</div>
          {getStatusBadge(order.paymentStatus)}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Order Type</div>
          <div className="text-sm font-medium text-gray-900 capitalize">{order.orderType.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'aashirwad', label: 'Aashirwad Box' },
              { id: 'video', label: 'Video Proof' },
              { id: 'timeline', label: 'Timeline' },
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-sm font-medium text-gray-900">{order.userPhone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-sm font-medium text-gray-900">{order.userEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Address</div>
                    <div className="text-sm font-medium text-gray-900">{order.userAddress}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Service</div>
                    <div className="text-sm font-medium text-gray-900">{order.serviceName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Temple</div>
                    <div className="text-sm font-medium text-gray-900">{order.templeName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Priest</div>
                    <div className="text-sm font-medium text-gray-900">{order.priestName || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aashirwad Box Tab */}
          {activeTab === 'aashirwad' && order.aashirwadBox && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Delivery Tracking</h3>
                {getStatusBadge(order.aashirwadBox.status)}
              </div>
              
              {/* Progress Indicator */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  {['pending', 'prepared', 'shipped', 'delivered'].map((step, index) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        ['pending', 'prepared', 'shipped', 'delivered'].indexOf(order.aashirwadBox!.status) >= index
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="text-xs mt-2 capitalize">{step}</div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {order.aashirwadBox.trackingNumber && (
                  <div>
                    <div className="text-sm text-gray-600">Tracking Number</div>
                    <div className="text-sm font-medium text-gray-900">{order.aashirwadBox.trackingNumber}</div>
                  </div>
                )}
                {order.aashirwadBox.courier && (
                  <div>
                    <div className="text-sm text-gray-600">Courier</div>
                    <div className="text-sm font-medium text-gray-900">{order.aashirwadBox.courier}</div>
                  </div>
                )}
                {order.aashirwadBox.shippedDate && (
                  <div>
                    <div className="text-sm text-gray-600">Shipped Date</div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(order.aashirwadBox.shippedDate)}</div>
                  </div>
                )}
                {order.aashirwadBox.expectedDeliveryDate && (
                  <div>
                    <div className="text-sm text-gray-600">Expected Delivery</div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(order.aashirwadBox.expectedDeliveryDate)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Proof Tab */}
          {activeTab === 'video' && order.videoProof && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Video Proof</h3>
                {getStatusBadge(order.videoProof.status)}
              </div>
              
              {order.videoProof.status === 'uploaded' || order.videoProof.status === 'verified' ? (
                <div>
                  <div className="bg-gray-100 rounded-lg p-8 text-center mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      Play Video
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Upload Date</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(order.videoProof.uploadDate!)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="text-sm font-medium text-gray-900">{order.videoProof.duration} seconds</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Video proof pending upload
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {order.timeline.map((event) => (
                  <div key={event.id} className="relative flex items-start mb-6 last:mb-0">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{event.event}</div>
                        <div className="text-sm text-gray-500">{formatDate(event.timestamp)}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                      <div className="text-xs text-gray-500 mt-1">By: {event.performedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
