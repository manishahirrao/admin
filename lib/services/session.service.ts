import { createClient } from '@/lib/supabase/server';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface SessionInfo {
  userId: string;
  lastActivity: number;
  expiresAt: number;
}

/**
 * Update user's last activity timestamp
 */
export async function updateLastActivity(userId: string): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
}

/**
 * Check if session is still valid based on last activity
 */
export async function isSessionValid(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('last_login')
      .eq('id', userId)
      .single();

    if (error || !user || !user.last_login) {
      return false;
    }

    const lastActivity = new Date(user.last_login).getTime();
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;

    return timeSinceLastActivity < SESSION_TIMEOUT;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

/**
 * Invalidate user session
 */
export async function invalidateSession(userId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Sign out the user
    await supabase.auth.signOut();

    // Log the session invalidation
    await supabase.from('audit_log').insert({
      admin_user_id: userId,
      action_type: 'session_invalidated',
      resource_type: 'session',
      old_value: null,
      new_value: { reason: 'inactivity_timeout' },
    });
  } catch (error) {
    console.error('Error invalidating session:', error);
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Update last activity
    await updateLastActivity(userId);

    // Refresh auth session
    const { error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

/**
 * Get session timeout in milliseconds
 */
export function getSessionTimeout(): number {
  return SESSION_TIMEOUT;
}
