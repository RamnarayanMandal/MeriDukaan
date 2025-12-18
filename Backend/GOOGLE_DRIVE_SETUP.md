# 🔧 Google Drive Service Account Setup Guide

## 📋 Overview

This guide explains how to configure Google Drive service account credentials using environment variables instead of storing the JSON file in your codebase.

## 🔐 Step 1: Get Your Service Account JSON

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **Service Account**
5. Fill in the service account details
6. Click **Create and Continue**
7. Grant necessary permissions (or skip for now)
8. Click **Done**
9. Click on the created service account
10. Go to **Keys** tab
11. Click **Add Key** > **Create new key**
12. Choose **JSON** format
13. Download the JSON file

## 🔑 Step 2: Configure Environment Variables

You have **two options** to configure the credentials:

### Option 1: Using File Path (Development)

1. Place your service account JSON file in a secure location (e.g., `Backend/config/credentials/`)
2. Add to `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./config/credentials/meridukaan-drive-49be20aa1fe2.json
```

### Option 2: Using JSON String (Recommended for Production)

1. Open your service account JSON file
2. Copy the entire JSON content
3. Convert it to a single line (remove all line breaks)
4. Add to `.env`:
```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"meridukaan-drive",...}'
```

**Important Notes:**
- Use single quotes `'` around the JSON string to avoid issues with special characters
- Or escape double quotes: `"{\"type\":\"service_account\",...}"`
- Make sure `\n` in private_key is preserved as `\\n` in the environment variable

## 📝 Step 3: Update Your .env File

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Google Drive credentials using one of the options above

## 🚫 Step 4: Secure Your Credentials

1. **Never commit** the JSON file or `.env` file to Git
2. The `.gitignore` already includes:
   - `*.json` files matching `*-drive-*.json` pattern
   - `.env` files

3. Verify your `.gitignore` includes:
```
# Google Service Account JSON files
*-drive-*.json
*-service-account*.json
*credentials*.json

# Environment files
.env
.env.local
```

## ✅ Step 5: Verify Configuration

The Google Drive service will automatically use the credentials from environment variables. The service checks in this order:

1. `GOOGLE_APPLICATION_CREDENTIALS` (file path)
2. `GOOGLE_SERVICE_ACCOUNT_JSON` (JSON string)
3. OAuth2 credentials (if configured)

## 🔍 Troubleshooting

### Error: "Google Drive credentials not configured"
- Check that your `.env` file is in the `Backend/` directory
- Verify the environment variable name is correct
- Restart your server after updating `.env`

### Error: "Failed to parse JSON"
- Ensure the JSON string is properly formatted
- Check that quotes are escaped correctly
- Verify `\n` characters in private_key are preserved

### Error: "Authentication failed"
- Verify your service account has Google Drive API enabled
- Check that the service account email has proper permissions
- Ensure the JSON credentials are valid and not expired

## 📚 Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Google Drive API Quickstart](https://developers.google.com/drive/api/quickstart/nodejs)

