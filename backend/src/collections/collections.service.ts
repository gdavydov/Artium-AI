// src/collections/collections.service.ts
//
// Same audit-timestamp discipline as organizations.service.ts: createdAt is
// left to the Prisma/DB default and never touched again; updatedAt stays
// NULL until the first edit, then is stamped on every subsequent update.
// created_by_name/updated_by_name follow the same rule but as text, not
// timestamps — captured from the *authenticated caller's* display name at
// the time of the action (Design Document Section 2.4), never accepted as
// client input. create() only ever sets createdByName; update() only ever
// sets updatedByName + updatedAt.
//
// Access control: Admin and Curator can always create/edit a Collection.
// A Curator or Contributor can also edit one they don't own outright if
// they hold a `manage` CollectionAccess grant on it (Section 2.4.2/3.2) —
// see canManageCollection() below; collections.resolver.ts's guard is the
// real enforcement point, this is just the query it relies on.
//
// Period tagging: Collection has no period_id column — Period carries an
// optional collection_id instead (Section 2.4). "Assigning a Period to a
// Collection" is therefore a Period update, and "adding a new Period" is a
// Period insert with collection_id pre-set — see setPeriod()/createPeriod().

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CollectionInput {
  organizationId: string;
  collectionName: string;
  type: 'public' | 'private';
}

export interface PeriodInput {
  name: string;
  startYear: number;
  endYear: number;
}

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.collection.findUnique({
      where: { id },
      include: { periods: true },
    });
  }

  /** True if the given user may edit this Collection: Admin/Curator always,
   *  or anyone (including a Contributor) holding a `manage` grant on it. */
  async canManageCollection(userId: string, userRole: string, collectionId: string): Promise<boolean> {
    if (userRole === 'admin' || userRole === 'curator') return true;

    const grant = await this.prisma.collectionAccess.findUnique({
      where: { collectionId_userId: { collectionId, userId } },
    });
    return grant?.accessLevel === 'manage';
  }

  /** Create — createdByName is captured from the caller, createdAt is left
   *  for the schema default; updatedByName/updatedAt stay unset. */
  async create(input: CollectionInput, createdByName: string) {
    return this.prisma.collection.create({
      data: {
        organizationId: input.organizationId,
        collectionName: input.collectionName,
        type: input.type,
        createdByName,
      },
    });
  }

  /** Edit — stamps updatedByName + updatedAt on every call. createdByName
   *  and createdAt are never part of this payload. */
  async update(id: string, input: Partial<Pick<CollectionInput, 'collectionName' | 'type'>>, updatedByName: string) {
    const existing = await this.prisma.collection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Collection not found');

    return this.prisma.collection.update({
      where: { id },
      data: {
        ...input,
        updatedByName,
        updatedAt: new Date(),
      },
    });
  }

  /** Tags an existing Period to this Collection (or clears the tag if
   *  periodId is null) by setting Period.collectionId — Collection itself
   *  is not modified. */
  async setPeriod(collectionId: string, periodId: string | null) {
    if (periodId) {
      return this.prisma.period.update({
        where: { id: periodId },
        data: { collectionId },
      });
    }
    // Clear whichever Period(s) currently point at this Collection.
    return this.prisma.period.updateMany({
      where: { collectionId },
      data: { collectionId: null },
    });
  }

  /** Creates a brand-new Period, tagged to this Collection immediately —
   *  this is the "+ Add new period" path from CollectionForm.tsx. */
  async createPeriod(collectionId: string, input: PeriodInput) {
    return this.prisma.period.create({
      data: {
        name: input.name,
        startYear: input.startYear,
        endYear: input.endYear,
        collectionId,
      },
    });
  }
}
