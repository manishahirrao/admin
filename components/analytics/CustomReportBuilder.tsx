'use client';

import React, { useState } from 'react';
import { Plus, X, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Table } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CustomReportBuilderProps {
  filters: any;
}

const AVAILABLE_METRICS = [
  { id: 'revenue', label: 'Revenue', category: 'Financial' },
  { id: 'bookings', label: 'Bookings', category: 'Orders' },
  { id: 'users', label: 'Users', category: 'Users' },
  { id: 'cart_value', label: 'Cart Value', category: 'Financial' },
  { id: 'completion_rate', label: 'Completion Rate', category: 'Performance' },
  { id: 'rating', label: 'Average Rating', category: 'Performance' },
];

const AVAILABLE_DIMENSIONS = [
  { id: 'date', label: 'Date' },
  { id: 'temple', label: 'Temple' },
  { id: 'service_type', label: 'Service Type' },
  { id: 'user_segment', label: 'User Segment' },
  { id: 'priest', label: 'Priest' },
];

const VISUALIZATION_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { id: 'line', label: 'Line Chart', icon: LineChartIcon },
  { id: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { id: 'table', label: 'Data Table', icon: Table },
];

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

export function CustomReportBuilder({ filters }: CustomReportBuilderProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [visualizationType, setVisualizationType] = useState<string>('bar');
  const [reportName, setReportName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Mock data for preview
  const mockData = [
    { name: 'Category A', value: 400 },
    { name: 'Category B', value: 300 },
    { name: 'Category C', value: 200 },
    { name: 'Category D', value: 100 },
  ];

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    );
  };

  const toggleDimension = (dimensionId: string) => {
    setSelectedDimensions(prev =>
      prev.includes(dimensionId)
        ? prev.filter(d => d !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  const handleGenerateReport = () => {
    if (selectedMetrics.length === 0 || selectedDimensions.length === 0) {
      alert('Please select at least one metric and one dimension');
      return;
    }
    setShowPreview(true);
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }
    console.log('Saving report:', {
      name: reportName,
      metrics: selectedMetrics,
      dimensions: selectedDimensions,
      visualization: visualizationType,
      filters,
    });
    alert('Report saved successfully!');
  };

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ea580c" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={mockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Value</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{row.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        {/* Metrics Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics</h3>
          <div className="space-y-2">
            {AVAILABLE_METRICS.map(metric => (
              <label key={metric.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => toggleMetric(metric.id)}
                  className="mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                  <p className="text-xs text-gray-500">{metric.category}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dimensions Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Dimensions</h3>
          <div className="space-y-2">
            {AVAILABLE_DIMENSIONS.map(dimension => (
              <label key={dimension.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDimensions.includes(dimension.id)}
                  onChange={() => toggleDimension(dimension.id)}
                  className="mr-3"
                />
                <p className="text-sm font-medium text-gray-900">{dimension.label}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Visualization Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualization Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {VISUALIZATION_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setVisualizationType(type.id)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                    ${visualizationType === type.id
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mb-2 ${visualizationType === type.id ? 'text-orange-600' : 'text-gray-600'}`} />
                  <span className={`text-xs font-medium ${visualizationType === type.id ? 'text-orange-600' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleGenerateReport}
            className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Generate Report
          </button>
          {showPreview && (
            <>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleSaveReport}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
          {showPreview ? (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected Metrics:</strong> {selectedMetrics.map(m => AVAILABLE_METRICS.find(metric => metric.id === m)?.label).join(', ')}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Selected Dimensions:</strong> {selectedDimensions.map(d => AVAILABLE_DIMENSIONS.find(dim => dim.id === d)?.label).join(', ')}
                </p>
              </div>
              {renderVisualization()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p className="text-sm">Select metrics and dimensions, then click "Generate Report" to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomReportBuilder;
