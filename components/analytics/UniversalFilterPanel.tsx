'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, Users, Filter, X, Save } from 'lucide-react';
import { format } from 'date-fns';

interface FilterConfig {
  dateRange: { start: Date | null; end: Date | null };
  templeLocation: string[];
  serviceCategory: string[];
  userSegment: string[];
  status: string[];
}

interface UniversalFilterPanelProps {
  onFilterChange: (filters: FilterConfig) => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, filters: FilterConfig) => void;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterConfig;
}

const SERVICE_CATEGORIES = ['Rituals', 'Chadhava', 'Holy Items', 'Live Darshan'];
const USER_SEGMENTS = ['All Users', 'High Value', 'Active', 'At Risk', 'New'];
const STATUSES = ['Active', 'Pending', 'Completed', 'Cancelled'];
const TEMPLE_LOCATIONS = ['Mumbai', 'Delhi', 'Varanasi', 'Haridwar', 'Tirupati', 'Shirdi'];

export function UniversalFilterPanel({
  onFilterChange,
  savedFilters = [],
  onSaveFilter,
}: UniversalFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    templeLocation: [],
    serviceCategory: [],
    userSegment: [],
    status: [],
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Load filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('universal_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
        onFilterChange(parsed);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('universal_filters', JSON.stringify(filters));
    onFilterChange(filters);
  }, [filters]);

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value ? new Date(value) : null,
      },
    }));
  };

  const toggleArrayFilter = (key: keyof FilterConfig, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  const clearFilters = () => {
    const emptyFilters: FilterConfig = {
      dateRange: { start: null, end: null },
      templeLocation: [],
      serviceCategory: [],
      userSegment: [],
      status: [],
    };
    setFilters(emptyFilters);
    localStorage.removeItem('universal_filters');
  };

  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    setIsOpen(false);
  };

  const activeFilterCount = 
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    filters.templeLocation.length +
    filters.serviceCategory.length +
    filters.userSegment.length +
    filters.status.length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-orange-600 text-white text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Date Range */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Temple Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Temple Location
              </label>
              <div className="space-y-1">
                {TEMPLE_LOCATIONS.map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.templeLocation.includes(location)}
                      onChange={() => toggleArrayFilter('templeLocation', location)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Category */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                Service Category
              </label>
              <div className="space-y-1">
                {SERVICE_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.serviceCategory.includes(category)}
                      onChange={() => toggleArrayFilter('serviceCategory', category)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* User Segment */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-2" />
                User Segment
              </label>
              <div className="space-y-1">
                {USER_SEGMENTS.map(segment => (
                  <label key={segment} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.userSegment.includes(segment)}
                      onChange={() => toggleArrayFilter('userSegment', segment)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{segment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 mr-2" />
                Status
              </label>
              <div className="space-y-1">
                {STATUSES.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleArrayFilter('status', status)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear All
            </button>
            <div className="flex items-center space-x-2">
              {onSaveFilter && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Saved Filters</p>
              <div className="space-y-1">
                {savedFilters.map(saved => (
                  <button
                    key={saved.id}
                    onClick={() => loadSavedFilter(saved)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    {saved.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
