import { createClient } from '@/lib/supabase/server';
import { PaginatedResponse } from '@/types/api.types';

export interface UserFilters {
  cartValueMin?: number;
  cartValueMax?: number;
  orderStatus?: string;
  serviceType?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  activityLevel?: string;
  location?: string;
}

export async function getUsers(
  page: number = 1,
  limit: number = 50,
  filters?: UserFilters,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<any>> {
  const supabase = await createClient();

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  // Apply filters
  if (filters?.cartValueMin) {
    query = query.gte('cart_value', filters.cartValueMin);
  }
  if (filters?.cartValueMax) {
    query = query.lte('cart_value', filters.cartValueMax);
  }
  if (filters?.registrationDateFrom) {
    query = query.gte('created_at', filters.registrationDateFrom);
  }
  if (filters?.registrationDateTo) {
    query = query.lte('created_at', filters.registrationDateTo);
  }

  // Apply sorting
  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getUserById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserJourney(userId: string) {
  const supabase = await createClient();

  // Fetch user journey events
  const { data: events, error: eventsError } = await supabase
    .from('user_journey_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (eventsError) throw eventsError;

  // Fetch booking history
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (bookingsError) throw bookingsError;

  // Fetch communication log
  const { data: communications, error: commsError } = await supabase
    .from('communication_log')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false });

  if (commsError) throw commsError;

  return {
    events: events || [],
    bookings: bookings || [],
    communications: communications || [],
  };
}

export async function contactUser(
  userId: string,
  type: 'sms' | 'email' | 'in_app',
  template: string,
  message: string,
  adminUserId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('communication_log')
    .insert({
      user_id: userId,
      admin_user_id: adminUserId,
      type,
      template_name: template,
      message_content: message,
      status: 'sent',
    })
    .select()
    .single();

  if (error) throw error;

  // TODO: Integrate with actual SMS/Email service
  // For now, just log the communication

  return data;
}
