'use client';

import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/partners/KanbanBoard';
import { PerformanceMetrics } from '@/components/partners/PerformanceMetrics';
import { VideoProofAlerts } from '@/components/partners/VideoProofAlerts';
import { useToast } from '@/lib/hooks/useToast';
import { createClient } from '@/lib/supabase/client';

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

interface PerformanceData {
  completionRate: number;
  averageRating: number;
  ritualsCompleted: number;
  revenueGenerated: number;
  onTimeCompletion: number;
  videoDeliveryTime: number;
}

export default function TemplePartnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [pendingVideos, setPendingVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('temple-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
      }, handleOrderUpdate)
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('bookings')
        .select(`
          id,
          ritual_name,
          deity,
          devotee_name,
          devotee_phone,
          scheduled_time,
          total_value,
          status,
          priority
        `)
        .in('status', ['today', 'this_week', 'next_week', 'completed'])
        .order('scheduled_time', { ascending: true });

      if (ordersError) throw ordersError;

      // Map database fields to component interface
      const mappedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        ritualName: order.ritual_name,
        deity: order.deity,
        devoteeName: order.devotee_name,
        devoteePhone: order.devotee_phone,
        scheduledTime: new Date(order.scheduled_time),
        totalValue: order.total_value,
        status: order.status,
        priority: order.priority,
      }));

      setOrders(mappedOrders);

      // Load performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_temple_performance_metrics');

      if (metricsError) throw metricsError;

      setPerformance(metricsData);

      // Load pending videos
      const { data: videosData, error: videosError } = await supabase
        .from('bookings')
        .select('*')
        .eq('video_status', 'pending')
        .lt('scheduled_time', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

      if (videosError) throw videosError;

      setPendingVideos(videosData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = (payload: any) => {
    console.log('Order updated:', payload);
    loadDashboardData();
  };

  const handleOrderMove = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Optimistic update
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Haptic feedback (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error moving order:', error);
      showToast('Failed to update order status', 'error');
      // Reload to get correct state
      loadDashboardData();
    }
  };

  const handleStatusUpdate = async (orderId: string, action: string) => {
    try {
      let updateData: any = {};

      switch (action) {
        case 'start_ritual':
          updateData = { ritual_status: 'in_progress', started_at: new Date().toISOString() };
          break;
        case 'upload_video':
          // Open video upload modal
          // For now, just mark as video uploaded
          updateData = { video_status: 'uploaded', video_uploaded_at: new Date().toISOString() };
          break;
        case 'mark_shipped':
          updateData = { 
            aashirwad_status: 'shipped', 
            shipped_at: new Date().toISOString(),
            status: 'completed'
          };
          break;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }

      showToast('Status updated successfully', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
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
        <h1 className="text-2xl font-bold text-gray-900">Temple Partner Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your ritual orders and performance</p>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <PerformanceMetrics data={performance} />
        </div>
      )}

      {/* Video Proof Alerts */}
      {pendingVideos.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <VideoProofAlerts pendingVideos={pendingVideos} onUpload={loadDashboardData} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          orders={orders}
          onOrderMove={handleOrderMove}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}
