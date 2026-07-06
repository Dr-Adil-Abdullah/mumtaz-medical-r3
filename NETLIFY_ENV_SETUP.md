# Netlify Environment Variables Setup (R3)

## How to Add Environment Variables in Netlify

1. Go to: https://app.netlify.com
2. Open your site: **mmr3.netlify.app**
3. Click **Site settings** (left sidebar)
4. Click **Environment variables**
5. Click **Add a variable**

## Required Variables for Sync

### 1. Supabase (اگر استعمال کر رہے ہیں)
```
VITE_SUPABASE_URL=https://wdrqaigkpmsqaxhbpzzv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Oa1kIlaM-QNoO1hVtQl_Tw_9KsjpWvT
```

### 2. Google Drive
```
VITE_GOOGLE_DRIVE_CLIENT_ID=1080780384058-dtqcftnbg7rotda4suh9khnm9n1680t0.apps.googleusercontent.com
```

### 3. Optional: Enable Sync Features
```
VITE_ENABLE_SYNC=true
VITE_ENABLE_GOOGLE_DRIVE=true
```

## How to Deploy Changes

After adding variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

## Important Notes

- Netlify variables start with `VITE_` (for Vite projects)
- After adding variables, you **must** redeploy
- Changes in `.env` file locally will NOT affect Netlify
- All sync now happens through `syncQueue.js` + `connectionManager.js`

## Current Sync Status

The app uses:
- **IndexedDB** as primary storage (always works)
- **Supabase** for optional cloud sync
- **Google Drive** for backup

If sync is not working between devices:
1. Check Environment Variables in Netlify
2. Make sure both devices are on same Netlify deployment
3. Check browser console for errors
