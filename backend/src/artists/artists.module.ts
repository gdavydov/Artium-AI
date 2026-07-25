import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { ArtistsResolver } from './artists.resolver';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [AttachmentsModule],
  controllers: [ArtistsController],
  providers: [ArtistsService, ArtistsResolver],
  exports: [ArtistsService],
})
export class ArtistsModule {}
