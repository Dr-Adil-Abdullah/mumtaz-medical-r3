import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { exportAllData, importAllData, downloadBackup, uploadBackup, getBackupStats } from '../../utils/backup';
import { 
  uploadToGoogleDrive, 
  listGoogleDriveBackups, 
  downloadFromGoogleDrive, 
  deleteFromGoogleDrive, 
  authenticateGoogle, 
  initializeGapiClient,
  initializeGisClient
} from '../../utils/googleDriveBackup';

export default function CloudBackupSection() {
  const [backupStatus, setBackupStatus] = useState('');
  const [backupError, setBackupError] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [googleDriveBackups, setGoogleDriveBackups] = useState([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleApiReady, setGoogleApiReady] = useState(false);

  useEffect(() => {
    const checkAndInit = async () => {
      try {
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
          await initializeGapiClient();
          initializeGisClient();
          setGoogleApiReady(true);
        } else {
          // Scripts not loaded yet, retry
          setTimeout(checkAndInit, 500);
        }
      } catch (error) {
        console.error('Google API init error:', error);
      }
    };
    // Start checking after 1 second
    const timer = setTimeout(checkAndInit, 1000);
    return () => clearTimeout(timer);
  }, []);

  function flash(message, isError = false) {
    if (isError) {
      setBackupError(message);
      setBackupStatus('');
    } else {
      setBackupStatus(message);
      setBackupError('');
    }
    setTimeout(() => {
      setBackupStatus('');
      setBackupError('');
    }, 5000);
  }

  async function handleLocalBackup() {
    setBackupLoading(true);
    try {
      const backup = await exportAllData();
      downloadBackup(backup);
      flash('✅ Backup downloaded successfully!');
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleLocalRestore(event) {
    const file = event.target.files[0];
    if (!file) return;
    setBackupLoading(true);
    try {
      const backup = await uploadBackup(file);
      const stats = getBackupStats(backup);
      const confirmMsg = `Restore this backup?\n\nRecords: ${stats.totalRecords}\nTables: ${stats.totalTables}\n\nThis will OVERWRITE all current data!`;
      if (!window.confirm(confirmMsg)) {
        setBackupLoading(false);
        return;
      }
      const result = await importAllData(backup, true);
      flash(`✅ Restored! ${result.records} records imported.`);
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  }

  async function handleGoogleAuth() {
    try {
      if (!googleApiReady) {
        flash('Google API still loading. Please wait 2-3 seconds and try again.', true);
        return;
      }
      await authenticateGoogle();
      setGoogleConnected(true);
      flash('✅ Connected to Google Drive!');
      await loadGoogleDriveBackups();
    } catch (error) {
      flash(error.message, true);
    }
  }

  async function loadGoogleDriveBackups() {
    try {
      const backups = await listGoogleDriveBackups();
      setGoogleDriveBackups(backups);
    } catch (error) {
      flash(error.message, true);
    }
  }

  async function handleGoogleDriveBackup() {
    setBackupLoading(true);
    try {
      const backup = await exportAllData();
      const result = await uploadToGoogleDrive(backup);
      flash(`✅ Backup uploaded to Google Drive! File: ${result.filename}`);
      await loadGoogleDriveBackups();
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleGoogleDriveRestore(fileId, filename) {
    setBackupLoading(true);
    try {
      if (!window.confirm(`Restore "${filename}"?\n\nThis will OVERWRITE all current data!`)) {
        setBackupLoading(false);
        return;
      }
      const backup = await downloadFromGoogleDrive(fileId);
      const result = await importAllData(backup, true);
      flash(`✅ Restored from Google Drive! ${result.records} records imported.`);
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleGoogleDriveDelete(fileId, filename) {
    if (!window.confirm(`Delete backup "${filename}"? Cannot be undone!`)) return;
    try {
      await deleteFromGoogleDrive(fileId);
      flash('✅ Backup deleted from Google Drive');
      await loadGoogleDriveBackups();
    } catch (error) {
      flash(error.message, true);
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-2xl">☁️</div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-300">Cloud Backup</p>
            <h2 className="mt-1 text-xl font-bold text-white">Google Drive</h2>
            <p className="mt-1 text-sm text-slate-400">Save backup directly to your Google Drive</p>
          </div>
        </div>
        <Badge className={googleConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
          {googleConnected ? '✅ Connected' : '❌ Not Connected'}
        </Badge>
      </div>

      {backupStatus && (
        <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{backupStatus}</div>
      )}
      {backupError && (
        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">{backupError}</div>
      )}

      {/* Local Backup */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <h3 className="text-lg font-semibold text-white">💾 Local Backup</h3>
        <p className="mt-1 text-sm text-slate-400">Download or restore backup from your computer</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleLocalBackup} disabled={backupLoading}>
            {backupLoading ? 'Creating...' : '📥 Download Backup'}
          </Button>
          <label className="cursor-pointer">
            <Button variant="secondary" disabled={backupLoading} onClick={() => document.getElementById('local-restore-input').click()}>
              📤 Restore from File
            </Button>
            <input id="local-restore-input" type="file" accept=".json" onChange={handleLocalRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Google Drive */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">🔵 Google Drive</h3>
            <p className="mt-1 text-sm text-slate-400">Save backup to your Google Drive account</p>
          </div>
          <Badge className={googleConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
            {googleConnected ? '✅ Connected' : '❌ Not Connected'}
          </Badge>
        </div>

        {!googleConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Connect your Google account to save backups to Google Drive.
            </p>
            {!googleApiReady ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                ⏳ Google API is loading... Please wait a few seconds and refresh the page if this takes too long.
              </div>
            ) : (
              <Button onClick={handleGoogleAuth} disabled={backupLoading}>
                🔐 Connect Google Drive
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGoogleDriveBackup} disabled={backupLoading}>
                {backupLoading ? 'Uploading...' : '☁️ Backup to Google Drive'}
              </Button>
              <Button onClick={loadGoogleDriveBackups} variant="secondary" disabled={backupLoading}>
                🔄 Refresh
              </Button>
            </div>

            {googleDriveBackups.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-slate-300">Available backups ({googleDriveBackups.length}):</div>
                {googleDriveBackups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{backup.name}</div>
                      <div className="text-xs text-slate-400">
                        {backup.size} • {new Date(backup.createdTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleGoogleDriveRestore(backup.id, backup.name)} disabled={backupLoading}>
                        Restore
                      </Button>
                      <Button variant="danger" onClick={() => handleGoogleDriveDelete(backup.id, backup.name)} disabled={backupLoading}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        <strong>⚠️ Important:</strong> Restoring a backup will overwrite ALL current data. Backup your current data first!
      </div>
    </Card>
  );
}
