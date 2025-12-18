# 🔧 Google Drive Permission Error Fix Guide

## ❌ Error: "Google Drive permission denied"

Agar aapko yeh error aa raha hai, to follow karein yeh steps:

## 📋 Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **meridukaan-drive**
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Google Drive API"**
5. Click on it and press **Enable**

## 🔑 Step 2: Verify Service Account Permissions

1. Go to **APIs & Services** > **Credentials**
2. Find your service account: `meridukaan-146@meridukaan-drive.iam.gserviceaccount.com`
3. Click on it to view details
4. Ensure it has **Editor** or **Owner** role in the project

## 📁 Step 3: Share Google Drive Folder (Optional but Recommended)

Service account files ko access karne ke liye, aap ek shared folder bana sakte hain:

1. Google Drive mein ek folder create karein (e.g., "MeriDukaan Uploads")
2. Folder ko right-click karein > **Share**
3. Service account email add karein: `meridukaan-146@meridukaan-drive.iam.gserviceaccount.com`
4. Permission: **Editor** select karein
5. **Send** click karein

**Note:** Agar aap folder share nahi karte, to service account sirf apne create kiye files ko access kar sakta hai.

## ✅ Step 4: Verify API Quotas

1. Go to **APIs & Services** > **Dashboard**
2. Check **Google Drive API** is listed and enabled
3. Check quotas are not exceeded

## 🧪 Step 5: Test the Configuration

Server restart karein aur phir logo upload try karein:

```bash
# Backend folder mein
npm run dev
```

## 🔍 Troubleshooting

### Issue 1: "API not enabled"
**Solution:** Step 1 follow karein - Google Drive API enable karein

### Issue 2: "Service account has no access"
**Solution:** 
- Service account ko project mein proper role dein (Editor/Owner)
- Ya phir shared folder use karein (Step 3)

### Issue 3: "403 Forbidden"
**Solution:**
- Check service account email is correct
- Verify API is enabled
- Check quotas are not exceeded

### Issue 4: Files upload ho rahe hain but access nahi ho raha
**Solution:**
- Files automatically public ho jayengi (code mein permission set hai)
- Agar nahi ho rahi, to manually file ko share karein

## 📝 Quick Checklist

- [ ] Google Drive API enabled hai
- [ ] Service account project mein proper role hai
- [ ] Service account email correct hai
- [ ] `.env` file mein `GOOGLE_APPLICATION_CREDENTIALS` set hai
- [ ] JSON credentials file sahi location mein hai
- [ ] Server restart ho chuka hai

## 🔗 Useful Links

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Enable Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)

## 💡 Alternative: Use OAuth2 Instead

Agar service account se issues continue ho, to OAuth2 use kar sakte hain:

1. OAuth2 credentials create karein
2. Refresh token generate karein
3. `.env` mein add karein:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
```

Service account method recommended hai kyunki yeh simpler hai aur server-side use ke liye better hai.

