import { supabase } from '../supabase/client';

// Connection status types
export const CONNECTION_STATUS = {
  ONLINE_SYNCED: 'online_synced',
  ONLINE_SYNCING: 'online_syncing',
  ONLINE_ERROR: 'online_error',
  OFFLINE: 'offline',
  CONNECTING: 'connecting'
};

// Singleton connection manager
class ConnectionManager {
  constructor() {
    this.status = CONNECTION_STATUS.CONNECTING;
    this.supabaseConnected = false;
    this.internetOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.lastSyncTime = null;
    this.pendingChanges = 0;
    this.listeners = new Set();
    this.checkInterval = null;
    this.errorMessage = null;
    this.onlineHandler = null;
    this.offlineHandler = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach(callback => {
      try { callback(status); } catch (err) { console.error('Connection listener error:', err); }
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

  setStatus(newStatus, errorMessage = null) {
    this.status = newStatus;
    this.errorMessage = errorMessage;
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
      const { error } = await supabase.from('settings').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          this.supabaseConnected = true;
          return { success: true, needsSetup: true };
        }
        this.supabaseConnected = false;
        return { success: false, error: error.message };
      }
      this.supabaseConnected = true;
      return { success: true, needsSetup: false };
    } catch (err) {
      this.supabaseConnected = false;
      return { success: false, error: err.message };
    }
  }

  async checkConnection() {
    if (!this.checkInternet()) {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet connection');
      return this.getStatus();
    }

    const result = await this.testSupabase();

    if (result.success) {
      if (this.pendingChanges > 0) {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);
        this.triggerSync();
      } else {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
      }
    } else {
      this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, result.error);
    }

    return this.getStatus();
  }

  async triggerSync() {
    if (!this.internetOnline || !this.supabaseConnected) return;
    this.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);

    try {
      const { syncQueue } = await import('../db/syncQueue');
      await syncQueue.processQueue();
      this.setLastSyncTime();
      this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
    } catch (err) {
      console.error('Sync error:', err);
      this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, err.message);
    }
  }

  startMonitoring(intervalMs = 30000) {
    this.checkConnection();

    if (typeof window !== 'undefined') {
      this.onlineHandler = () => { this.internetOnline = true; this.checkConnection(); };
      this.offlineHandler = () => { this.internetOnline = false; this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet connection'); };

      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }

    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => { this.checkConnection(); }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
    if (typeof window !== 'undefined') {
      if (this.onlineHandler) window.removeEventListener('online', this.onlineHandler);
      if (this.offlineHandler) window.removeEventListener('offline', this.offlineHandler);
    }
  }
}

export const connectionManager = new ConnectionManager();
export function getConnectionStatus() { return connectionManager.getStatus(); }
