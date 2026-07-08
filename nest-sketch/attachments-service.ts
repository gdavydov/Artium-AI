// src/attachments/attachments.service.ts
//
// Owns the two-step upload flow: (1) issue a signed URL, (2) once the client
// confirms the upload succeeded, write ONLY the storage key/metadata to Postgres.
// The actual file bytes never touch this service or the database.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageProvider } from './storage/storage.provider';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
  ) {}

  /** Step 1 — called before the client uploads anything. */
  async requestUpload(artifactId: string, fileName: string, contentType: string) {
    const attachment = await this.prisma.attachment.create({
      data: {
        artifactId,
        fileType: contentType,
        fileUrl: '', // filled in on confirm()
        status: 'pending',
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

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { status: 'active' },
    });
  }

  findByArtifact(artifactId: string) {
    return this.prisma.attachment.findMany({ where: { artifactId, status: 'active' } });
  }
}

// ---------------------------------------------------------------------------

// src/attachments/attachments.resolver.ts
//
// import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { AttachmentsService } from './attachments.service';
// import { UploadTicket, Attachment } from './entities/attachment.entity';
//
// @Resolver(() => Attachment)
// export class AttachmentsResolver {
//   constructor(private readonly attachments: AttachmentsService) {}
//
//   // Staff-only: Contributors, Curators, and Admins can all upload (per BR-14)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin', 'curator', 'contributor')
//   @Mutation(() => UploadTicket)
//   requestArtifactUpload(
//     @Args('artifactId') artifactId: string,
//     @Args('fileName') fileName: string,
//     @Args('contentType') contentType: string,
//   ) {
//     return this.attachments.requestUpload(artifactId, fileName, contentType);
//   }
//
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin', 'curator', 'contributor')
//   @Mutation(() => Attachment)
//   confirmArtifactUpload(@Args('attachmentId') attachmentId: string) {
//     return this.attachments.confirmUpload(attachmentId);
//   }
//
//   // Public: attachments are visible to anyone viewing a published artifact
//   @Query(() => [Attachment])
//   artifactAttachments(@Args('artifactId') artifactId: string) {
//     return this.attachments.findByArtifact(artifactId);
//   }
// }
