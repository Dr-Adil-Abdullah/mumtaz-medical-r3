/**
 * OneDrive Backup Integration
 * Uses Microsoft Graph API to upload/download backups
 * 
 * Setup Instructions:
 * 1. Go to Azure Portal: https://portal.azure.com/
 * 2. Go to Azure Active Directory → App registrations
 * 3. Create new registration (Web application)
 * 4. Add redirect URI (your domain)
 * 5. Note Application (client) ID
 * 6. Add API permissions: Files.ReadWrite.All
 * 7. Copy Client ID and paste below
 */

const MS_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID_HERE'; // TODO: Replace with actual client ID
const MS_SCOPES = ['Files.ReadWrite.All'];
const MS_AUTHORITY = 'https://login.microsoftonline.com/common';

let msalInstance = null;
let msalInitialized = false;

/**
 * Initialize MSAL (Microsoft Authentication Library)
 */
export async function initializeMsal() {
  try {
    if (typeof msal === 'undefined') {
      throw new Error('MSAL library not loaded');
    }

    msalInstance = new msal.PublicClientApplication({
      auth: {
        clientId: MS_CLIENT_ID,
        authority: MS_AUTHORITY,
        redirectUri: window.location.origin
      }
    });

    await msalInstance.initialize();
    msalInitialized = true;
    console.log('✅ MSAL initialized');
  } catch (error) {
    console.error('❌ MSAL init failed:', error);
    throw error;
  }
}

/**
 * Check if MSAL is ready
 */
export function isMsalReady() {
  return msalInitialized && msalInstance !== null;
}

/**
 * Authenticate user with Microsoft
 * @returns {Promise<Object>} Account info
 */
export async function authenticateMicrosoft() {
  if (!isMsalReady()) {
    throw new Error('MSAL not initialized');
  }

  try {
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length === 0) {
      // No account, need to login
      const loginResponse = await msalInstance.loginPopup({
        scopes: MS_SCOPES
      });
      console.log('✅ Microsoft authentication successful');
      return loginResponse.account;
    } else {
      // Account exists, get token silently
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: MS_SCOPES,
        account: accounts[0]
      });
      console.log('✅ Microsoft token acquired silently');
      return tokenResponse.account;
    }
  } catch (error) {
    if (error.errorCode === 'interaction_required') {
      // Need interactive login
      const loginResponse = await msalInstance.loginPopup({
        scopes: MS_SCOPES
      });
      return loginResponse.account;
    }
    console.error('❌ Microsoft auth failed:', error);
    throw error;
  }
}

/**
 * Get access token for Microsoft Graph API
 * @returns {Promise<String>} Access token
 */
export async function getMicrosoftAccessToken() {
  if (!isMsalReady()) {
    throw new Error('MSAL not initialized');
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error('No Microsoft account logged in');
  }

  const tokenResponse = await msalInstance.acquireTokenSilent({
    scopes: MS_SCOPES,
    account: accounts[0]
  });

  return tokenResponse.accessToken;
}

/**
 * Upload backup to OneDrive
 * @param {Object} backup - Backup object from exportAllData()
 * @param {String} filename - Optional custom filename
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToOneDrive(backup, filename = null) {
  try {
    const accessToken = await getMicrosoftAccessToken();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const shopName = backup.shopName || 'MumtazMedical';
    const finalFilename = filename || `${shopName}_Backup_${timestamp}.json`;

    const jsonString = JSON.stringify(backup, null, 2);
    
    // Upload to OneDrive root/Applications/MumtazMedical folder
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/MumtazMedical/${finalFilename}:/content`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: jsonString
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await response.json();
    console.log(`✅ Backup uploaded to OneDrive: ${result.id}`);

    return {
      success: true,
      fileId: result.id,
      filename: finalFilename,
      webUrl: result.webUrl,
      size: result.size
    };
  } catch (error) {
    console.error('❌ OneDrive upload failed:', error);
    throw new Error(`OneDrive upload failed: ${error.message}`);
  }
}

/**
 * List backup files from OneDrive
 * @returns {Promise<Array>} List of backup files
 */
export async function listOneDriveBackups() {
  try {
    const accessToken = await getMicrosoftAccessToken();
    
    // List files in MumtazMedical folder
    const listUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/MumtazMedical:/children';
    
    const response = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Folder doesn't exist yet
        return [];
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'List failed');
    }

    const result = await response.json();
    const files = result.value || [];
    
    console.log(`✅ Found ${files.length} backups in OneDrive`);
    
    return files
      .filter(file => file.name.endsWith('.json'))
      .map(file => ({
        id: file.id,
        name: file.name,
        createdTime: file.createdDateTime,
        modifiedTime: file.lastModifiedDateTime,
        size: file.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'Unknown',
        webUrl: file.webUrl
      }));
  } catch (error) {
    console.error('❌ List OneDrive backups failed:', error);
    throw new Error(`Failed to list OneDrive backups: ${error.message}`);
  }
}

/**
 * Download backup from OneDrive
 * @param {String} filename - Backup filename
 * @returns {Promise<Object>} Backup object
 */
export async function downloadFromOneDrive(filename) {
  try {
    const accessToken = await getMicrosoftAccessToken();
    
    const downloadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/MumtazMedical/${filename}:/content`;
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Download failed');
    }

    const backup = await response.json();
    console.log(`✅ Backup downloaded from OneDrive: ${filename}`);
    
    return backup;
  } catch (error) {
    console.error('❌ OneDrive download failed:', error);
    throw new Error(`OneDrive download failed: ${error.message}`);
  }
}

/**
 * Delete backup from OneDrive
 * @param {String} fileId - OneDrive file ID
 */
export async function deleteFromOneDrive(fileId) {
  try {
    const accessToken = await getMicrosoftAccessToken();
    
    const deleteUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Delete failed');
    }

    console.log(`✅ Backup deleted from OneDrive: ${fileId}`);
  } catch (error) {
    console.error('❌ OneDrive delete failed:', error);
    throw new Error(`Failed to delete OneDrive backup: ${error.message}`);
  }
}

/**
 * Sign out from Microsoft
 */
export async function signOutMicrosoft() {
  if (isMsalReady()) {
    try {
      await msalInstance.logoutPopup();
      console.log('✅ Signed out from Microsoft');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  }
}
