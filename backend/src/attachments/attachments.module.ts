import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsResolver } from './attachments.resolver';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [AttachmentsService, AttachmentsResolver],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
