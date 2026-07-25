import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AttachmentDetail } from '../../attachments/entities/attachment-detail.entity';

@ObjectType()
export class ArtifactDetail {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  medium: string; // Medium.name

  @Field()
  status: string; // 'draft' | 'published'

  @Field({ nullable: true })
  artistName?: string; // undefined for unattributed works — Artifact.artistId is nullable

  // First image-type Attachment's resolved preview URL, if any — the
  // schema has no explicit "primary image" flag on Attachment, so this is
  // a best-effort pick rather than a stored designation.
  @Field({ nullable: true })
  primaryImageUrl?: string;

  @Field(() => [AttachmentDetail])
  attachments: AttachmentDetail[];
}
