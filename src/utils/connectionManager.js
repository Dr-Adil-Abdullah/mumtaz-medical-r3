import { supabase } from '../supabase/client';

export const CONNECTION_STATUS = {
  ONLINE_SYNCED: 'online_synced',
  ONLINE_SYNCING: 'online_syncing',
  ONLINE_ERROR: 'online_error',
  OFFLINE: 'offline',
  CONNECTING: 'connecting'
};

class ConnectionManager {
  constructor() {
    this.status = CONNECTION_STATUS.OFFLINE;
    this.supabaseConnected = false;
    this.internetOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.lastSyncTime = null;
    this.pendingChanges = 0;
    this.listeners = new Set();
    this.checkInterval = null;
    this.errorMessage = null;
    this.retryCount = 0;
    this.maxRetries = 1; // Only 1 quick attempt
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try { cb(status); } catch (e) {}
    });
  }

  getStatus() {
    return {
      status: this.status,
      supabaseConnected: this.supabaseConnected,
      internetOnline: this.internetOnline,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.pendingChanges,
      errorMessage: this.errorMessage
    };
  }

  setStatus(status, error = null) {
    this.status = status;
    this.errorMessage = error;
    this.notify();
  }

  setPendingChanges(count) {
    this.pendingChanges = count;
    this.notify();
  }

  setLastSyncTime(time) {
    this.lastSyncTime = time || new Date().toISOString();
    this.notify();
  }

  checkInternet() {
    this.internetOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return this.internetOnline;
  }

  // === NEW: Quick 1-second sync attempt ===
  async quickSyncAttempt() {
    if (!this.checkInternet()) {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet');
      return false;
    }

    this.setStatus(CONNECTION_STATUS.CONNECTING);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second only

    try {
      const { error } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        this.supabaseConnected = false;
        this.setStatus(CONNECTION_STATUS.OFFLINE, 'Supabase not reachable');
        return false;
      }

      this.supabaseConnected = true;
      this.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);
      
      // Trigger full backup sync
      await this.fullBackupSync();
      
      this.setLastSyncTime();
      this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
      return true;

    } catch (err) {
      clearTimeout(timeoutId);
      this.supabaseConnected = false;
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'Connection timeout (1s)');
      return false;
    }
  }

  // === NEW: Full backup sync for all main tables ===
  async fullBackupSync() {
    if (!this.supabaseConnected) return;

    try {
      const { syncQueue } = await import('../db/syncQueue');
      
      // Process any pending changes first
      await syncQueue.processQueue();

      // Additional full sync logic can be added here
      // For now we rely on syncQueue for Inventory, Ledger, Settings etc.
      
      console.log('[SmartSync] Full backup sync completed');
    } catch (err) {
      console.error('[SmartSync] Backup sync failed:', err);
    }
  }

  async checkConnection() {
    // Use the new quick 1-second attempt
    const success = await this.quickSyncAttempt();
    
    if (!success) {
      // Immediately go to offline mode (no long retries)
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'Working offline');
    }
  }

  async triggerSync() {
    if (!this.internetOnline || !this.supabaseConnected) return;

    try {
      const { syncQueue } = await import('../db/syncQueue');
      await syncQueue.processQueue();
      this.setLastSyncTime();
      this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
    } catch (err) {
      this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, err.message);
    }
  }

  startMonitoring(intervalMs = 30000) {
    // Do one quick sync attempt on start
    this.checkConnection();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.internetOnline = true;
        this.quickSyncAttempt(); // Try quick sync when internet comes back
      });
      
      window.addEventListener('offline', () => {
        this.internetOnline = false;
        this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet');
      });
    }

    if (this.checkInterval) clearInterval(this.checkInterval);
    // Check every 30 seconds (but only quick 1s attempt)
    this.checkInterval = setInterval(() => this.checkConnection(), intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }
}

export const connectionManager = new ConnectionManager();
