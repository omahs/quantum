import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StartedHardhatNetworkContainer } from 'smartcontracts';

import { AppConfig } from '../src/AppConfig';
import { AppModule } from '../src/AppModule';
import { ConfirmerQueueConfig } from '../src/queue/Config';
import { StartedRedisContainer } from './RedisContainer';

@Module({})
export class TestingExampleModule {
  static register(config: AppConfig): DynamicModule {
    return {
      module: TestingExampleModule,
      imports: [AppModule, ConfigModule.forFeature(() => config)],
    };
  }
}

export function buildTestConfig(
  startedHardhatContainer: StartedHardhatNetworkContainer,
  startedRedisContainer: StartedRedisContainer,
): AppConfig & ConfirmerQueueConfig {
  return {
    blockchain: {
      ethereumRpcUrl: startedHardhatContainer.rpcUrl,
    },
    redis: {
      host: startedRedisContainer.getHost(),
      port: startedRedisContainer.getPort(),
    },
    // TODO: better configs for tests - if not they will retry for 20 minutes
    queues: {
      ethereum: {
        queueName: 'EthereumTransactionConfirmer',
        jobName: 'ethereumConfirmTransactionJob',
        backOffStrategy: 'fixed',
        numWorkers: 3,
        concurrency: 3,
        attempts: 10, // maximum of 20 minutes to reach necessary confirmations
        delay: 120000, // 2 minutes
      },
      defichain: {
        queueName: 'DeFiChainTransactionConfirmer',
        jobName: 'dfcConfirmTransactionJob',
        backOffStrategy: 'fixed',
        numWorkers: 3,
        concurrency: 3,
        attempts: 10, // maximum of 20 minutes to reach necessary confirmations
        delay: 120000, // 2 minutes
      },
    },
  };
}
