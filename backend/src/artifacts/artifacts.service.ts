// src/artifacts/artifacts.service.ts
//
// Read-only detail query backing ArtifactPage.tsx — no create/update here
// yet (Artifact creation/editing isn't wired up on the frontend at all
// today, only viewing).

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class ArtifactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async findDetail(id: string) {
    const artifact = await this.prisma.artifact.findUnique({
      where: { id },
      include: { medium: true, artist: true, attachments: true },
    });
    if (!artifact) return null;

    const attachmentDetails = await Promise.all(
      artifact.attachments.map((a) => this.attachmentsService.toDetail(a)),
    );
    const primaryImage = attachmentDetails.find((a) => a.fileType.startsWith('image/'));

    return {
      id: artifact.id,
      title: artifact.title,
      description: artifact.description,
      location: artifact.location ?? undefined,
      medium: artifact.medium.name,
      status: artifact.status,
      artistName: artifact.artist?.name,
      primaryImageUrl: primaryImage?.previewUrl,
      attachments: attachmentDetails,
    };
  }
}
