# Cloud Backup Setup Guide

This guide will help you set up Google Drive and OneDrive backup for Mumtaz Medical.

---

## 📋 Table of Contents
1. [Local Backup (No Setup Required)](#local-backup)
2. [Google Drive Backup Setup](#google-drive-setup)
3. [OneDrive Backup Setup](#onedrive-setup)

---

## 💾 Local Backup

Local backup requires **no setup**. It works immediately!

### How to use:
1. Go to **Settings** page
2. Scroll to **Backup & Restore** section
3. Click **📥 Download Backup** to create a backup file
4. Click **📤 Restore from File** to restore from a backup file

That's it! Your data is saved as a JSON file on your computer.

---

## 🔵 Google Drive Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **Select a project** (top of page)
4. Click **NEW PROJECT**
5. Enter project name: `Mumtaz Medical`
6. Click **CREATE**

### Step 2: Enable Google Drive API

1. In your new project, go to **APIs & Services** → **Library**
2. Search for: `Google Drive API`
3. Click on **Google Drive API**
4. Click **ENABLE**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, click **CONFIGURE CONSENT SCREEN**
   - Choose **External** user type
   - Click **CREATE**
   - Fill in required fields:
     - App name: `Mumtaz Medical`
     - User support email: (your email)
     - Developer contact email: (your email)
   - Click **SAVE AND CONTINUE** (skip scopes for now)
   - Click **SAVE AND CONTINUE** again (skip test users)
   - Click **BACK TO DASHBOARD**
4. Now create OAuth client:
   - Application type: **Web application**
   - Name: `Mumtaz Medical Web`
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:5173` (for local development)
     - `https://your-domain.netlify.app` (your Netlify domain)
     - `https://your-custom-domain.com` (if you have one)
   - Click **CREATE**

### Step 4: Copy Client ID

1. You'll see a popup with your **Client ID**
2. Copy the Client ID (it looks like: `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)
3. Click **OK**

### Step 5: Add Client ID to Code

1. Open file: `src/utils/googleDriveBackup.js`
2. Find this line (line 16):
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
   ```
3. Replace `'YOUR_GOOGLE_CLIENT_ID_HERE'` with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = '123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
   ```
4. Save the file

### Step 6: Test

1. Go to **Settings** page
2. Scroll to **Google Drive** section
3. Click **🔐 Connect Google Drive**
4. Sign in with your Google account
5. Grant permissions
6. Click **☁️ Backup to Google Drive**
7. Your backup will be uploaded!

---

## 🟦 OneDrive Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Sign in with your Microsoft account
3. Go to **Azure Active Directory** (or **Microsoft Entra ID**)
4. Click **App registrations** (left menu)
5. Click **+ New registration**
6. Fill in:
   - Name: `Mumtaz Medical`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: **Single-page application (SPA)** → `http://localhost:5173`
7. Click **Register**

### Step 2: Note Application (Client) ID

1. After registration, you'll see the app overview
2. Copy the **Application (client) ID** (looks like: `12345678-abcd-1234-abcd-1234567890ab`)
3. Keep this page open

### Step 3: Add Redirect URIs

1. In your app registration, click **Authentication** (left menu)
2. Under **Platform configurations**, click **+ Add a platform**
3. Choose **Single-page application**
4. Add these redirect URIs:
   - `http://localhost:5173`
   - `https://your-domain.netlify.app` (your Netlify domain)
   - `https://your-custom-domain.com` (if you have one)
5. Click **Configure**

### Step 4: Add API Permissions

1. Click **API permissions** (left menu)
2. Click **+ Add a permission**
3. Choose **Microsoft Graph**
4. Choose **Delegated permissions**
5. Search for: `Files.ReadWrite.All`
6. Check the box for **Files.ReadWrite.All**
7. Click **Add permissions**
8. Click **Grant admin consent** (if you have admin rights)

### Step 5: Add Client ID to Code

1. Open file: `src/utils/oneDriveBackup.js`
2. Find this line (line 17):
   ```javascript
   const MS_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID_HERE';
   ```
3. Replace `'YOUR_MICROSOFT_CLIENT_ID_HERE'` with your actual Client ID:
   ```javascript
   const MS_CLIENT_ID = '12345678-abcd-1234-abcd-1234567890ab';
   ```
4. Save the file

### Step 6: Test

1. Go to **Settings** page
2. Scroll to **OneDrive** section
3. Click **🔐 Connect OneDrive**
4. Sign in with your Microsoft account
5. Grant permissions
6. Click **☁️ Backup to OneDrive**
7. Your backup will be uploaded to `MumtazMedical` folder in your OneDrive!

---

## ⚠️ Important Notes

1. **Security**: Your Client IDs are safe to share publicly. They only allow your app to request access. Users must still grant permission.

2. **Domain Verification**: For production, you may need to verify your domain with Google/Microsoft.

3. **Backup Location**:
   - Google Drive: Backups appear in your Drive root
   - OneDrive: Backups appear in `MumtazMedical` folder

4. **Restore Warning**: Restoring a backup will **overwrite ALL current data**. Always backup current data before restoring!

5. **Cost**: Both Google Drive and OneDrive have free tiers. Check your storage limits.

---

## 🆘 Troubleshooting

### Google Drive Issues

**Problem**: "Google API not initialized"
- **Solution**: Reload the page. Make sure you added the scripts to `index.html`.

**Problem**: "Access denied" or "invalid_client"
- **Solution**: Check that your redirect URI in Google Console matches your actual domain exactly (including http vs https).

**Problem**: Backup fails to upload
- **Solution**: Check your Google Drive storage. Free tier is 15GB.

### OneDrive Issues

**Problem**: "MSAL not initialized"
- **Solution**: Reload the page. Make sure you added the MSAL script to `index.html`.

**Problem**: "AADSTS" error
- **Solution**: Check that you granted admin consent for the API permissions.

**Problem**: Backup folder not created
- **Solution**: The folder is created automatically on first backup. Check your OneDrive root.

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for error messages (F12 → Console tab)
2. Verify all steps in this guide are completed
3. Ensure Client IDs are correctly copied (no extra spaces)

---

## ✅ Checklist

Before using cloud backup, ensure:

- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added for Google
- [ ] Google Client ID added to `googleDriveBackup.js`
- [ ] Azure AD app registered
- [ ] API permissions added for Microsoft
- [ ] Redirect URIs added for Microsoft
- [ ] Microsoft Client ID added to `oneDriveBackup.js`
- [ ] Scripts added to `index.html`
- [ ] Tested Google Drive backup
- [ ] Tested OneDrive backup

