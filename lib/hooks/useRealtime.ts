'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime<T>(
  table: string,
  filter?: { column: string; value: any }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    async function setupRealtime() {
      try {
        // Initial fetch
        let query = supabase.from(table).select('*');
        
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }

        const { data: initialData, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setData(initialData || []);
        setLoading(false);

        // Set up realtime subscription
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setData((current) => [...current, payload.new as T]);
              } else if (payload.eventType === 'UPDATE') {
                setData((current) =>
                  current.map((item: any) =>
                    item.id === payload.new.id ? (payload.new as T) : item
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setData((current) =>
                  current.filter((item: any) => item.id !== payload.old.id)
                );
              }
            }
          )
          .subscribe();
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter?.column, filter?.value]);

  return { data, loading, error };
}
