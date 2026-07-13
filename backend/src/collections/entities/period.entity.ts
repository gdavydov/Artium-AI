import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Period {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  startYear: number;

  @Field(() => Int)
  endYear: number;

  @Field(() => ID, { nullable: true })
  collectionId?: string;
}
