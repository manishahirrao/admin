'use client';

import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface Ritual {
  id: string;
  name: string;
  deity: string;
  date: Date;
  requirements: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  duration: number;
}

interface UnassignedRitualCardProps {
  ritual: Ritual;
}

const COMPLEXITY_COLORS = {
  simple: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  complex: 'bg-red-100 text-red-800',
};

export function UnassignedRitualCard({ ritual }: UnassignedRitualCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      {/* Header */}
      <div className="mb-2">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          {ritual.name}
        </h4>
        <p className="text-xs text-gray-600">
          Deity: <span className="font-medium">{ritual.deity}</span>
        </p>
      </div>

      {/* Date & Time */}
      <div className="flex items-center space-x-3 mb-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{format(new Date(ritual.date), 'MMM dd')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>{ritual.duration}min</span>
        </div>
      </div>

      {/* Complexity Badge */}
      <div className="mb-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COMPLEXITY_COLORS[ritual.complexity]}`}>
          {ritual.complexity}
        </span>
      </div>

      {/* Requirements */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 font-medium">Requirements:</p>
        <div className="flex flex-wrap gap-1">
          {ritual.requirements.map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
            >
              <Tag className="w-2.5 h-2.5 mr-1" />
              {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
