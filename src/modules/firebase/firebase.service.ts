import { Bucket, File } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common/decorators/core';
import admin, { ServiceAccount } from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import configuration from 'src/config/configuration';
import serviceAccount from './config/service-account.json';

@Injectable()
export class FirebaseService {
  private bucket: Bucket;
  constructor() {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
    const storage = getStorage(app);
    this.bucket = storage.bucket(configuration().firebase.storageBucket);
  }

  async getFile(path: string): Promise<File> {
    const file = await this.bucket.file(path);
    if (!file) {
      return null;
    }
    return file;
  }

  async getFiles(path: string): Promise<string[]> {
    const [files] = await this.bucket.getFiles({ prefix: path });

    const subtitlePromises = files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 10 * 60 * 1000,
      });
      return url;
    });

    return Promise.all(subtitlePromises);
  }
}
