'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DashboardUpdate {
  type: 'metrics' | 'booking' | 'delivery' | 'user';
  data: any;
  timestamp: Date;
}

export function useDashboardRealtime(refreshInterval: number = 30000) {
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;
    let intervalId: NodeJS.Timeout;

    async function setupRealtime() {
      // Set up realtime subscription for bookings
      channel = supabase
        .channel('dashboard_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            const update: DashboardUpdate = {
              type: 'booking',
              data: payload.new,
              timestamp: new Date(),
            };
            setUpdates((prev) => [...prev.slice(-9), update]);
            setLastUpdate(new Date());
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles',
          },
          (payload) => {
            const update: DashboardUpdate = {
              type: 'user',
              data: payload.new,
              timestamp: new Date(),
            };
            setUpdates((prev) => [...prev.slice(-9), update]);
            setLastUpdate(new Date());
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnected(false);
          }
        });

      // Set up periodic refresh
      intervalId = setInterval(() => {
        setLastUpdate(new Date());
      }, refreshInterval);
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval]);

  return { updates, connected, lastUpdate };
}
