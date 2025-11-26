'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportService } from '@/lib/services/export.service';

interface ExportButtonProps {
  data: any[];
  columns: string[];
  filename: string;
  filters?: Record<string, any>;
}

export function ExportButton({ data, columns, filename, filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'csv' | 'excel') => {
    // Validate data
    const validation = exportService.validateExportData(data, columns);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setShowMenu(false);

    try {
      const generatedFilename = exportService.generateFilename(filename);
      
      await exportService.exportWithProgress(
        {
          data,
          columns,
          filename: generatedFilename,
          format,
          filters,
        },
        (p) => setProgress(p)
      );

      // Success feedback
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? `Exporting... ${progress.toFixed(0)}%` : 'Export'}</span>
      </button>

      {/* Export Menu */}
      {showMenu && !isExporting && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg"
          >
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Export as CSV</p>
              <p className="text-xs text-gray-500">Comma-separated values</p>
            </div>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors last:rounded-b-lg border-t border-gray-100"
          >
            <FileSpreadsheet className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Export as Excel</p>
              <p className="text-xs text-gray-500">Microsoft Excel format</p>
            </div>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
