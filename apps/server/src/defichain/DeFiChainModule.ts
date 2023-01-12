import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MultiQueueModule } from '../queue';
import { DeFiChainTransactionConfirmerQueue } from '../queue/DeFiChainTransactionConfirmerQueue';
import { StatsController } from './controllers/StatsController';
import { TransactionConfirmerController } from './controllers/TransactionConfirmerController';
import { WhaleApiClientProvider } from './providers/WhaleApiClientProvider';
import { WhaleApiService } from './services/WhaleApiService';

@Module({
  providers: [WhaleApiClientProvider, WhaleApiService, DeFiChainTransactionConfirmerQueue],
  controllers: [StatsController, TransactionConfirmerController],
  imports: [
    MultiQueueModule.forRootAsync({
      useFactory: async (cfg: ConfigService) => ({
        redis: {
          host: cfg.getOrThrow('redis.host'),
          port: cfg.getOrThrow('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [],
})
export class DeFiChainModule {}
