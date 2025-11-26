'use client';

import React from 'react';
import { CheckCircle, Package, Video, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onAction, onClear }: BulkActionsBarProps) {
  const actions = [
    {
      id: 'video_uploaded',
      label: 'Mark Video Uploaded',
      icon: <Video className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'aashirwad_shipped',
      label: 'Mark Aashirwad Shipped',
      icon: <Package className="w-4 h-4" />,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'completed',
      label: 'Mark Completed',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} ritual{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`
                  flex items-center space-x-2 px-3 py-1.5 text-white text-sm font-medium rounded-md
                  transition-colors ${action.color}
                `}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClear}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Clear Selection</span>
        </button>
      </div>
    </div>
  );
}
