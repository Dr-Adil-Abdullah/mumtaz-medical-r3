/**
 * Google Drive Backup Integration
 * Uses Google Drive API to upload/download backups
 * 
 * Setup Instructions:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google Drive API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized JavaScript origins (your domain)
 * 6. Copy Client ID and paste below
 */

const GOOGLE_CLIENT_ID = '1080780384058-dtqcftnbg7rotda4suh9khnm9n1680t0.apps.googleusercontent.com'; // TODO: Replace with actual client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize Google API client
 */
export async function initializeGapiClient() {
  try {
    await gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    console.log('✅ Google API client initialized');
  } catch (error) {
    console.error('❌ GAPI init failed:', error);
    throw error;
  }
}

/**
 * Initialize Google Identity Services
 */
export function initializeGisClient() {
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('❌ Auth error:', tokenResponse.error);
        }
      },
    });
    gisInited = true;
    console.log('✅ Google Identity Services initialized');
  } catch (error) {
    console.error('❌ GIS init failed:', error);
    throw error;
  }
}

/**
 * Check if Google API is ready
 */
export function isGoogleApiReady() {
  return gapiInited && gisInited && typeof gapi !== 'undefined' && typeof google !== 'undefined';
}

/**
 * Authenticate user with Google
 * @returns {Promise<Boolean>} true if authenticated
 */
export async function authenticateGoogle() {
  return new Promise((resolve, reject) => {
    if (!isGoogleApiReady()) {
      reject(new Error('Google API not initialized. Please reload the page.'));
      return;
    }

    try {
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          console.log('✅ Google authentication successful');
          resolve(true);
        }
      };

      // Check if user is already authenticated
      if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Upload backup to Google Drive
 * @param {Object} backup - Backup object from exportAllData()
 * @param {String} filename - Optional custom filename
 * @returns {Promise<Object>} Upload result with file ID
 */
export async function uploadToGoogleDrive(backup, filename = null) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized');
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const shopName = backup.shopName || 'MumtazMedical';
    const finalFilename = filename || `${shopName}_Backup_${timestamp}.json`;

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const metadata = {
      name: finalFilename,
      mimeType: 'application/json',
      description: 'Mumtaz Medical Backup',
      appProperties: {
        backupType: 'mumtaz_medical',
        version: backup.version || '1.0.0',
        timestamp: backup.timestamp
      }
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`
      },
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await response.json();
    console.log(`✅ Backup uploaded to Google Drive: ${result.id}`);

    return {
      success: true,
      fileId: result.id,
      filename: finalFilename,
      webViewLink: result.webViewLink
    };
  } catch (error) {
    console.error('❌ Google Drive upload failed:', error);
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}

/**
 * List backup files from Google Drive
 * @returns {Promise<Array>} List of backup files
 */
export async function listGoogleDriveBackups() {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized');
  }

  try {
    const response = await gapi.client.drive.files.list({
      q: "appProperties has { key='backupType' and value='mumtaz_medical' }",
      fields: 'files(id, name, createdTime, modifiedTime, size, webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 20
    });

    const files = response.result.files || [];
    console.log(`✅ Found ${files.length} backups in Google Drive`);
    
    return files.map(file => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'Unknown',
      webViewLink: file.webViewLink
    }));
  } catch (error) {
    console.error('❌ List backups failed:', error);
    throw new Error(`Failed to list backups: ${error.message}`);
  }
}

/**
 * Download backup from Google Drive
 * @param {String} fileId - Google Drive file ID
 * @returns {Promise<Object>} Backup object
 */
export async function downloadFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized');
  }

  try {
    const accessToken = gapi.client.getToken().access_token;
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Download failed');
    }

    const backup = await response.json();
    console.log(`✅ Backup downloaded from Google Drive: ${fileId}`);
    
    return backup;
  } catch (error) {
    console.error('❌ Google Drive download failed:', error);
    throw new Error(`Google Drive download failed: ${error.message}`);
  }
}

/**
 * Delete backup from Google Drive
 * @param {String} fileId - Google Drive file ID
 */
export async function deleteFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized');
  }

  try {
    await gapi.client.drive.files.delete({
      fileId: fileId
    });

    console.log(`✅ Backup deleted from Google Drive: ${fileId}`);
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
}

/**
 * Sign out from Google
 */
export function signOutGoogle() {
  if (typeof google !== 'undefined' && google.accounts) {
    const token = gapi.client.getToken();
    if (token) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      console.log('✅ Signed out from Google');
    }
  }
}
