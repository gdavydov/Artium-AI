// src/collections/collections.resolver.ts
//
// TODO: once auth is wired up (JwtAuthGuard + a @CurrentUser() decorator
// under src/common/), replace the createdByName/updatedByName args below
// with values read from the authenticated caller, and enforce
// canManageCollection()/Contributor exclusion (Design Document Section
// 2.4.2/3.2) via a guard here rather than leaving it caller-supplied.

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Collection } from './entities/collection.entity';
import { Period } from './entities/period.entity';
import { CollectionsService } from './collections.service';
import { CollectionInputDto, CollectionUpdateInputDto } from './dto/collection.input';
import { PeriodInputDto } from './dto/period.input';

@Resolver(() => Collection)
export class CollectionsResolver {
  constructor(private readonly collections: CollectionsService) {}

  @Query(() => Collection, { nullable: true })
  collection(@Args('id', { type: () => ID }) id: string) {
    return this.collections.findById(id);
  }

  @Mutation(() => Collection)
  createCollection(
    @Args('input') input: CollectionInputDto,
    @Args('createdByName') createdByName: string,
  ) {
    return this.collections.create(
      { ...input, type: input.type as 'public' | 'private' },
      createdByName,
    );
  }

  @Mutation(() => Collection)
  updateCollection(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CollectionUpdateInputDto,
    @Args('updatedByName') updatedByName: string,
  ) {
    return this.collections.update(
      id,
      { ...input, type: input.type as 'public' | 'private' | undefined },
      updatedByName,
    );
  }

  @Mutation(() => Period)
  createPeriodForCollection(
    @Args('collectionId', { type: () => ID }) collectionId: string,
    @Args('input') input: PeriodInputDto,
  ) {
    return this.collections.createPeriod(collectionId, input);
  }

  @Mutation(() => Boolean)
  async setCollectionPeriod(
    @Args('collectionId', { type: () => ID }) collectionId: string,
    @Args('periodId', { type: () => ID, nullable: true }) periodId?: string,
  ) {
    await this.collections.setPeriod(collectionId, periodId ?? null);
    return true;
  }
}
