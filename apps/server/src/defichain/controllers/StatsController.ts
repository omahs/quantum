// import { stats } from '@defichain/whale-api-client';
import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SemaphoreCache } from 'src/libs/caches/SemaphoreCache';

import { DeFiChainStats } from '../DefichainInterface';
import { DeFiChainStatsService } from '../services/DeFiChainStatsService';

@Controller()
export class StatsController {
  constructor(protected readonly cache: SemaphoreCache, private defichainStatsService: DeFiChainStatsService) {}

  @SkipThrottle()
  @Get('/stats')
  async get(@Query('date') date?: string): Promise<DeFiChainStats> {
    return (await this.cache.get(
      `DFC_STATS_${date ?? 'TODAY'}`,
      async () => {
        try {
          return await this.defichainStatsService.getDefiChainStats(date);
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
    )) as DeFiChainStats;
  }
}
