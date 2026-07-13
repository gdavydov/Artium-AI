// src/attachments/attachments.service.ts
//
// Owns the two-step upload flow: (1) issue a signed URL, (2) once the client
// confirms the upload succeeded, write ONLY the storage key/metadata to Postgres.
// The actual file bytes never touch this service or the database.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProvider } from '../storage/storage.provider';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
  ) {}

  /** Step 1 — called before the client uploads anything. */
  async requestUpload(artifactId: string, fileName: string, contentType: string, uploadedBy: string) {
    const attachment = await this.prisma.attachment.create({
      data: {
        artifactId,
        uploadedBy,
        fileType: contentType,
        fileUrl: '', // filled in below, once the key is known
      },
    });

    const key = this.storage.buildKey('artifacts', artifactId, fileName, 'originals');
    const uploadUrl = await this.storage.getUploadUrl(key, contentType);

    // Record the key now so confirm() has something to validate against later
    await this.prisma.attachment.update({
      where: { id: attachment.id },
      data: { fileUrl: key },
    });

    return { attachmentId: attachment.id, uploadUrl, key };
  }

  /** Step 2 — called by the client after the direct-to-storage upload succeeds. */
  async confirmUpload(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundException('Attachment not found');
    return attachment;
  }

  findByArtifact(artifactId: string) {
    return this.prisma.attachment.findMany({ where: { artifactId } });
  }
}
