'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { offlineSyncService } from '@/lib/services/offline-sync.service';

export function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsOnline(offlineSyncService.isConnected());
      setPendingCount(offlineSyncService.getPendingCount());
    };

    // Initial check
    checkStatus();

    // Set up interval to check status
    const interval = setInterval(checkStatus, 1000);

    // Listen for online/offline events
    const handleOnline = () => {
      checkStatus();
      syncNow();
    };

    const handleOffline = () => {
      checkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.syncPendingUpdates();
      setPendingCount(offlineSyncService.getPendingCount());
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <Wifi className="w-4 h-4" />
        <span>Connected</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            {pendingCount} pending
          </span>
        )}
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={syncNow}
          disabled={isSyncing}
          className="flex items-center space-x-2 text-amber-600 text-sm hover:text-amber-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Syncing {pendingCount} update{pendingCount !== 1 ? 's' : ''}...</span>
        </button>
      </div>
    );
  }

  return null;
}
