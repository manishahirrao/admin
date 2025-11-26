'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { UnassignedRitualCard } from './UnassignedRitualCard';
import { PriestCard } from './PriestCard';

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

interface PriestAssignmentBoardProps {
  unassignedRituals: Ritual[];
  priests: Priest[];
  onAssign: (ritualId: string, priestId: string) => Promise<void>;
}

export function PriestAssignmentBoard({
  unassignedRituals,
  priests,
  onAssign,
}: PriestAssignmentBoardProps) {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    // Extract priest ID from destination droppableId (format: "priest-{id}")
    const priestId = destination.droppableId.replace('priest-', '');
    
    setIsAssigning(true);
    try {
      await onAssign(draggableId, priestId);
    } catch (error) {
      console.error('Failed to assign ritual:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const calculateMatchPercentage = (ritual: Ritual, priest: Priest): number => {
    const matchingSpecs = ritual.requirements.filter(req =>
      priest.specializations.some(spec =>
        spec.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(spec.toLowerCase())
      )
    );
    return Math.round((matchingSpecs.length / ritual.requirements.length) * 100);
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Unassigned Rituals Pool */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Unassigned Rituals
              </h3>
              <p className="text-sm text-gray-600">
                {unassignedRituals.length} ritual{unassignedRituals.length !== 1 ? 's' : ''} pending assignment
              </p>
            </div>

            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    bg-white rounded-lg border-2 border-dashed border-gray-300 p-4
                    ${snapshot.isDraggingOver ? 'border-orange-500 bg-orange-50' : ''}
                    overflow-y-auto
                  `}
                  style={{ minHeight: '600px', maxHeight: 'calc(100vh - 250px)' }}
                >
                  <div className="space-y-3">
                    {unassignedRituals.map((ritual, index) => (
                      <Draggable
                        key={ritual.id}
                        draggableId={ritual.id}
                        index={index}
                        isDragDisabled={isAssigning}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <UnassignedRitualCard ritual={ritual} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {unassignedRituals.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <p className="text-sm">No unassigned rituals</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Priests Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Priests
              </h3>
              <p className="text-sm text-gray-600">
                Drag rituals to assign them to priests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {priests.map(priest => (
                <Droppable key={priest.id} droppableId={`priest-${priest.id}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        ${snapshot.isDraggingOver ? 'ring-2 ring-orange-500' : ''}
                      `}
                    >
                      <PriestCard
                        priest={priest}
                        isDraggingOver={snapshot.isDraggingOver}
                        calculateMatch={(ritual) => calculateMatchPercentage(ritual, priest)}
                      />
                      <div style={{ display: 'none' }}>{provided.placeholder}</div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
