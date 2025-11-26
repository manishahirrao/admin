/**
 * Offline Sync Service
 * Handles offline status updates and synchronization when connection is restored
 */

interface PendingUpdate {
  id: string;
  orderId: string;
  action: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'temple_partner_pending_updates';
const MAX_RETRIES = 3;

class OfflineSyncService {
  private pendingUpdates: PendingUpdate[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadPendingUpdates();
      this.setupOnlineListener();
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.isOnline = true;
      this.syncPendingUpdates();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
      this.isOnline = false;
    });

    // Check initial state
    this.isOnline = navigator.onLine;
  }

  /**
   * Load pending updates from localStorage
   */
  private loadPendingUpdates() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.pendingUpdates = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending updates:', error);
      this.pendingUpdates = [];
    }
  }

  /**
   * Save pending updates to localStorage
   */
  private savePendingUpdates() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pendingUpdates));
    } catch (error) {
      console.error('Error saving pending updates:', error);
    }
  }

  /**
   * Add an update to the pending queue
   */
  addPendingUpdate(orderId: string, action: string, data: any): string {
    const update: PendingUpdate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingUpdates.push(update);
    this.savePendingUpdates();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingUpdates();
    }

    return update.id;
  }

  /**
   * Sync all pending updates
   */
  async syncPendingUpdates(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.pendingUpdates.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const updates = [...this.pendingUpdates];
      const results = await Promise.allSettled(
        updates.map(update => this.syncUpdate(update))
      );

      // Remove successful updates
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const updateIndex = this.pendingUpdates.findIndex(
            u => u.id === updates[index].id
          );
          if (updateIndex !== -1) {
            this.pendingUpdates.splice(updateIndex, 1);
          }
        } else if (result.status === 'rejected') {
          // Increment retry count
          const update = this.pendingUpdates.find(u => u.id === updates[index].id);
          if (update) {
            update.retryCount++;
            if (update.retryCount >= MAX_RETRIES) {
              // Remove after max retries
              const updateIndex = this.pendingUpdates.findIndex(
                u => u.id === update.id
              );
              if (updateIndex !== -1) {
                this.pendingUpdates.splice(updateIndex, 1);
              }
              console.error('Max retries reached for update:', update);
            }
          }
        }
      });

      this.savePendingUpdates();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single update
   */
  private async syncUpdate(update: PendingUpdate): Promise<boolean> {
    try {
      const response = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: update.orderId,
          action: update.action,
          data: update.data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error syncing update:', error);
      throw error;
    }
  }

  /**
   * Get pending updates count
   */
  getPendingCount(): number {
    return this.pendingUpdates.length;
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Get all pending updates
   */
  getPendingUpdates(): PendingUpdate[] {
    return [...this.pendingUpdates];
  }

  /**
   * Clear all pending updates (use with caution)
   */
  clearPendingUpdates(): void {
    this.pendingUpdates = [];
    this.savePendingUpdates();
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
