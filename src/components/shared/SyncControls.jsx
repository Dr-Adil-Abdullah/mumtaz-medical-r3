import { useState, useEffect } from 'react';
import { connectionManager } from '../../utils/connectionManager';
import { syncManager } from '../../utils/syncManager';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function SyncControls() {
  const [status, setStatus] = useState(connectionManager.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await connectionManager.quickSyncAttempt();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      await syncManager.fullSync();
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (status.status === 'online_synced') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
    if (status.status === 'online_syncing') return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
    if (status.status === 'offline') return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
    return 'border-white/10 bg-white/5 text-slate-200';
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Cloud Sync</h3>
          <p className="text-sm text-slate-400">Keep data in sync across devices</p>
        </div>
        <Badge className={getStatusColor()}>
          {status.status === 'online_synced' && '🟢 Synced'}
          {status.status === 'online_syncing' && '🟡 Syncing...'}
          {status.status === 'offline' && '🔴 Offline'}
          {status.status === 'connecting' && '🔄 Connecting'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Button 
          onClick={handleQuickSync} 
          disabled={isSyncing}
          variant="secondary"
        >
          {isSyncing ? 'Checking...' : 'Quick Sync (1s)'}
        </Button>
        
        <Button 
          onClick={handleFullSync} 
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Full Sync (All Data)'}
        </Button>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div>• Quick Sync: Checks connection in 1 second</div>
        <div>• Full Sync: Pushes + Pulls all data (Inventory, Ledger, Settings, etc.)</div>
        {lastSync && <div className="text-emerald-400">Last full sync: {lastSync}</div>}
        {!status.internetOnline && (
          <div className="text-rose-400">⚠️ No internet connection</div>
        )}
      </div>
    </div>
  );
}
