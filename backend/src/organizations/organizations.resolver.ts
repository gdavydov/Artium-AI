// src/organizations/organizations.resolver.ts
//
// Only Admin/Curator may create or edit an Organization (Design Document
// Section 3.2 permission matrix) — enforced below via JwtAuthGuard +
// RolesGuard. Reading is public (museum info is shown on the public catalog).

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationInputDto } from './dto/organization.input';

@Resolver(() => Organization)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Query(() => [Organization])
  organizations() {
    return this.organizationsService.list();
  }

  @Query(() => Organization, { nullable: true })
  organization(@Args('id', { type: () => ID }) id: string) {
    return this.organizationsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'curator')
  @Mutation(() => Organization)
  createOrganization(@Args('input') input: OrganizationInputDto) {
    return this.organizationsService.create(input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'curator')
  @Mutation(() => Organization)
  updateOrganization(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: OrganizationInputDto,
  ) {
    return this.organizationsService.update(id, input);
  }
}
