import { useEffect, useState } from 'react';
import { connectionManager, CONNECTION_STATUS } from '../../utils/connectionManager';
import Badge from '../ui/Badge';

export default function ConnectionStatusBadge() {
  const [status, setStatus] = useState(connectionManager.getStatus());

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const getStatusConfig = () => {
    switch (status.status) {
      case CONNECTION_STATUS.ONLINE_SYNCED:
        return {
          color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
          icon: '🟢',
          label: 'Online & Synced',
          tooltip: 'Connected to Supabase. All changes are synced.'
        };

      case CONNECTION_STATUS.ONLINE_SYNCING:
        return {
          color: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
          icon: '🟡',
          label: 'Syncing...',
          tooltip: `Syncing ${status.pendingChanges} pending changes...`
        };

      case CONNECTION_STATUS.ONLINE_ERROR:
        return {
          color: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
          icon: '⚠️',
          label: 'Sync Error',
          tooltip: status.errorMessage || 'Supabase connection error. Changes saved locally.'
        };

      case CONNECTION_STATUS.OFFLINE:
        return {
          color: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
          icon: '🔴',
          label: 'Offline',
          tooltip: 'No internet connection. Working with local data. Changes will sync when online.'
        };

      case CONNECTION_STATUS.CONNECTING:
        return {
          color: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
          icon: '🔄',
          label: 'Connecting...',
          tooltip: 'Checking connection to Supabase...'
        };

      default:
        return {
          color: 'border-white/10 bg-white/5 text-slate-200',
          icon: '❓',
          label: 'Unknown',
          tooltip: 'Connection status unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="relative group" title={config.tooltip}>
      <Badge className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
      
      <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50">
        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-slate-300 shadow-xl backdrop-blur-sm min-w-[280px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Internet:</span>
              <span className={status.internetOnline ? 'text-emerald-300' : 'text-rose-300'}>
                {status.internetOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supabase:</span>
              <span className={status.supabaseConnected ? 'text-emerald-300' : 'text-rose-300'}>
                {status.supabaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {status.pendingChanges > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pending changes:</span>
                <span className="text-amber-300">{status.pendingChanges}</span>
              </div>
            )}
            {status.lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last sync:</span>
                <span className="text-slate-300">
                  {new Date(status.lastSyncTime).toLocaleTimeString()}
                </span>
              </div>
            )}
            {status.errorMessage && (
              <div className="mt-2 rounded-lg bg-rose-500/10 p-2 text-xs text-rose-200">
                {status.errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
