'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactUserModal } from '@/components/users/ContactUserModal';

interface UserDetail {
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
  preferredServices: string[];
  bookingHistory: Booking[];
  abandonedCarts: CartItem[];
  communicationLog: CommunicationEntry[];
  interactionTimeline: TimelineEvent[];
}

interface Booking {
  id: string;
  serviceName: string;
  serviceType: string;
  date: string;
  amount: number;
  status: string;
}

interface CartItem {
  id: string;
  serviceName: string;
  serviceType: string;
  quantity: number;
  price: number;
  addedAt: string;
  lastUpdated: string;
}

interface CommunicationEntry {
  id: string;
  type: 'sms' | 'email' | 'in_app';
  template: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  message: string;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  type: 'booking' | 'cart' | 'communication' | 'activity';
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'carts' | 'communications' | 'timeline'>('overview');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [params.id]);

  const fetchUserDetail = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockUser: UserDetail = {
        id: params.id,
        fullName: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@example.com',
        registrationDate: '2024-01-15T10:30:00Z',
        activityScore: 85,
        cartValue: 7500,
        orderCount: 12,
        lastActivity: '2024-11-25T14:20:00Z',
        status: 'high_value',
        preferredServices: ['Satyanarayan Puja', 'Ganesh Puja', 'Chadhava'],
        bookingHistory: [
          {
            id: '1',
            serviceName: 'Satyanarayan Puja',
            serviceType: 'ritual',
            date: '2024-11-20T10:00:00Z',
            amount: 2500,
            status: 'completed',
          },
          {
            id: '2',
            serviceName: 'Ganesh Chadhava',
            serviceType: 'chadhava',
            date: '2024-11-15T09:00:00Z',
            amount: 500,
            status: 'completed',
          },
        ],
        abandonedCarts: [
          {
            id: '1',
            serviceName: 'Lakshmi Puja',
            serviceType: 'ritual',
            quantity: 1,
            price: 3500,
            addedAt: '2024-11-22T15:30:00Z',
            lastUpdated: '2024-11-23T10:00:00Z',
          },
        ],
        communicationLog: [
          {
            id: '1',
            type: 'sms',
            template: 'Cart Abandonment Reminder',
            sentAt: '2024-11-24T10:00:00Z',
            status: 'delivered',
            message: 'Hi Rajesh, you have items in your cart. Complete your booking now!',
          },
        ],
        interactionTimeline: [
          {
            id: '1',
            timestamp: '2024-11-25T14:20:00Z',
            event: 'Viewed Ritual Details',
            description: 'Viewed Satyanarayan Puja details',
            type: 'activity',
          },
          {
            id: '2',
            timestamp: '2024-11-24T10:00:00Z',
            event: 'SMS Sent',
            description: 'Cart abandonment reminder sent',
            type: 'communication',
          },
          {
            id: '3',
            timestamp: '2024-11-23T10:00:00Z',
            event: 'Cart Updated',
            description: 'Added Lakshmi Puja to cart',
            type: 'cart',
          },
        ],
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Error fetching user detail:', error);
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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      high_value: 'bg-purple-100 text-purple-800',
      at_risk: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'cart':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
        );
      case 'communication':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
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

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/users')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Users
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
          onClick={() => router.push('/users')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600 mt-1">{user.email} • {user.phone}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(user.status)}
            <button 
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact User
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Cart Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(user.cartValue)}</div>
          {user.cartValue >= 5000 && (
            <div className="mt-2 text-xs text-orange-600 font-medium">High Value User</div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{user.orderCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Activity Score</div>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-900 mr-3">{user.activityScore}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${user.activityScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Last Activity</div>
          <div className="text-sm font-medium text-gray-900">{formatDate(user.lastActivity)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: 'Booking History' },
              { id: 'carts', label: 'Abandoned Carts' },
              { id: 'communications', label: 'Communications' },
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Services</h3>
                <div className="flex flex-wrap gap-2">
                  {user.preferredServices.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Registration Date</div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(user.registrationDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">User ID</div>
                    <div className="text-sm font-medium text-gray-900">{user.id}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {user.bookingHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No bookings yet</div>
              ) : (
                user.bookingHistory.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{booking.serviceName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {booking.serviceType} • {formatDate(booking.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(booking.amount)}</div>
                        <div className="mt-1">{getStatusBadge(booking.status)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Abandoned Carts Tab */}
          {activeTab === 'carts' && (
            <div className="space-y-4">
              {user.abandonedCarts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No abandoned carts</div>
              ) : (
                user.abandonedCarts.map((cart) => (
                  <div key={cart.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{cart.serviceName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Added: {formatDate(cart.addedAt)} • Last Updated: {formatDate(cart.lastUpdated)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(cart.price)}</div>
                        <div className="text-sm text-gray-600 mt-1">Qty: {cart.quantity}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              {user.communicationLog.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No communications yet</div>
              ) : (
                user.communicationLog.map((comm) => (
                  <div key={comm.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{comm.template}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {comm.type.toUpperCase()} • {formatDate(comm.sentAt)}
                        </div>
                      </div>
                      {getStatusBadge(comm.status)}
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-3 mt-2">
                      {comm.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {user.interactionTimeline.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No timeline events</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  {user.interactionTimeline.map((event, index) => (
                    <div key={event.id} className="relative flex items-start mb-6 last:mb-0">
                      <div className="relative z-10">{getTimelineIcon(event.type)}</div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900">{event.event}</div>
                          <div className="text-sm text-gray-500">{formatDate(event.timestamp)}</div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact User Modal */}
      {user && (
        <ContactUserModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          user={{
            id: user.id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
          }}
          onSend={async (data) => {
            // TODO: Implement actual API call
            console.log('Sending message:', data);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert(`Message sent successfully via ${data.type}!`);
          }}
        />
      )}
    </div>
  );
}
