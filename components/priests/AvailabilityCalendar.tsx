'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface AvailabilitySchedule {
  [day: string]: TimeSlot[];
}

interface AvailabilityCalendarProps {
  priestId: string;
  priestName: string;
  availability: AvailabilitySchedule;
  onUpdateAvailability?: (day: string, slots: TimeSlot[]) => void;
  readOnly?: boolean;
}

export function AvailabilityCalendar({
  priestId,
  priestName,
  availability,
  onUpdateAvailability,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [editMode, setEditMode] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  const getAvailabilityForDay = (day: string): TimeSlot[] => {
    return availability[day] || [];
  };

  const isSlotAvailable = (day: string, time: string): boolean => {
    const slots = getAvailabilityForDay(day);
    return slots.some(slot => {
      const slotStart = slot.start.substring(0, 5);
      return slotStart === time && slot.available;
    });
  };

  const toggleSlot = (day: string, time: string) => {
    if (readOnly || !editMode) return;

    const currentSlots = getAvailabilityForDay(day);
    const existingSlotIndex = currentSlots.findIndex(
      slot => slot.start.substring(0, 5) === time
    );

    let newSlots: TimeSlot[];
    if (existingSlotIndex >= 0) {
      // Toggle existing slot
      newSlots = currentSlots.map((slot, index) =>
        index === existingSlotIndex
          ? { ...slot, available: !slot.available }
          : slot
      );
    } else {
      // Add new slot
      newSlots = [
        ...currentSlots,
        {
          start: `${time}:00`,
          end: `${parseInt(time.split(':')[0]) + 1}:00:00`,
          available: true,
        },
      ];
    }

    onUpdateAvailability?.(day, newSlots);
  };

  const getAvailabilityStats = () => {
    let totalSlots = 0;
    let availableSlots = 0;

    daysOfWeek.forEach(day => {
      const slots = getAvailabilityForDay(day);
      totalSlots += slots.length;
      availableSlots += slots.filter(s => s.available).length;
    });

    return {
      total: totalSlots,
      available: availableSlots,
      percentage: totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0,
    };
  };

  const stats = getAvailabilityStats();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Availability Calendar - {priestName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stats.available} of {stats.total} slots available ({stats.percentage}%)
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              editMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {editMode ? 'Save Changes' : 'Edit Availability'}
          </button>
        )}
      </div>

      {/* Day Selector */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {daysOfWeek.map(day => {
          const daySlots = getAvailabilityForDay(day);
          const availableCount = daySlots.filter(s => s.available).length;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div>{day.substring(0, 3)}</div>
              <div className="text-xs mt-1 opacity-75">
                {availableCount} slots
              </div>
            </button>
          );
        })}
      </div>

      {/* Time Slots Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h4 className="font-medium text-gray-900">{selectedDay}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {editMode ? 'Click slots to toggle availability' : 'View availability'}
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.map(time => {
              const available = isSlotAvailable(selectedDay, time);
              
              return (
                <button
                  key={time}
                  onClick={() => toggleSlot(selectedDay, time)}
                  disabled={!editMode && readOnly}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    available
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                  } ${
                    editMode && !readOnly
                      ? 'cursor-pointer hover:scale-105'
                      : 'cursor-default'
                  }`}
                >
                  <div>{time}</div>
                  <div className="text-xs mt-1">
                    {available ? 'Available' : 'Unavailable'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>

      {/* Conflict Warning */}
      {editMode && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Availability Updates
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Changes will be saved automatically. The system will prevent ritual assignments
                during unavailable time slots.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
