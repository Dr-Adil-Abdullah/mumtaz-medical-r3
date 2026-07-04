import { supabase } from '../supabase/client';
import { connectionManager, CONNECTION_STATUS } from '../utils/connectionManager';

class SyncQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
  }

  async addToQueue(tableName, action, recordId, data) {
    const queueItem = {
      id: crypto.randomUUID(),
      tableName,
      action,
      recordId,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(queueItem);
    connectionManager.setPendingChanges(this.queue.length);

    if (connectionManager.internetOnline && connectionManager.supabaseConnected) {
      this.processQueue();
    }

    return queueItem.id;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (!connectionManager.internetOnline || !connectionManager.supabaseConnected) {
      console.log('Sync queue: Offline or Supabase not connected');
      return;
    }

    this.processing = true;
    connectionManager.setStatus(CONNECTION_STATUS.ONLINE_SYNCING);

    const failedItems = [];

    for (const item of this.queue) {
      try {
        await this.syncItem(item);
      } catch (err) {
        console.error(`Failed to sync ${item.action} ${item.tableName}/${item.recordId}:`, err);
        item.retryCount++;
        if (item.retryCount < this.maxRetries) {
          failedItems.push(item);
        }
      }
    }

    this.queue = failedItems;
    connectionManager.setPendingChanges(this.queue.length);

    if (this.queue.length === 0) {
      connectionManager.setLastSyncTime();
      connectionManager.setStatus(CONNECTION_STATUS.ONLINE_SYNCED);
    } else {
      connectionManager.setStatus(CONNECTION_STATUS.ONLINE_ERROR, `${this.queue.length} changes failed to sync`);
    }

    this.processing = false;
  }

  async syncItem(item) {
    const { tableName, action, recordId, data } = item;

    switch (action) {
      case 'INSERT': {
        const { error } = await supabase.from(tableName).insert([data]);
        if (error) throw error;
        break;
      }
      case 'UPDATE': {
        const { error } = await supabase.from(tableName).update(data).eq('id', recordId);
        if (error) throw error;
        break;
      }
      case 'DELETE': {
        const { error } = await supabase.from(tableName).delete().eq('id', recordId);
        if (error) throw error;
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  getStatus() {
    return {
      pendingCount: this.queue.length,
      processing: this.processing,
      items: this.queue.map(item => ({
        id: item.id,
        tableName: item.tableName,
        action: item.action,
        recordId: item.recordId,
        timestamp: item.timestamp,
        retryCount: item.retryCount
      }))
    };
  }

  clearQueue() {
    this.queue = [];
    connectionManager.setPendingChanges(0);
  }
}

export const syncQueue = new SyncQueue();
