import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

import { MultiQueueManager, REDIS_CLIENT, REDIS_OPTIONS } from './MultiQueueManager';

const MULTI_QUEUE_MODULE_OPTIONS = 'MULTI_QUEUE_MODULE_OPTIONS';

/**
 * Uses Bull - a persistent queue library that uses redis under the hood.
 * The underlying redis instance should use AOF persistence for full durability
 * so that enqueued transactions never get dropped.
 * Read more at https://redis.io/docs/manual/persistence/.
 */
@Module({})
export class MultiQueueModule {
  static forRootAsync(options: MultiQueueModuleAsyncOptions): DynamicModule {
    return {
      module: MultiQueueModule,
      imports: [ConfigModule],
      providers: [
        MultiQueueManager,
        {
          provide: REDIS_CLIENT,
          useFactory: (opts: MultiQueueModuleOptions) => new Redis(opts.redis),
          inject: [MULTI_QUEUE_MODULE_OPTIONS],
        },
        {
          provide: REDIS_OPTIONS,
          useFactory: (opts: MultiQueueModuleOptions) => opts.redis,
          inject: [MULTI_QUEUE_MODULE_OPTIONS],
        },
        {
          provide: MULTI_QUEUE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        ...(options.providers ?? []),
      ],
      exports: [MultiQueueManager],
    };
  }
}

export type MultiQueueModuleOptions = {
  redis: RedisOptions;
};

export interface MultiQueueModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => Promise<MultiQueueModuleOptions>;
  inject?: any[];
}
