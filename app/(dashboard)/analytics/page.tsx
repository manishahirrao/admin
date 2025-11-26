'use client';

import React, { useState, useEffect } from 'react';
import { UniversalFilterPanel } from '@/components/analytics/UniversalFilterPanel';
import { ExportButton } from '@/components/analytics/ExportButton';
import { PreBuiltReports } from '@/components/analytics/PreBuiltReports';
import { CustomReportBuilder } from '@/components/analytics/CustomReportBuilder';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/useToast';

interface FilterConfig {
  dateRange: { start: Date | null; end: Date | null };
  templeLocation: string[];
  serviceCategory: string[];
  userSegment: string[];
  status: string[];
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'custom'>('reports');
  const [filters, setFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    templeLocation: [],
    serviceCategory: [],
    userSegment: [],
    status: [],
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);

      // Build query parameters from filters
      const params = new URLSearchParams({
        type: 'overview',
      });

      if (filters.dateRange.start) {
        params.append('startDate', filters.dateRange.start.toISOString());
      }
      if (filters.dateRange.end) {
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      if (filters.serviceCategory.length > 0) {
        params.append('category', filters.serviceCategory[0]);
      }
      if (filters.status.length > 0) {
        params.append('status', filters.status[0]);
      }

      // Load analytics data from API
      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showToast('Failed to load analytics data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
  };

  const handleSaveFilter = (name: string, filters: FilterConfig) => {
    // Save filter to database
    console.log('Saving filter:', name, filters);
    showToast('Filter saved successfully', 'success');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-sm text-gray-600 mt-1">
              Analyze platform performance and generate custom reports
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <UniversalFilterPanel
              onFilterChange={handleFilterChange}
              onSaveFilter={handleSaveFilter}
            />
            {reportData && (
              <ExportButton
                data={reportData.rawData || []}
                columns={reportData.columns || []}
                filename="analytics_report"
                filters={filters}
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('reports')}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'reports'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            Pre-Built Reports
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${activeTab === 'custom'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            Custom Report Builder
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'reports' && (
              <PreBuiltReports data={reportData} filters={filters} />
            )}
            {activeTab === 'custom' && (
              <CustomReportBuilder filters={filters} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
