// src/attachments/attachments.resolver.ts
//
// TODO: once auth is wired up (JwtAuthGuard + RolesGuard + @Roles), restrict
// requestArtifactUpload/confirmArtifactUpload to @Roles('admin', 'curator',
// 'contributor') per BR-14 — uploads are staff-only, but reading attachments
// stays public (Design Document Section 3.2).

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Attachment, UploadTicket } from './entities/attachment.entity';
import { AttachmentsService } from './attachments.service';

@Resolver(() => Attachment)
export class AttachmentsResolver {
  constructor(private readonly attachments: AttachmentsService) {}

  @Mutation(() => UploadTicket)
  requestArtifactUpload(
    @Args('artifactId', { type: () => ID }) artifactId: string,
    @Args('fileName') fileName: string,
    @Args('contentType') contentType: string,
    @Args('uploadedBy', { type: () => ID }) uploadedBy: string,
  ) {
    return this.attachments.requestUpload(artifactId, fileName, contentType, uploadedBy);
  }

  @Mutation(() => Attachment)
  confirmArtifactUpload(@Args('attachmentId', { type: () => ID }) attachmentId: string) {
    return this.attachments.confirmUpload(attachmentId);
  }

  // Public: attachments are visible to anyone viewing a published artifact
  @Query(() => [Attachment])
  artifactAttachments(@Args('artifactId', { type: () => ID }) artifactId: string) {
    return this.attachments.findByArtifact(artifactId);
  }
}
