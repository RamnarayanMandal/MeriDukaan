import { google } from 'googleapis';
import { Readable } from 'stream';

export interface UploadedFileInfo {
  fileId: string;
  url: string;
}

export class GoogleDriveService {
  private static drive: any = null;

  private static async initializeDrive() {
    if (this.drive) return this.drive;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'Google Drive OAuth credentials missing. ' +
        'Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN'
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });

    return this.drive;
  }

  static async uploadImage(file: Express.Multer.File): Promise<UploadedFileInfo> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file');
    }

    const drive = await this.initializeDrive();
    const body = file.stream ?? Readable.from(file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname || `image_${Date.now()}`,
        mimeType: file.mimetype,
      },
      media: {
        mimeType: file.mimetype,
        body,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = response.data.id!;
    
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const url =
      response.data.webViewLink ||
      response.data.webContentLink ||
      `https://drive.google.com/uc?export=view&id=${fileId}`;

    return { fileId, url };
  }
}
