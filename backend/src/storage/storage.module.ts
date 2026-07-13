import { Global, Module } from '@nestjs/common';
import { StorageProvider } from './storage.provider';

@Global()
@Module({
  providers: [StorageProvider],
  exports: [StorageProvider],
})
export class StorageModule {}
