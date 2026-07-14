import { ObjectType, Field, ID } from '@nestjs/graphql';

// Separate from Attachment (the raw upload-flow entity, which carries
// artifactId/uploadedBy instead) — this is the display shape ArtifactPage.tsx
// and AboutArtistPage.tsx actually consume. `label`/`role` in the frontend's
// AttachmentSummary type don't exist as real columns (schema.prisma's
// Attachment has no label/role field), so `label` is derived from the
// storage key's filename and `role` is simply never populated.
@ObjectType()
export class AttachmentDetail {
  @Field(() => ID)
  id: string;

  @Field()
  fileUrl: string; // object storage key

  @Field()
  fileType: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  previewUrl?: string; // signed, browser-loadable URL — undefined if storage isn't reachable/configured
}
