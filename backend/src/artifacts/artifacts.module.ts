import { Module } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';
import { ArtifactsResolver } from './artifacts.resolver';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [AttachmentsModule],
  providers: [ArtifactsService, ArtifactsResolver],
  exports: [ArtifactsService],
})
export class ArtifactsModule {}
