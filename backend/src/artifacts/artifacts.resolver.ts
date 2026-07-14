import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ArtifactDetail } from './entities/artifact-detail.entity';
import { ArtifactsService } from './artifacts.service';

@Resolver(() => ArtifactDetail)
export class ArtifactsResolver {
  constructor(private readonly artifactsService: ArtifactsService) {}

  // Public: same visibility as the rest of the published catalog.
  @Query(() => ArtifactDetail, { nullable: true })
  artifact(@Args('id', { type: () => ID }) id: string) {
    return this.artifactsService.findDetail(id);
  }
}
