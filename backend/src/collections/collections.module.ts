import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsResolver } from './collections.resolver';

@Module({
  providers: [CollectionsService, CollectionsResolver],
  exports: [CollectionsService],
})
export class CollectionsModule {}
