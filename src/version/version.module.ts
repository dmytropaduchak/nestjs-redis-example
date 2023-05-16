import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionResolver } from './version.resolver';

@Module({
  imports: [],
  controllers: [],
  providers: [
    VersionService,
    VersionResolver,
  ],
})
export class VersionModule {}
