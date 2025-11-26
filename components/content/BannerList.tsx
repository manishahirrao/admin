'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  targetSegments: string[];
  isActive: boolean;
  createdAt: string;
}

interface BannerListProps {
  banners: Banner[];
  onReorder: (banners: Banner[]) => Promise<void>;
  onEdit: (banner: Banner) => void;
  onDelete: (bannerId: string) => Promise<void>;
}

function SortableBannerItem({
  banner,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: banner.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isScheduled = banner.startDate && banner.endDate;
  const isActive = banner.isActive && (!isScheduled || (
    new Date(banner.startDate!) <= new Date() && new Date() <= new Date(banner.endDate!)
  ));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>

        {/* Banner Image */}
        <div className="relative w-32 h-20 flex-shrink-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover rounded"
          />
        </div>

        {/* Banner Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{banner.title}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {banner.linkUrl && (
            <p className="text-sm text-gray-600 truncate">{banner.linkUrl}</p>
          )}
          {isScheduled && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(banner.startDate!).toLocaleDateString()} -{' '}
              {new Date(banner.endDate!).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {banner.targetSegments.map((segment) => (
              <span
                key={segment}
                className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded"
              >
                {segment}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function BannerList({ banners, onReorder, onEdit, onDelete }: BannerListProps) {
  const [items, setItems] = useState(banners);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        displayOrder: index,
      }));

      setItems(newItems);
      setReordering(true);

      try {
        await onReorder(newItems);
      } catch (error) {
        // Revert on error
        setItems(items);
      } finally {
        setReordering(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {reordering && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Saving order...</p>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {items.map((banner) => (
            <SortableBannerItem
              key={banner.id}
              banner={banner}
              onEdit={() => onEdit(banner)}
              onDelete={() => onDelete(banner.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
