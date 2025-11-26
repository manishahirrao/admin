'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { OrderCard } from './OrderCard';

interface Order {
  id: string;
  ritualName: string;
  deity: string;
  devoteeName: string;
  devoteePhone: string;
  scheduledTime: Date;
  totalValue: number;
  status: 'today' | 'this_week' | 'next_week' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface KanbanBoardProps {
  orders: Order[];
  onOrderMove: (orderId: string, newStatus: Order['status']) => Promise<void>;
  onStatusUpdate: (orderId: string, action: string) => Promise<void>;
}

const COLUMNS = [
  { id: 'today', title: 'Today', color: 'bg-red-50 border-red-200' },
  { id: 'this_week', title: 'This Week', color: 'bg-amber-50 border-amber-200' },
  { id: 'next_week', title: 'Next Week', color: 'bg-blue-50 border-blue-200' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
] as const;

export function KanbanBoard({ orders, onOrderMove, onStatusUpdate }: KanbanBoardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const groupedOrders = COLUMNS.reduce((acc, column) => {
    acc[column.id] = orders.filter(order => order.status === column.id);
    return acc;
  }, {} as Record<string, Order[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as Order['status'];
    setIsLoading(draggableId);

    try {
      await onOrderMove(draggableId, newStatus);
    } catch (error) {
      console.error('Failed to move order:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {column.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {groupedOrders[column.id]?.length || 0} orders
                </p>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 rounded-lg border-2 border-dashed p-3 transition-colors
                      ${column.color}
                      ${snapshot.isDraggingOver ? 'border-solid shadow-lg' : ''}
                      overflow-y-auto
                    `}
                    style={{ minHeight: '400px' }}
                  >
                    <div className="space-y-3">
                      {groupedOrders[column.id]?.map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={order.id}
                          index={index}
                          isDragDisabled={isLoading === order.id}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                ${snapshot.isDragging ? 'opacity-50' : ''}
                                ${isLoading === order.id ? 'opacity-50 cursor-wait' : ''}
                              `}
                            >
                              <OrderCard
                                order={order}
                                onStatusUpdate={onStatusUpdate}
                                isLoading={isLoading === order.id}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {(!groupedOrders[column.id] || groupedOrders[column.id].length === 0) && (
                      <div className="flex items-center justify-center h-32 text-gray-400">
                        <p className="text-sm">No orders in this column</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
