import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PeriodInputDto {
  @Field()
  name: string;

  @Field(() => Int)
  startYear: number;

  @Field(() => Int)
  endYear: number;
}
