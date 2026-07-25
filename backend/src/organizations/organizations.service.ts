// src/organizations/organizations.service.ts
//
// created_at is populated exactly once, by the Prisma/DB default
// (schema.prisma: `@default(now())`, schema.sql: `default now()`) — this
// service never includes createdAt in an update payload, so it's
// structurally impossible for an edit to change it. updated_at stays NULL
// until the first edit, then is stamped here on every subsequent update.
// Same audit-timestamp pattern already used by Collection (see
// Design Document Section 2.4).
//
// Access control: only Admin and Curator may create/edit Organization
// records — Contributors cannot (see organizations.resolver.ts and Section
// 3.2's permission matrix). This service itself is role-agnostic; the
// resolver's @Roles guard is the actual enforcement point.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OrganizationInput {
  name: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  address?: string;
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  list() {
    return this.prisma.organization.findMany({ orderBy: { name: 'asc' } });
  }

  /** Create — createdAt is left for the schema default to populate;
   *  updatedAt is left unset (stays NULL until the first edit). */
  async create(input: OrganizationInput) {
    return this.prisma.organization.create({
      data: {
        name: input.name,
        description: input.description,
        websiteUrl: input.websiteUrl,
        contactEmail: input.contactEmail,
        address: input.address,
      },
    });
  }

  /** Edit — stamps updatedAt on every call. createdAt is never part of this
   *  payload, so it can't be touched by an edit no matter what the caller
   *  sends. */
  async update(id: string, input: Partial<OrganizationInput>) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });
  }
}
