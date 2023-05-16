import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { Options, RedisStrategy } from './redis.strategy';
import { RedisService } from './redis.service';

export interface RedisModuleOptions extends ModuleMetadata {
  useFactory?: (...args: any[]) => Promise<Options> | Options;
  inject?: any[];
}

@Module({
  providers: [RedisService],
})
export class RedisModule {
  static async forRootAsync(options: RedisModuleOptions): Promise<DynamicModule> {
    const providers: any[] = [RedisStrategy];
    const imports: any[] = [];
    const exports: any[] = [RedisService, RedisStrategy];

    if (options?.inject && options?.useFactory) {
      const { inject, useFactory } = options;
      const provide = 'OPTIONS';
      providers.push({ provide, useFactory, inject });
      exports.push({ provide, useFactory, inject })
    }

    if (options?.imports) {
      imports.push(...options?.imports);
    }

    const module = RedisModule;
    return { providers, imports, exports, module }
  }
}
