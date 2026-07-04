import { db } from '../db/index';

/**
 * Backup Utility - Export/Import all data
 * Creates a complete backup of all IndexedDB data
 */

// All tables to backup
const BACKUP_TABLES = [
  'settings',
  'staff',
  'products',
  'product_batches',
  'customers',
  'suppliers',
  'sales',
  'expenses',
  'purchase_list',
  'logs',
  'partial_payments',
  'day_sessions'
];

/**
 * Export all data from IndexedDB
 * @returns {Object} Complete backup object with all data
 */
export async function exportAllData() {
  const backup = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    shopName: '',
    tables: {}
  };

  try {
    // Get shop name from settings
    const settings = await db.settings.get(1);
    if (settings) {
      backup.shopName = settings.shop_name || 'Mumtaz Medical';
    }

    // Export each table
    for (const tableName of BACKUP_TABLES) {
      const data = await db.table(tableName).toArray();
      backup.tables[tableName] = data;
    }

    console.log(`✅ Backup created: ${backup.tables ? Object.keys(backup.tables).length : 0} tables`);
    return backup;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw new Error(`Backup export failed: ${error.message}`);
  }
}

/**
 * Import all data to IndexedDB
 * @param {Object} backup - Backup object from exportAllData()
 * @param {Boolean} overwrite - If true, clears existing data first
 */
export async function importAllData(backup, overwrite = false) {
  if (!backup || !backup.tables) {
    throw new Error('Invalid backup file format');
  }

  try {
    // Validate backup version
    if (backup.version !== '1.0.0') {
      console.warn(`⚠️ Backup version mismatch: ${backup.version} vs 1.0.0`);
    }

    // If overwrite, clear all tables first
    if (overwrite) {
      console.log('🗑️ Clearing existing data...');
      for (const tableName of BACKUP_TABLES) {
        await db.table(tableName).clear();
      }
    }

    // Import each table
    let totalRecords = 0;
    for (const tableName of BACKUP_TABLES) {
      if (backup.tables[tableName]) {
        const records = backup.tables[tableName];
        
        if (records.length > 0) {
          // Use bulkPut to add/update records
          await db.table(tableName).bulkPut(records);
          totalRecords += records.length;
          console.log(`✅ Imported ${records.length} records to ${tableName}`);
        }
      }
    }

    console.log(`✅ Import complete: ${totalRecords} total records`);
    return { success: true, records: totalRecords };
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw new Error(`Backup import failed: ${error.message}`);
  }
}

/**
 * Download backup as JSON file
 * @param {Object} backup - Backup object from exportAllData()
 * @param {String} filename - Optional custom filename
 */
export function downloadBackup(backup, filename = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const shopName = backup.shopName || 'MumtazMedical';
  const defaultFilename = `${shopName}_Backup_${timestamp}.json`;
  const finalFilename = filename || defaultFilename;

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Backup downloaded: ${finalFilename}`);
}

/**
 * Upload backup from JSON file
 * @param {File} file - JSON file from file input
 * @returns {Object} Parsed backup object
 */
export function uploadBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        if (!backup.tables) {
          throw new Error('Invalid backup file: missing tables');
        }

        console.log(`✅ Backup file loaded: ${Object.keys(backup.tables).length} tables`);
        resolve(backup);
      } catch (error) {
        console.error('❌ Parse failed:', error);
        reject(new Error(`Invalid backup file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Get backup statistics
 * @param {Object} backup - Backup object
 * @returns {Object} Statistics about backup
 */
export function getBackupStats(backup) {
  if (!backup || !backup.tables) {
    return null;
  }

  const stats = {
    totalTables: Object.keys(backup.tables).length,
    totalRecords: 0,
    tables: {}
  };

  for (const [tableName, records] of Object.entries(backup.tables)) {
    const count = records ? records.length : 0;
    stats.tables[tableName] = count;
    stats.totalRecords += count;
  }

  return stats;
}

/**
 * Quick backup to localStorage (for auto-backup)
 * Warning: localStorage has 5-10MB limit
 */
export async function quickBackupToLocalStorage() {
  try {
    const backup = await exportAllData();
    const compressed = JSON.stringify(backup);
    
    // Check size
    const sizeInMB = (compressed.length / 1024 / 1024).toFixed(2);
    if (sizeInMB > 4) {
      console.warn(`⚠️ Backup too large for localStorage: ${sizeInMB}MB`);
      return { success: false, error: 'Backup too large', size: sizeInMB };
    }

    localStorage.setItem('mumtaz_medical_quick_backup', compressed);
    localStorage.setItem('mumtaz_medical_quick_backup_time', new Date().toISOString());

    console.log(`✅ Quick backup saved: ${sizeInMB}MB`);
    return { success: true, size: sizeInMB };
  } catch (error) {
    console.error('❌ Quick backup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore from localStorage quick backup
 */
export async function restoreFromQuickBackup() {
  try {
    const compressed = localStorage.getItem('mumtaz_medical_quick_backup');
    if (!compressed) {
      throw new Error('No quick backup found');
    }

    const backup = JSON.parse(compressed);
    const result = await importAllData(backup, true);
    
    return result;
  } catch (error) {
    console.error('❌ Quick restore failed:', error);
    throw error;
  }
}

/**
 * Get quick backup info
 */
export function getQuickBackupInfo() {
  const backupTime = localStorage.getItem('mumtaz_medical_quick_backup_time');
  const backup = localStorage.getItem('mumtaz_medical_quick_backup');

  if (!backup || !backupTime) {
    return null;
  }

  return {
    timestamp: backupTime,
    size: (backup.length / 1024 / 1024).toFixed(2) + 'MB'
  };
}
