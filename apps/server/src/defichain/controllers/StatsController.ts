// import { stats } from '@defichain/whale-api-client';
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { EnvironmentNetwork } from '@waveshq/walletkit-core';

import { DeFiChainStats } from '../DefichainInterface';
import { DeFiChainStatsService } from '../services/DeFiChainStatsService';

@Controller()
export class StatsController {
  private network: EnvironmentNetwork;

  constructor(private readonly configService: ConfigService, private defichainStatsService: DeFiChainStatsService) {
    this.network = configService.getOrThrow<EnvironmentNetwork>(`defichain.network`);
  }

  @SkipThrottle()
  @Get('/stats')
  async get(@Query('date') date?: string): Promise<DeFiChainStats> {
    return this.defichainStatsService.getDefiChainStats(date);
  }
}
