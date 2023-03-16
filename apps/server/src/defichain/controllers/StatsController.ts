import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';

import { SemaphoreCache } from '../../libs/caches/SemaphoreCache';
import { DeFiChainStats, DFCStatsDto } from '../DefichainInterface';
import { DeFiChainStatsService } from '../services/DeFiChainStatsService';

@Controller()
export class StatsController {
  constructor(protected readonly cache: SemaphoreCache, private defichainStatsService: DeFiChainStatsService) {}

  @Get('/stats')
  async get(@Query('date') date?: DFCStatsDto): Promise<DeFiChainStats | undefined> {
    return this.cache.get(
      `DFC_STATS_${date ?? 'TODAY'}`,
      async () => {
        try {
          const { totalTransactions, confirmedTransactions, amountBridged } =
            await this.defichainStatsService.getDefiChainStats(date);
          return new DeFiChainStats(totalTransactions, confirmedTransactions, amountBridged);
        } catch (e: any) {
          throw new HttpException(
            {
              status: e.code || HttpStatus.INTERNAL_SERVER_ERROR,
              error: `API call for DefiChain statistics was unsuccessful: ${e.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              cause: e,
            },
          );
        }
      },
      {
        ttl: 3600_000 * 24, // 1 day
      },
    );
  }
}
