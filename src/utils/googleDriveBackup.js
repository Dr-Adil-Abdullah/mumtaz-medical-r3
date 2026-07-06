/**
 * Google Drive Backup Integration
 * Uses Google Drive API to upload/download backups
 */

const GOOGLE_CLIENT_ID = '1080780384058-dtqcftnbg7rotda4suh9khnm9n1680t0.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let gisInited = false;
let tokenClient = null;

/**
 * Load a script dynamically
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google API client
 */
export async function initializeGapiClient() {
  try {
    await loadScript('https://apis.google.com/js/api.js');
    return new Promise((resolve) => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
        console.log('✅ Google API client initialized');
        resolve();
      });
    });
  } catch (error) {
    console.error('❌ GAPI init failed:', error);
    throw new Error('Google API initialization failed. Please refresh the page.');
  }
}

/**
 * Initialize Google Identity Services
 */
export async function initializeGisClient() {
  try {
    await loadScript('https://accounts.google.com/gsi/client');
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('❌ Auth error:', response.error);
          throw new Error(response.error);
        }
      },
    });
    gisInited = true;
    console.log('✅ Google Identity Services initialized');
  } catch (error) {
    console.error('❌ GIS init failed:', error);
    throw new Error('Google Identity Services initialization failed. Please refresh the page.');
  }
}

/**
 * Check if Google API is ready
 */
export function isGoogleApiReady() {
  return gapiInited && gisInited;
}

/**
 * Authenticate user with Google
 */
export async function authenticateGoogle() {
  return new Promise((resolve, reject) => {
    if (!isGoogleApiReady()) {
      reject(new Error('Google API not initialized. Please refresh the page and try again.'));
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

      if (window.gapi.client.getToken() === null) {
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
 */
export async function uploadToGoogleDrive(backup, filename = null) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized. Please refresh the page.');
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
        Authorization: `Bearer ${window.gapi.client.getToken().access_token}`
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
 */
export async function listGoogleDriveBackups() {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized. Please refresh the page.');
  }

  try {
    const response = await window.gapi.client.drive.files.list({
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
 */
export async function downloadFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized. Please refresh the page.');
  }

  try {
    const accessToken = window.gapi.client.getToken().access_token;
    
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
 */
export async function deleteFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    throw new Error('Google API not initialized. Please refresh the page.');
  }

  try {
    await window.gapi.client.drive.files.delete({
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
  if (typeof window.google !== 'undefined' && window.google.accounts) {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      console.log('✅ Signed out from Google');
    }
  }
}
