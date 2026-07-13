// src/organizations/organizations.resolver.ts
//
// TODO: once auth is wired up (a JwtAuthGuard + RolesGuard + @Roles
// decorator under src/common/), restrict createOrganization/
// updateOrganization to @Roles('admin', 'curator') — Contributors must not
// be able to call these (Design Document Section 3.2 permission matrix).
// This resolver is otherwise the real, working implementation of the
// service above.

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationInputDto } from './dto/organization.input';

@Resolver(() => Organization)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // Public: museum info is shown on the public catalog too
  @Query(() => [Organization])
  organizations() {
    return this.organizationsService.list();
  }

  @Query(() => Organization, { nullable: true })
  organization(@Args('id', { type: () => ID }) id: string) {
    return this.organizationsService.findById(id);
  }

  @Mutation(() => Organization)
  createOrganization(@Args('input') input: OrganizationInputDto) {
    return this.organizationsService.create(input);
  }

  @Mutation(() => Organization)
  updateOrganization(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: OrganizationInputDto,
  ) {
    return this.organizationsService.update(id, input);
  }
}
