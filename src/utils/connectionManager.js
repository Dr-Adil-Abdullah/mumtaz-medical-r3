import { supabase } from '../supabase/client';

// Connection status types
export const CONNECTION_STATUS = {
  ONLINE_SYNCED: 'online_synced',
  ONLINE_SYNCING: 'online_syncing',
  ONLINE_ERROR: 'online_error',
  OFFLINE: 'offline',
  CONNECTING: 'connecting',
  SUPABASE_DISABLED: 'supabase_disabled'
};

// Singleton connection manager
class ConnectionManager {
  constructor() {
    this.status = CONNECTION_STATUS.OFFLINE; // Start as offline by default
    this.supabaseConnected = false;
    this.internetOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.lastSyncTime = null;
    this.pendingChanges = 0;
    this.listeners = new Set();
    this.checkInterval = null;
    this.errorMessage = null;
    this.onlineHandler = null;
    this.offlineHandler = null;
    this.supabaseEnabled = false; // Disabled by default - only enable when user wants cloud sync
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds between retries
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

  // Enable Supabase sync (call this only when user explicitly wants cloud sync)
  enableSupabase() {
    this.supabaseEnabled = true;
    this.retryCount = 0;
    this.checkConnection();
  }

  // Disable Supabase sync
  disableSupabase() {
    this.supabaseEnabled = false;
    this.supabaseConnected = false;
    this.setStatus(CONNECTION_STATUS.OFFLINE, 'Cloud sync disabled');
  }

  async testSupabase() {
    // Don't test if Supabase is disabled
    if (!this.supabaseEnabled) {
      return { success: false, error: 'Supabase sync is disabled' };
    }

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
      // Don't log to console to avoid spam
      return { success: false, error: err.message };
    }
  }

  async checkConnection() {
    // Check internet first
    if (!this.checkInternet()) {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet connection');
      return this.getStatus();
    }

    // If Supabase is not enabled, stay offline
    if (!this.supabaseEnabled) {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'Working offline - Cloud sync disabled');
      return this.getStatus();
    }

    // Test Supabase connection
    const result = await this.testSupabase();

    if (result.success) {
      this.retryCount = 0; // Reset retry count on success
      if (this.pendingChanges > 0) {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);
        this.triggerSync();
      } else {
        this.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
      }
    } else {
      // Retry logic with backoff
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, `Connection failed. Retrying... (${this.retryCount}/${this.maxRetries})`);
        // Schedule retry
        setTimeout(() => this.checkConnection(), this.retryDelay);
      } else {
        this.setStatus(CONNECTION_STATUS.ONLINE_ERROR, 'Cannot connect to cloud. Working offline.');
      }
    }

    return this.getStatus();
  }

  async triggerSync() {
    if (!this.internetOnline || !this.supabaseConnected || !this.supabaseEnabled) {
      return;
    }

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

  startMonitoring(intervalMs = 60000) { // Check every 60 seconds instead of 30
    // Only check internet, not Supabase (unless enabled)
    this.checkInternet();

    // Listen to browser online/offline events
    if (typeof window !== 'undefined') {
      this.onlineHandler = () => {
        this.internetOnline = true;
        if (this.supabaseEnabled) {
          this.checkConnection();
        } else {
          this.setStatus(CONNECTION_STATUS.OFFLINE, 'Working offline');
        }
      };

      this.offlineHandler = () => {
        this.internetOnline = false;
        this.setStatus(CONNECTION_STATUS.OFFLINE, 'No internet connection');
      };

      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }

    // Periodic check (only if Supabase is enabled)
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    if (this.supabaseEnabled) {
      this.checkInterval = setInterval(() => {
        this.checkConnection();
      }, intervalMs);
    }

    // Set initial status
    if (this.supabaseEnabled) {
      this.checkConnection();
    } else {
      this.setStatus(CONNECTION_STATUS.OFFLINE, 'Working offline - Cloud sync disabled');
    }
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (typeof window !== 'undefined') {
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler);
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler);
      }
    }
  }
}

export const connectionManager = new ConnectionManager();
export function getConnectionStatus() { return connectionManager.getStatus(); }
