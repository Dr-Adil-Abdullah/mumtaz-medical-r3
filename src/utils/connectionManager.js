import { supabase } from '../supabase/client';

// Connection status types
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
    this.maxRetries = 3;
    this.checkTimeout = null;
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

  async testSupabase() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { error } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        this.supabaseConnected = false;
        return { success: false, error: error.message };
      }
      
      this.supabaseConnected = true;
      return { success: true };
    } catch (err) {
      this.supabaseConnected = false;
      return { success: false, error: err.message };
    }
  }

  async checkConnection() {
    if (!this.checkInternet()) {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet');
      return;
    }

    this.setStatus(CONNECTION_STATUS.CONNECTING);

    const result = await this.testSupabase();

    if (result.success) {
      this.retryCount = 0;
      if (this.pendingChanges > 0) {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);
        this.triggerSync();
      } else {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
      }
    } else {
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, 'Retrying...');
        // Retry after 30 seconds
        if (this.checkTimeout) clearTimeout(this.checkTimeout);
        this.checkTimeout = setTimeout(() => this.checkConnection(), 30000);
      } else {
        this.setStatus(CONNECTION_STATUS.OFFLINE, 'Working offline');
      }
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

  startMonitoring(intervalMs = 60000) {
    this.checkConnection();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.internetOnline = true;
        this.checkConnection();
      });
      
      window.addEventListener('offline', () => {
        this.internetOnline = false;
        this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet');
      });
    }

    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => this.checkConnection(), intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.checkTimeout) clearTimeout(this.checkTimeout);
  }
}

export const connectionManager = new ConnectionManager();
