import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Period } from './period.entity';

@ObjectType()
export class Collection {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  organizationId: string;

  @Field()
  collectionName: string;

  @Field()
  type: string; // 'public' | 'private'

  @Field()
  createdByName: string;

  @Field({ nullable: true })
  updatedByName?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // Period.collectionId is the source of truth (Section 2.4) — this just
  // surfaces whichever Period(s) currently point back at this Collection,
  // populated by CollectionsService.findById()'s `include: { periods: true }`.
  @Field(() => [Period], { nullable: true })
  periods?: Period[];
}
