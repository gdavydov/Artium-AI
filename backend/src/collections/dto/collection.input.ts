import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CollectionInputDto {
  @Field(() => ID)
  organizationId: string;

  @Field()
  collectionName: string;

  @Field()
  type: string; // 'public' | 'private'
}

@InputType()
export class CollectionUpdateInputDto {
  @Field({ nullable: true })
  collectionName?: string;

  @Field({ nullable: true })
  type?: string;
}
