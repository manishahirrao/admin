'use client';

import React, { useState, useEffect } from 'react';
import { PriestAssignmentBoard } from '@/components/priests/PriestAssignmentBoard';
import { BulkActionsBar } from '@/components/priests/BulkActionsBar';
import { WorkloadAlerts } from '@/components/priests/WorkloadAlerts';
import { AvailabilityCalendar } from '@/components/priests/AvailabilityCalendar';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/useToast';

interface Ritual {
  id: string;
  name: string;
  deity: string;
  date: Date;
  requirements: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  duration: number;
}

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

export default function PriestAssignmentPage() {
  const [unassignedRituals, setUnassignedRituals] = useState<Ritual[]>([]);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [selectedRituals, setSelectedRituals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedPriestForCalendar, setSelectedPriestForCalendar] = useState<Priest | null>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadData();

    // Set up real-time subscriptions
    const ritualsSubscription = supabase
      .channel('rituals-assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
      }, handleRitualUpdate)
      .subscribe();

    return () => {
      ritualsSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load unassigned rituals
      const { data: ritualsData, error: ritualsError } = await supabase
        .from('bookings')
        .select('*')
        .is('priest_id', null)
        .order('scheduled_time', { ascending: true });

      if (ritualsError) throw ritualsError;

      setUnassignedRituals(ritualsData || []);

      // Load priests with their current workload
      const { data: priestsData, error: priestsError } = await supabase
        .rpc('get_priests_with_workload');

      if (priestsError) throw priestsError;

      setPriests(priestsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load assignment data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRitualUpdate = (payload: any) => {
    console.log('Ritual updated:', payload);
    loadData();
  };

  const handleAssign = async (ritualId: string, priestId: string) => {
    try {
      // Check priest capacity
      const priest = priests.find(p => p.id === priestId);
      if (!priest) throw new Error('Priest not found');

      const loadPercentage = (priest.currentLoad / priest.maxCapacity) * 100;
      if (loadPercentage > 85) {
        const confirmed = confirm(
          `Warning: ${priest.name} is at ${loadPercentage.toFixed(0)}% capacity. Assign anyway?`
        );
        if (!confirmed) return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          priest_id: priestId,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', ritualId);

      if (error) throw error;

      showToast('Ritual assigned successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error assigning ritual:', error);
      showToast('Failed to assign ritual', 'error');
      throw error;
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRituals.length === 0) {
      showToast('Please select rituals first', 'warning');
      return;
    }

    try {
      let updateData: any = {};

      switch (action) {
        case 'video_uploaded':
          updateData = { video_status: 'uploaded', video_uploaded_at: new Date().toISOString() };
          break;
        case 'aashirwad_shipped':
          updateData = { aashirwad_status: 'shipped', shipped_at: new Date().toISOString() };
          break;
        case 'completed':
          updateData = { status: 'completed', completed_at: new Date().toISOString() };
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .in('id', selectedRituals);

      if (error) throw error;

      showToast(`${selectedRituals.length} rituals updated successfully`, 'success');
      setSelectedRituals([]);
      loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('Failed to update rituals', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Priest Assignment</h1>
            <p className="text-sm text-gray-600 mt-1">
              Drag rituals from the left to assign them to priests
            </p>
          </div>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showAlerts ? 'Hide Alerts' : 'Show Alerts'}
          </button>
        </div>
      </div>

      {/* Workload Alerts */}
      {showAlerts && (
        <div className="px-6 py-4 bg-gray-50">
          <WorkloadAlerts
            onViewPriest={(priestId) => {
              const priest = priests.find(p => p.id === priestId);
              if (priest) setSelectedPriestForCalendar(priest);
            }}
            onRedistribute={(suggestion) => {
              // Handle redistribution
              showToast('Redistribution initiated', 'info');
            }}
          />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedRituals.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRituals.length}
          onAction={handleBulkAction}
          onClear={() => setSelectedRituals([])}
        />
      )}

      {/* Assignment Board */}
      <div className="flex-1 overflow-hidden">
        <PriestAssignmentBoard
          unassignedRituals={unassignedRituals}
          priests={priests}
          onAssign={handleAssign}
        />
      </div>

      {/* Availability Calendar Modal */}
      {selectedPriestForCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Priest Availability</h2>
                <button
                  onClick={() => setSelectedPriestForCalendar(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <AvailabilityCalendar
                priestId={selectedPriestForCalendar.id}
                priestName={selectedPriestForCalendar.name}
                availability={{}}
                onUpdateAvailability={(day, slots) => {
                  // Handle availability update
                  console.log('Update availability:', day, slots);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
