import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Attachment {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  artifactId: string;

  @Field(() => ID)
  uploadedBy: string;

  @Field()
  fileUrl: string; // object storage key, not raw bytes

  @Field()
  fileType: string; // MIME type
}

@ObjectType()
export class UploadTicket {
  @Field(() => ID)
  attachmentId: string;

  @Field()
  uploadUrl: string;

  @Field()
  key: string;
}
