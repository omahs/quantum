import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { appConfig, ENV_VALIDATION_SCHEMA } from './AppConfig';
import { DeFiChainModule } from './defichain/DeFiChainModule';
import { EthereumModule } from './ethereum/EthereumModule';
import { EthersModule } from './modules/EthersModule';
import { PrismaService } from './PrismaService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: ENV_VALIDATION_SCHEMA,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    EthersModule,
    DeFiChainModule,
    EthereumModule,
    RouterModule.register([
      {
        path: 'defichain',
        module: DeFiChainModule,
      },
      {
        path: 'ethereum',
        module: EthereumModule,
      },
    ]),
  ],
  controllers: [],
  providers: [
    DeFiChainModule,
    PrismaService,
    EthereumModule,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
