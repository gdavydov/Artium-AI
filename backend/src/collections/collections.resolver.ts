// src/collections/collections.resolver.ts
//
// Creating a Collection is Admin/Curator only (Design Document Section 3.2,
// same rule as Organization). Editing an existing Collection (metadata,
// Period tagging) additionally allows a Curator/Contributor holding a
// `manage` CollectionAccess grant on that specific Collection — see
// CollectionsService.canManageCollection() and Section 2.4.2/3.2's "Manage a
// private Collection" row. That per-record check can't be expressed as a
// static @Roles() list, so it's done inline here instead of via RolesGuard.
//
// createdByName/updatedByName use the caller's email — User has no separate
// display-name column today (see schema.prisma).

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Collection } from './entities/collection.entity';
import { Period } from './entities/period.entity';
import { CollectionsService } from './collections.service';
import { CollectionInputDto, CollectionUpdateInputDto } from './dto/collection.input';
import { PeriodInputDto } from './dto/period.input';

@Resolver(() => Collection)
export class CollectionsResolver {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Query(() => Collection, { nullable: true })
  collection(@Args('id', { type: () => ID }) id: string) {
    return this.collectionsService.findById(id);
  }

  // No JwtAuthGuard: an anonymous caller is allowed here, they just only see
  // `public` Collections (listVisibleTo() treats a missing user as anonymous).
  @Query(() => [Collection])
  collections(@CurrentUser() user?: AuthenticatedUser) {
    return this.collectionsService.listVisibleTo(user);
  }

  @Query(() => [Period])
  periods() {
    return this.collectionsService.listPeriods();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'curator')
  @Mutation(() => Collection)
  createCollection(@Args('input') input: CollectionInputDto, @CurrentUser() user: AuthenticatedUser) {
    return this.collectionsService.create({ ...input, type: input.type as 'public' | 'private' }, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Collection)
  async updateCollection(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CollectionUpdateInputDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const allowed = await this.collectionsService.canManageCollection(user.id, user.role, id);
    if (!allowed) throw new ForbiddenException('You do not have manage access to this Collection');

    return this.collectionsService.update(
      id,
      { ...input, type: input.type as 'public' | 'private' | undefined },
      user.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Period)
  async createPeriodForCollection(
    @Args('collectionId', { type: () => ID }) collectionId: string,
    @Args('input') input: PeriodInputDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const allowed = await this.collectionsService.canManageCollection(user.id, user.role, collectionId);
    if (!allowed) throw new ForbiddenException('You do not have manage access to this Collection');

    return this.collectionsService.createPeriod(collectionId, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async setCollectionPeriod(
    @Args('collectionId', { type: () => ID }) collectionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Args('periodId', { type: () => ID, nullable: true }) periodId?: string,
  ) {
    const allowed = await this.collectionsService.canManageCollection(user.id, user.role, collectionId);
    if (!allowed) throw new ForbiddenException('You do not have manage access to this Collection');

    await this.collectionsService.setPeriod(collectionId, periodId ?? null);
    return true;
  }
}
