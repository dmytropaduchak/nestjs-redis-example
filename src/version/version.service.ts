import { Injectable } from '@nestjs/common';

@Injectable()
export class VersionService {
  async version(): Promise<string> {
    const { version } = require('../../package.json');
    return version;
  }
}
