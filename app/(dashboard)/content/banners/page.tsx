'use client';

import { useEffect, useState } from 'react';
import { BannerList } from '@/components/content/BannerList';
import { BannerForm } from '@/components/forms/BannerForm';

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

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/content/banners');
      const data = await response.json();
      
      // Transform snake_case to camelCase
      const transformedData = data.map((b: any) => ({
        id: b.id,
        title: b.title,
        imageUrl: b.image_url,
        linkUrl: b.link_url,
        displayOrder: b.display_order,
        startDate: b.start_date,
        endDate: b.end_date,
        targetSegments: b.target_segments || [],
        isActive: b.is_active,
        createdAt: b.created_at,
      }));
      
      setBanners(transformedData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (reorderedBanners: Banner[]) => {
    try {
      const response = await fetch('/api/content/banners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: reorderedBanners.map((b) => ({
            id: b.id,
            display_order: b.displayOrder,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to reorder');
      setBanners(reorderedBanners);
    } catch (error) {
      console.error('Error reordering banners:', error);
      throw error;
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        title: formData.title,
        image_url: formData.imageUrl,
        link_url: formData.linkUrl,
        start_date: formData.startDate,
        end_date: formData.endDate,
        target_segments: formData.targetSegments,
        is_active: formData.isActive,
      };

      const url = editingBanner
        ? `/api/content/banners/${editingBanner.id}`
        : '/api/content/banners';
      
      const response = await fetch(url, {
        method: editingBanner ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save banner');

      await fetchBanners();
      setShowForm(false);
      setEditingBanner(undefined);
    } catch (error) {
      console.error('Error saving banner:', error);
      throw error;
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/content/banners/${bannerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Banner Management</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingBanner(undefined);
            }}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Banners
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingBanner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <BannerForm
            initialData={editingBanner}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingBanner(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Banner
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <BannerList
          banners={banners}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
