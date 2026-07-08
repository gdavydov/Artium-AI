// src/artists/artists.service.ts
//
// Handles the Artist entity's embedded portrait field. Unlike Attachments
// (which live in R2 and are referenced by key — see attachments-service.ts),
// the portrait is stored directly as bytes on the Artist row. This service
// shows both the write path (accepting an upload and storing it inline) and
// the read path (streaming it back out through a dedicated endpoint).

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
        portrait_image: imageBuffer,
        portrait_content_type: contentType,
      },
    });
  }

  /** Removes the portrait — sets both fields back to null rather than
   *  deleting the Artist row. */
  async clearPortrait(artistId: string) {
    return this.prisma.artist.update({
      where: { id: artistId },
      data: { portrait_image: null, portrait_content_type: null },
    });
  }

  /** Reads the raw bytes + content type back out, for the streaming
   *  endpoint below. Returns null if the artist has no portrait set. */
  async getPortrait(artistId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
      select: { portrait_image: true, portrait_content_type: true },
    });
    if (!artist) throw new NotFoundException('Artist not found');
    if (!artist.portrait_image || !artist.portrait_content_type) return null;

    return { buffer: artist.portrait_image, contentType: artist.portrait_content_type };
  }
}

// ---------------------------------------------------------------------------

// src/artists/artists.controller.ts
//
// A REST controller (not GraphQL) is used specifically for the portrait
// endpoint, since streaming raw binary with a Content-Type header doesn't fit
// GraphQL's JSON response model. The rest of the Artist API (CRUD, relations)
// can still be GraphQL — this is a narrow, deliberate exception.
//
// import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
// import { Response } from 'express';
// import { ArtistsService } from './artists.service';
//
// @Controller('artists')
// export class ArtistsController {
//   constructor(private readonly artists: ArtistsService) {}
//
//   // Public: no auth guard — portraits are visible to anyone viewing a
//   // published artist, same visibility rule as the rest of the public API.
//   @Get(':id/portrait')
//   async getPortrait(@Param('id') id: string, @Res() res: Response) {
//     const portrait = await this.artists.getPortrait(id);
//     if (!portrait) throw new NotFoundException('No portrait set for this artist');
//
//     res.setHeader('Content-Type', portrait.contentType);
//     res.setHeader('Cache-Control', 'public, max-age=86400'); // mitigates lack of CDN caching
//     res.send(portrait.buffer);
//   }
// }
