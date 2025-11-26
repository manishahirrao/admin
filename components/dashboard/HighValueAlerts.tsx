'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HighValueAlert {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    cartValue: number;
  };
  cartValue: number;
  threshold: number;
  flaggedAt: string;
  status: 'new' | 'contacted' | 'converted' | 'dismissed';
  suggestions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    reasoning: string;
  }>;
}

export function HighValueAlerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<HighValueAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5000);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockAlerts: HighValueAlert[] = [
        {
          id: '1',
          userId: 'user1',
          user: {
            id: 'user1',
            fullName: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            email: 'rajesh.kumar@example.com',
            cartValue: 12500,
          },
          cartValue: 12500,
          threshold: 5000,
          flaggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'new',
          suggestions: [
            {
              type: 'immediate_call',
              priority: 'high',
              message: 'Call Rajesh Kumar immediately to discuss their ₹12,500 cart',
              reasoning: 'Cart value exceeds ₹10,000. Personal attention can increase conversion rate by 60%.',
            },
            {
              type: 'vip_service',
              priority: 'high',
              message: 'Offer VIP service package with dedicated priest and premium Aashirwad Box',
              reasoning: 'High cart value indicates willingness to pay for premium experience.',
            },
          ],
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            id: 'user2',
            fullName: 'Priya Sharma',
            phone: '+91 98765 43211',
            email: 'priya.sharma@example.com',
            cartValue: 7800,
          },
          cartValue: 7800,
          threshold: 5000,
          flaggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'new',
          suggestions: [
            {
              type: 'personalized_email',
              priority: 'medium',
              message: 'Send personalized email highlighting benefits of ritual services',
              reasoning: 'User has shown interest in multiple service types.',
            },
            {
              type: 'special_offer',
              priority: 'medium',
              message: 'Offer 10-15% discount to encourage immediate booking',
              reasoning: 'Cart abandoned for 5 hours. Time-limited discount can create urgency.',
            },
          ],
        },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUpdateStatus = async (alertId: string, status: HighValueAlert['status']) => {
    // TODO: Implement API call
    console.log('Updating alert status:', alertId, status);
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">High-Value User Alerts</h2>
            <p className="text-sm text-gray-600 mt-1">
              Users with cart value ≥ {formatCurrency(threshold)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Threshold"
            />
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No high-value alerts</h3>
            <p className="text-gray-600">All high-value users have been contacted</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {alert.user.fullName}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {formatCurrency(alert.cartValue)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {alert.user.phone} • {alert.user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Flagged {formatTimeAgo(alert.flaggedAt)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/users/${alert.userId}`)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                  {alert.status === 'new' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'contacted')}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                    >
                      Mark Contacted
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Suggested Actions:
                </div>
                {alert.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {suggestion.message}
                      </div>
                      <div className="text-xs text-gray-600">
                        {suggestion.reasoning}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
