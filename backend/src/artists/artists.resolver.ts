import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ArtistSummary } from './entities/artist-summary.entity';
import { ArtistsService } from './artists.service';

@Resolver(() => ArtistSummary)
export class ArtistsResolver {
  constructor(private readonly artists: ArtistsService) {}

  // Public: the Artists list on a Collection page is visible to anyone who
  // can view the Collection itself.
  @Query(() => [ArtistSummary])
  artistsByCollection(@Args('collectionId', { type: () => ID }) collectionId: string) {
    return this.artists.findByCollection(collectionId);
  }
}
