import { supabase } from '../supabase/client';
import { connectionManager } from './connectionManager';
import { syncQueue } from '../db/syncQueue';
import { db } from '../db/index';

// Main tables that need to be synced
const SYNC_TABLES = [
  'settings',
  'products', 
  'batches',
  'customers',
  'suppliers',
  'sales',
  'expenses',
  'day_sessions',
  'staff',
  'activity_logs'
];

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.lastFullSync = null;
  }

  // Check if Supabase is configured
  isSupabaseConfigured() {
    return !!supabase && supabase.supabaseUrl && supabase.supabaseKey;
  }

  // Full sync from Supabase to local (pull)
  async pullFromCloud() {
    if (!connectionManager.supabaseConnected) {
      console.log('[SyncManager] Cannot pull - Supabase not connected');
      return { success: false, error: 'Not connected' };
    }

    console.log('[SyncManager] Starting pull from cloud...');
    const results = {};

    for (const table of SYNC_TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(500);

        if (error) {
          console.error(`[SyncManager] Pull error for ${table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          // Clear existing and insert fresh data
          await db[table].clear();
          await db[table].bulkPut(data);
          results[table] = data.length;
        }
      } catch (err) {
        console.error(`[SyncManager] Pull failed for ${table}:`, err);
      }
    }

    this.lastFullSync = new Date().toISOString();
    console.log('[SyncManager] Pull completed:', results);
    return { success: true, results };
  }

  // Push local changes to Supabase (already handled by syncQueue)
  async pushToCloud() {
    if (!connectionManager.supabaseConnected) {
      return { success: false, error: 'Not connected' };
    }

    try {
      await syncQueue.processQueue();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Full bidirectional sync
  async fullSync() {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress');
      return;
    }

    this.isSyncing = true;
    connectionManager.setStatus('online_syncing');

    try {
      // 1. Push local changes first
      await this.pushToCloud();
      
      // 2. Then pull latest from cloud
      const pullResult = await this.pullFromCloud();

      if (pullResult.success) {
        connectionManager.setLastSyncTime();
        connectionManager.setStatus('online_synced');
      } else {
        connectionManager.setStatus('online_error', pullResult.error);
      }

      return pullResult;
    } catch (err) {
      connectionManager.setStatus('online_error', err.message);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  // Start automatic sync
  startAutoSync() {
    // Quick connection check every 30 seconds
    setInterval(() => {
      if (connectionManager.internetOnline) {
        connectionManager.quickSyncAttempt();
      }
    }, 30000);

    // Full sync every 5 minutes if online
    setInterval(() => {
      if (connectionManager.supabaseConnected && !this.isSyncing) {
        this.fullSync();
      }
    }, 300000);
  }
}

export const syncManager = new SyncManager();
