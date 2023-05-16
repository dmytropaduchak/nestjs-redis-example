import { Query, Resolver } from '@nestjs/graphql';
import { VersionService } from './version.service';

@Resolver()
export class VersionResolver {
  constructor(private versionService: VersionService) {}

  @Query(() => String)
  async version(): Promise<string> {
    return this.versionService.version();
  }
}
