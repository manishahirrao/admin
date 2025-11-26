'use client';

import React from 'react';
import { Star, User, TrendingUp, AlertCircle } from 'lucide-react';

interface Priest {
  id: string;
  name: string;
  specializations: string[];
  currentLoad: number;
  maxCapacity: number;
  availability: boolean;
  rating: number;
  photoUrl?: string;
}

interface PriestCardProps {
  priest: Priest;
  isDraggingOver: boolean;
  calculateMatch?: (ritual: any) => number;
}

export function PriestCard({ priest, isDraggingOver }: PriestCardProps) {
  const loadPercentage = (priest.currentLoad / priest.maxCapacity) * 100;
  const isOverloaded = loadPercentage > 85;
  const isNearCapacity = loadPercentage > 70 && loadPercentage <= 85;

  const getGaugeColor = () => {
    if (isOverloaded) return 'bg-red-500';
    if (isNearCapacity) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getGaugeBgColor = () => {
    if (isOverloaded) return 'bg-red-100';
    if (isNearCapacity) return 'bg-amber-100';
    return 'bg-green-100';
  };

  return (
    <div
      className={`
        bg-white rounded-lg border-2 p-4 transition-all
        ${isDraggingOver ? 'border-orange-500 shadow-lg scale-105' : 'border-gray-200'}
        ${!priest.availability ? 'opacity-60' : ''}
        ${isOverloaded ? 'border-red-300' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {priest.photoUrl ? (
            <img
              src={priest.photoUrl}
              alt={priest.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {priest.name}
          </h4>
          <div className="flex items-center mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-xs text-gray-600 ml-1">
              {priest.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Availability Badge */}
        <div>
          {priest.availability ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Specializations:</p>
        <div className="flex flex-wrap gap-1">
          {priest.specializations.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
            >
              {spec}
            </span>
          ))}
          {priest.specializations.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              +{priest.specializations.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Capacity Gauge */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 font-medium">Workload</span>
          <span className="text-xs font-semibold text-gray-900">
            {priest.currentLoad}/{priest.maxCapacity} rituals
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full ${getGaugeBgColor()}`}>
          <div
            className={`h-full rounded-full transition-all ${getGaugeColor()}`}
            style={{ width: `${Math.min(loadPercentage, 100)}%` }}
          />
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs font-medium ${isOverloaded ? 'text-red-600' : isNearCapacity ? 'text-amber-600' : 'text-green-600'}`}>
            {loadPercentage.toFixed(0)}% capacity
          </span>
          {isOverloaded && (
            <div className="flex items-center text-xs text-red-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              <span>Overloaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {isDraggingOver && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-center">
          <p className="text-xs text-orange-700 font-medium">
            Drop here to assign
          </p>
        </div>
      )}

      {/* Overload Warning */}
      {isOverloaded && !isDraggingOver && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-start">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            This priest is over capacity. Consider redistributing workload.
          </p>
        </div>
      )}
    </div>
  );
}
