import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { AttachmentDetail } from '../../attachments/entities/attachment-detail.entity';

@ObjectType()
export class ArtifactSummary {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;
}

@ObjectType()
export class ArtistDetail {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  bio: string;

  @Field({ nullable: true })
  schoolName?: string; // Artist.schoolId is optional

  @Field()
  periodName: string;

  @Field(() => Int)
  periodStartYear: number;

  @Field(() => Int)
  periodEndYear: number;

  // Portrait bytes are served via GET /artists/:id/portrait (artists.controller.ts),
  // not through GraphQL — the frontend builds that URL itself once it knows
  // there's something to fetch.
  @Field()
  hasPortrait: boolean;

  @Field(() => [ArtifactSummary])
  artifacts: ArtifactSummary[];

  // Aggregated across this artist's Artifacts — Attachment has no artistId
  // column of its own (only artifactId), so "this artist's attachments"
  // means every Attachment on every Artifact attributed to them.
  @Field(() => [AttachmentDetail])
  attachments: AttachmentDetail[];
}
