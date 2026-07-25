import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class OrganizationInputDto {
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
}
