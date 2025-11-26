'use client';

import { useEffect, useState } from 'react';
import {
  WorkloadAlert,
  WorkloadRedistributionSuggestion,
} from '@/lib/services/workload-alert.service';

interface WorkloadAlertsProps {
  onViewPriest?: (priestId: string) => void;
  onRedistribute?: (suggestion: WorkloadRedistributionSuggestion) => void;
}

export function WorkloadAlerts({ onViewPriest, onRedistribute }: WorkloadAlertsProps) {
  const [alerts, setAlerts] = useState<WorkloadAlert[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, WorkloadRedistributionSuggestion[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/priests/workload-alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching workload alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (priestId: string) => {
    if (suggestions[priestId]) {
      // Already loaded
      return;
    }

    try {
      const response = await fetch(`/api/priests/${priestId}/redistribution-suggestions`);
      const data = await response.json();
      setSuggestions(prev => ({
        ...prev,
        [priestId]: data.suggestions || [],
      }));
    } catch (error) {
      console.error('Error fetching redistribution suggestions:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/priests/workload-alerts/${alertId}`, {
        method: 'DELETE',
      });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const toggleExpand = (alertId: string) => {
    if (expandedAlert === alertId) {
      setExpandedAlert(null);
    } else {
      setExpandedAlert(alertId);
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        fetchSuggestions(alert.priestId);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">All Clear!</h3>
            <p className="text-sm text-gray-600 mt-1">
              No priests are currently overloaded. All workloads are within optimal capacity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workload Alerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              {alerts.length} priest{alerts.length !== 1 ? 's' : ''} approaching or exceeding
              capacity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {alerts.filter(a => a.alertLevel === 'critical').length} Critical
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              {alerts.filter(a => a.alertLevel === 'warning').length} Warning
            </span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {alerts.map(alert => {
          const isExpanded = expandedAlert === alert.id;
          const priestSuggestions = suggestions[alert.priestId] || [];

          return (
            <div key={alert.id} className="p-6">
              {/* Alert Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Alert Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alert.alertLevel === 'critical'
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        alert.alertLevel === 'critical'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {alert.priestName}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          alert.alertLevel === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {alert.alertLevel.toUpperCase()}
                      </span>
                    </div>

                    {/* Workload Stats */}
                    <div className="mt-2 flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-gray-600">Current Load:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {alert.currentLoad} / {alert.optimalCapacity} rituals
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Utilization:</span>
                        <span
                          className={`ml-2 font-semibold ${
                            alert.utilizationPercentage >= 85
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {alert.utilizationPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            alert.utilizationPercentage >= 85
                              ? 'bg-red-600'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(alert.utilizationPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => onViewPriest?.(alert.priestId)}
                    className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    View Priest
                  </button>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss alert"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-6 space-y-4">
                  {/* Suggested Actions */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Suggested Actions
                    </h5>
                    <ul className="space-y-2">
                      {alert.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Redistribution Suggestions */}
                  {priestSuggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">
                        Redistribution Suggestions
                      </h5>
                      <div className="space-y-2">
                        {priestSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Reassign to {suggestion.toPriestName}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
                              </div>
                              <button
                                onClick={() => onRedistribute?.(suggestion)}
                                className="ml-4 px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors"
                              >
                                Reassign
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
