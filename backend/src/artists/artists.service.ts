// src/artists/artists.service.ts
//
// Handles the Artist entity's embedded portrait field. Unlike Attachments
// (which live in R2 and are referenced by key — see attachments.service.ts),
// the portrait is stored directly as bytes on the Artist row. This service
// shows both the write path (accepting an upload and storing it inline) and
// the read path (streaming it back out through artists.controller.ts).

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_PORTRAIT_SIZE = 16 * 1024 * 1024; // 16MB — MySQL MEDIUMBLOB ceiling

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Accepts raw image bytes (already validated/decoded by the controller)
   *  and stores them directly on the Artist row. No object storage involved. */
  async setPortrait(artistId: string, imageBuffer: Buffer, contentType: string) {
    if (imageBuffer.length > MAX_PORTRAIT_SIZE) {
      throw new Error(
        `Portrait exceeds ${MAX_PORTRAIT_SIZE / (1024 * 1024)}MB MEDIUMBLOB limit`,
      );
    }

    return this.prisma.artist.update({
      where: { id: artistId },
      data: {
        portraitImage: imageBuffer,
        portraitContentType: contentType,
      },
    });
  }

  /** Removes the portrait — sets both fields back to null rather than
   *  deleting the Artist row. */
  async clearPortrait(artistId: string) {
    return this.prisma.artist.update({
      where: { id: artistId },
      data: { portraitImage: null, portraitContentType: null },
    });
  }

  /** Reads the raw bytes + content type back out, for the streaming
   *  endpoint in artists.controller.ts. Returns null if the artist has no
   *  portrait set. */
  async getPortrait(artistId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
      select: { portraitImage: true, portraitContentType: true },
    });
    if (!artist) throw new NotFoundException('Artist not found');
    if (!artist.portraitImage || !artist.portraitContentType) return null;

    return { buffer: Buffer.from(artist.portraitImage), contentType: artist.portraitContentType };
  }
}
