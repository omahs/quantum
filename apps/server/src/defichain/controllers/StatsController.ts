// import { stats } from '@defichain/whale-api-client';
import { CacheInterceptor, CacheTTL, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { EnvironmentNetwork } from '@waveshq/walletkit-core';

import { DeFiChainStats } from '../DefichainInterface';
import { DeFiChainStatsService } from '../services/DeFiChainStatsService';

@UseInterceptors(CacheInterceptor)
@Controller()
export class StatsController {
  private network: EnvironmentNetwork;

  constructor(private readonly configService: ConfigService, private defichainStatsService: DeFiChainStatsService) {
    this.network = configService.getOrThrow<EnvironmentNetwork>(`defichain.network`);
  }

  @SkipThrottle()
  @CacheTTL(3600_000 * 24) // 1 day
  @Get('/stats')
  async get(@Query('date') date?: string): Promise<DeFiChainStats> {
    return this.defichainStatsService.getDefiChainStats(date);
  }
}
