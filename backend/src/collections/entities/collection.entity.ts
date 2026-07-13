import { ObjectType, Field, ID } from '@nestjs/graphql';

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
}
