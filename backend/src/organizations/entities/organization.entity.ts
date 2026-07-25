import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Organization {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
