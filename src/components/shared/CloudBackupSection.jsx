import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { exportAllData, importAllData, downloadBackup, uploadBackup, getBackupStats } from '../../utils/backup';
import { uploadToGoogleDrive, listGoogleDriveBackups, downloadFromGoogleDrive, deleteFromGoogleDrive, authenticateGoogle, isGoogleApiReady } from '../../utils/googleDriveBackup';
import { uploadToOneDrive, listOneDriveBackups, downloadFromOneDrive, deleteFromOneDrive, authenticateMicrosoft, isMsalReady } from '../../utils/oneDriveBackup';

export default function CloudBackupSection() {
  const [backupStatus, setBackupStatus] = useState('');
  const [backupError, setBackupError] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [googleDriveBackups, setGoogleDriveBackups] = useState([]);
  const [oneDriveBackups, setOneDriveBackups] = useState([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);

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

  // Local backup
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

  // Local restore
  async function handleLocalRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    setBackupLoading(true);
    try {
      const backup = await uploadBackup(file);
      const stats = getBackupStats(backup);
      
      const confirmMsg = `Are you sure you want to restore this backup?\n\nThis will overwrite all current data.\n\nBackup contains:\n- ${stats.totalRecords} total records\n- ${stats.totalTables} tables\n\nThis cannot be undone!`;
      
      if (!window.confirm(confirmMsg)) {
        setBackupLoading(false);
        return;
      }

      const result = await importAllData(backup, true);
      flash(`✅ Restored successfully! ${result.records} records imported.`);
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  }

  // Google Drive
  async function handleGoogleAuth() {
    try {
      if (!isGoogleApiReady()) {
        flash('Google API not initialized. Please reload the page.', true);
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
      const confirmMsg = `Are you sure you want to restore this backup?\n\nFile: ${filename}\n\nThis will overwrite all current data. This cannot be undone!`;
      
      if (!window.confirm(confirmMsg)) {
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
    if (!window.confirm(`Delete backup "${filename}"? This cannot be undone!`)) {
      return;
    }

    try {
      await deleteFromGoogleDrive(fileId);
      flash('✅ Backup deleted from Google Drive');
      await loadGoogleDriveBackups();
    } catch (error) {
      flash(error.message, true);
    }
  }

  // OneDrive
  async function handleMicrosoftAuth() {
    try {
      if (!isMsalReady()) {
        flash('Microsoft MSAL not initialized. Please reload the page.', true);
        return;
      }
      await authenticateMicrosoft();
      setMicrosoftConnected(true);
      flash('✅ Connected to OneDrive!');
      await loadOneDriveBackups();
    } catch (error) {
      flash(error.message, true);
    }
  }

  async function loadOneDriveBackups() {
    try {
      const backups = await listOneDriveBackups();
      setOneDriveBackups(backups);
    } catch (error) {
      flash(error.message, true);
    }
  }

  async function handleOneDriveBackup() {
    setBackupLoading(true);
    try {
      const backup = await exportAllData();
      const result = await uploadToOneDrive(backup);
      flash(`✅ Backup uploaded to OneDrive! File: ${result.filename}`);
      await loadOneDriveBackups();
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleOneDriveRestore(fileId, filename) {
    setBackupLoading(true);
    try {
      const confirmMsg = `Are you sure you want to restore this backup?\n\nFile: ${filename}\n\nThis will overwrite all current data. This cannot be undone!`;
      
      if (!window.confirm(confirmMsg)) {
        setBackupLoading(false);
        return;
      }

      const backup = await downloadFromOneDrive(filename);
      const result = await importAllData(backup, true);
      flash(`✅ Restored from OneDrive! ${result.records} records imported.`);
    } catch (error) {
      flash(error.message, true);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleOneDriveDelete(fileId, filename) {
    if (!window.confirm(`Delete backup "${filename}"? This cannot be undone!`)) {
      return;
    }

    try {
      await deleteFromOneDrive(fileId);
      flash('✅ Backup deleted from OneDrive');
      await loadOneDriveBackups();
    } catch (error) {
      flash(error.message, true);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-brand-300">Backup & Restore</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Cloud Backup</h2>
          <p className="mt-2 text-sm text-slate-400">
            Backup all your data (settings, products, customers, sales, etc.) to local file, Google Drive, or OneDrive.
          </p>
        </div>
        <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">Backup Center</Badge>
      </div>

      {backupStatus && (
        <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {backupStatus}
        </div>
      )}
      {backupError && (
        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
          {backupError}
        </div>
      )}

      {/* Local Backup Section */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <h3 className="text-lg font-semibold text-white">💾 Local Backup</h3>
        <p className="mt-1 text-sm text-slate-400">Download or restore backup from your computer</p>
        
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleLocalBackup} disabled={backupLoading}>
            {backupLoading ? 'Creating backup...' : '📥 Download Backup'}
          </Button>
          <label className="cursor-pointer">
            <Button variant="secondary" disabled={backupLoading} onClick={() => document.getElementById('local-restore-input').click()}>
              📤 Restore from File
            </Button>
            <input
              id="local-restore-input"
              type="file"
              accept=".json"
              onChange={handleLocalRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Google Drive Section */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">🔵 Google Drive</h3>
            <p className="mt-1 text-sm text-slate-400">Backup to your Google Drive account</p>
          </div>
          <Badge className={googleConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
            {googleConnected ? '✅ Connected' : '❌ Not Connected'}
          </Badge>
        </div>

        {!googleConnected ? (
          <div className="mt-4">
            <Button onClick={handleGoogleAuth} variant="secondary">
              🔐 Connect Google Drive
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleGoogleDriveBackup} disabled={backupLoading}>
                {backupLoading ? 'Uploading...' : '☁️ Backup to Google Drive'}
              </Button>
              <Button onClick={loadGoogleDriveBackups} variant="secondary" disabled={backupLoading}>
                🔄 Refresh List
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

      {/* OneDrive Section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">🟦 OneDrive</h3>
            <p className="mt-1 text-sm text-slate-400">Backup to your Microsoft OneDrive account</p>
          </div>
          <Badge className={microsoftConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
            {microsoftConnected ? '✅ Connected' : '❌ Not Connected'}
          </Badge>
        </div>

        {!microsoftConnected ? (
          <div className="mt-4">
            <Button onClick={handleMicrosoftAuth} variant="secondary">
              🔐 Connect OneDrive
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleOneDriveBackup} disabled={backupLoading}>
                {backupLoading ? 'Uploading...' : '☁️ Backup to OneDrive'}
              </Button>
              <Button onClick={loadOneDriveBackups} variant="secondary" disabled={backupLoading}>
                🔄 Refresh List
              </Button>
            </div>

            {oneDriveBackups.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-slate-300">Available backups ({oneDriveBackups.length}):</div>
                {oneDriveBackups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{backup.name}</div>
                      <div className="text-xs text-slate-400">
                        {backup.size} • {new Date(backup.createdTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleOneDriveRestore(backup.id, backup.name)} disabled={backupLoading}>
                        Restore
                      </Button>
                      <Button variant="danger" onClick={() => handleOneDriveDelete(backup.id, backup.name)} disabled={backupLoading}>
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
        <strong>⚠️ Important:</strong> Restoring a backup will overwrite ALL current data. Make sure to backup your current data before restoring!
      </div>
    </Card>
  );
}
