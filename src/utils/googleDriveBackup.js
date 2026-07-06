/**
 * Google Drive Backup Integration
 * Simple approach - uses scripts from index.html
 */

const GOOGLE_CLIENT_ID = '1080780384058-dtqcftnbg7rotda4suh9khnm9n1680t0.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let gisInited = false;
let tokenClient = null;

/**
 * Initialize Google APIs
 */
export async function initializeGoogleAPIs() {
  if (gapiInited && gisInited) return;

  try {
    // Wait for GAPI to load
    if (typeof window.gapi === 'undefined') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (typeof window.gapi === 'undefined') {
        throw new Error('Google API script not loaded. Please refresh the page.');
      }
    }

    await new Promise((resolve) => {
      window.gapi.load('client', resolve);
    });

    await window.gapi.client.init({
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });

    gapiInited = true;

    // Wait for GIS to load
    if (typeof window.google === 'undefined' || typeof window.google.accounts === 'undefined') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (typeof window.google === 'undefined' || typeof window.google.accounts === 'undefined') {
        throw new Error('Google Identity Services not loaded. Please refresh the page.');
      }
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Auth error:', response.error);
        }
      },
    });

    gisInited = true;
  } catch (error) {
    console.error('Google API init failed:', error);
    throw error;
  }
}

/**
 * Check if API is ready
 */
export function isGoogleApiReady() {
  return gapiInited && gisInited;
}

/**
 * Authenticate user
 */
export async function authenticateGoogle() {
  if (!isGoogleApiReady()) {
    await initializeGoogleAPIs();
  }

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(true);
      }
    };

    const token = window.gapi.client.getToken();
    if (token === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      resolve(true);
    }
  });
}

/**
 * Upload backup
 */
export async function uploadToGoogleDrive(backup, filename = null) {
  if (!isGoogleApiReady()) {
    await initializeGoogleAPIs();
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
    return {
      success: true,
      fileId: result.id,
      filename: finalFilename,
      webViewLink: result.webViewLink
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * List backups
 */
export async function listGoogleDriveBackups() {
  if (!isGoogleApiReady()) {
    await initializeGoogleAPIs();
  }

  try {
    const response = await window.gapi.client.drive.files.list({
      q: "appProperties has { key='backupType' and value='mumtaz_medical' }",
      fields: 'files(id, name, createdTime, modifiedTime, size, webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 20
    });

    const files = response.result.files || [];
    return files.map(file => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'Unknown',
      webViewLink: file.webViewLink
    }));
  } catch (error) {
    throw new Error(`List failed: ${error.message}`);
  }
}

/**
 * Download backup
 */
export async function downloadFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    await initializeGoogleAPIs();
  }

  try {
    const accessToken = window.gapi.client.getToken().access_token;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Download failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Delete backup
 */
export async function deleteFromGoogleDrive(fileId) {
  if (!isGoogleApiReady()) {
    await initializeGoogleAPIs();
  }

  try {
    await window.gapi.client.drive.files.delete({ fileId });
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
