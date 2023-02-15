import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PrismaService } from '../PrismaService';
import { StatsController } from './controllers/StatsController';
import { TransactionController } from './controllers/TransactionController';
import { WhaleWalletController } from './controllers/WhaleWalletController';
import { WhaleApiClientProvider } from './providers/WhaleApiClientProvider';
import { WhaleWalletProvider } from './providers/WhaleWalletProvider';
import { DeFiChainTransactionService } from './services/DeFiChainTransactionService';
import { SendService } from './services/SendService';
import { TransactionService } from './services/TransactionService';
import { WhaleApiService } from './services/WhaleApiService';
import { WhaleWalletService } from './services/WhaleWalletService';

@Module({
  providers: [
    WhaleApiClientProvider,
    WhaleApiService,
    WhaleWalletProvider,
    WhaleWalletService,
    DeFiChainTransactionService,
    PrismaService,
    SendService,
    TransactionService,
  ],
  controllers: [StatsController, TransactionController, WhaleWalletController],
  imports: [HttpModule],
  exports: [],
})
export class DeFiChainModule {}
