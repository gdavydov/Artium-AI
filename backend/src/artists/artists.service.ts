// src/artists/artists.service.ts
//
// Handles the Artist entity's embedded portrait field. Unlike Attachments
// (which live in R2 and are referenced by key — see attachments.service.ts),
// the portrait is stored directly as bytes on the Artist row. This service
// shows both the write path (accepting an upload and storing it inline) and
// the read path (streaming it back out through artists.controller.ts).

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentsService } from '../attachments/attachments.service';

const MAX_PORTRAIT_SIZE = 16 * 1024 * 1024; // 16MB — MySQL MEDIUMBLOB ceiling

@Injectable()
export class ArtistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  /** Artists tagged to a Collection (Artist.collectionId — Section 2.4),
   *  for the Artists list on CollectionForm.tsx. Portrait bytes are
   *  deliberately not selected here; the caller builds the image URL from
   *  `id` and hits GET /artists/:id/portrait instead. */
  findByCollection(collectionId: string) {
    return this.prisma.artist.findMany({
      where: { collectionId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  /** Full detail for AboutArtistPage.tsx: identity/bio, Period/School,
   *  whether a portrait is set, this artist's works (with a best-effort
   *  thumbnail — see ArtifactsService.findDetail for the same heuristic),
   *  and every Attachment across those works. Returns null if not found. */
  async findDetail(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: { period: true, school: true },
    });
    if (!artist) return null;

    const works = await this.prisma.artifact.findMany({
      where: { artistId: id },
      include: { attachments: true },
      orderBy: { title: 'asc' },
    });

    const artifacts = await Promise.all(
      works.map(async (work) => {
        const primary = work.attachments.find((a) => a.fileType.startsWith('image/'));
        const thumbnailUrl = primary ? (await this.attachmentsService.toDetail(primary)).previewUrl : undefined;
        return { id: work.id, title: work.title, thumbnailUrl };
      }),
    );

    const attachments = await Promise.all(
      works.flatMap((work) => work.attachments).map((a) => this.attachmentsService.toDetail(a)),
    );

    return {
      id: artist.id,
      name: artist.name,
      bio: artist.bio,
      schoolName: artist.school?.name,
      periodName: artist.period.name,
      periodStartYear: artist.period.startYear,
      periodEndYear: artist.period.endYear,
      hasPortrait: Boolean(artist.portraitImage),
      artifacts,
      attachments,
    };
  }

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
