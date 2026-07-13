import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CollectionsModule } from './collections/collections.module';
import { ArtistsModule } from './artists/artists.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    PrismaModule,
    OrganizationsModule,
    CollectionsModule,
    ArtistsModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
