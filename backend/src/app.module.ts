import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CollectionsModule } from './collections/collections.module';
import { ArtistsModule } from './artists/artists.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Guards read the Authorization header off req — see JwtAuthGuard.getRequest()
      context: ({ req }: { req: unknown }) => ({ req }),
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    CollectionsModule,
    ArtistsModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
