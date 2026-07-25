import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ArtistSummary } from './entities/artist-summary.entity';
import { ArtistDetail } from './entities/artist-detail.entity';
import { ArtistsService } from './artists.service';

@Resolver(() => ArtistSummary)
export class ArtistsResolver {
  constructor(private readonly artistsService: ArtistsService) {}

  // Public: the Artists list on a Collection page is visible to anyone who
  // can view the Collection itself.
  @Query(() => [ArtistSummary])
  artistsByCollection(@Args('collectionId', { type: () => ID }) collectionId: string) {
    return this.artistsService.findByCollection(collectionId);
  }

  // Public: AboutArtistPage.tsx, same visibility as the rest of the catalog.
  @Query(() => ArtistDetail, { nullable: true })
  artistDetail(@Args('id', { type: () => ID }) id: string) {
    return this.artistsService.findDetail(id);
  }
}
