// src/attachments/storage/storage.provider.ts
//
// Abstraction over object storage. Swappable between S3 and R2 (same S3-compatible
// API) without touching any calling code. Nothing here ever touches Postgres —
// this module's only job is generating signed URLs and building storage keys.

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

export type MediaNamespace =
  | 'artifacts'
  | 'artists'
  | 'staff-uploads'
  | 'mobile/offline-bundles'
  | 'mobile/app-assets'
  | 'mobile/push-media';

@Injectable()
export class StorageProvider {
  private readonly client: S3Client;
  private readonly bucket = process.env.MEDIA_BUCKET!;

  constructor() {
    // Works for both AWS S3 and Cloudflare R2 (R2 exposes an S3-compatible endpoint)
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.STORAGE_ENDPOINT, // omit for AWS S3, set for R2
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    });
  }

  /** Builds a stable key following the design doc's layout, e.g.
   *  artifacts/{artifactId}/originals/{attachmentId}.jpg */
  buildKey(namespace: MediaNamespace, ownerId: string, fileName: string, variant?: string): string {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return variant
      ? `${namespace}/${ownerId}/${variant}/${safeName}`
      : `${namespace}/${ownerId}/${safeName}`;
  }

  /** Client uploads directly to storage using this URL — bytes never pass through
   *  the app server. */
  async getUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 300 }); // 5 min
  }

  /** Used when serving private/staff-only media; public artifact images are
   *  typically served straight through the CDN instead. */
  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}
