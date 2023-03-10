import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SemaphoreCache } from 'src/libs/caches/SemaphoreCache';
import { Iso8601String } from 'src/types';

import { SupportedEVMTokenSymbols } from '../../AppConfig';
import { EthereumTransactionValidationPipe } from '../../pipes/EthereumTransactionValidation.pipe';
import { StatsModel } from '../EthereumInterface';
import { EVMTransactionConfirmerService, HandledEVMTransaction } from '../services/EVMTransactionConfirmerService';

@Controller()
export class EthereumController {
  constructor(
    private readonly evmTransactionConfirmerService: EVMTransactionConfirmerService,
    protected readonly cache: SemaphoreCache,
  ) {}

  @Get('balance/:tokenSymbol')
  async getBalance(@Param('tokenSymbol') tokenSymbol: SupportedEVMTokenSymbols): Promise<string> {
    return this.evmTransactionConfirmerService.getBalance(tokenSymbol);
  }

  @Get('stats')
  async getStats(@Param('date') date?: Iso8601String): Promise<StatsModel> {
    return (await this.cache.get(`ETH_STATS_${date}`, async () => this.evmTransactionConfirmerService.getStats(date), {
      ttl: 3600_000 * 24, // 1 day
    })) as StatsModel;
  }

  @Post('handleTransaction')
  @Throttle(35, 60)
  async handleTransaction(
    @Body('transactionHash', new EthereumTransactionValidationPipe()) transactionHash: string,
  ): Promise<HandledEVMTransaction> {
    return this.evmTransactionConfirmerService.handleTransaction(transactionHash);
  }

  @Post('allocateDFCFund')
  @UseGuards(ThrottlerGuard)
  async allocateDFCFund(
    @Body('transactionHash', new EthereumTransactionValidationPipe()) transactionHash: string,
  ): Promise<any> {
    return this.evmTransactionConfirmerService.allocateDFCFund(transactionHash);
  }
}
