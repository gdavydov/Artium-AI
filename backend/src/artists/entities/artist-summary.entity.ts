import { ObjectType, Field, ID } from '@nestjs/graphql';

// Deliberately excludes the portrait blob — that's served by
// artists.controller.ts's REST endpoint (GET /artists/:id/portrait), not
// through GraphQL, since GraphQL's JSON response model doesn't fit binary
// streaming. Callers build the image URL themselves from `id`.
@ObjectType()
export class ArtistSummary {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
