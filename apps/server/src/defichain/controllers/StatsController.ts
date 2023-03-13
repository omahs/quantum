// import { stats } from '@defichain/whale-api-client';
import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { EnvironmentNetwork } from '@waveshq/walletkit-core';

// import { StatsModel } from '../DefichainInterface';
import { DeFiChainStatsService } from '../services/DeFiChainStatsService';
import { WhaleApiService } from '../services/WhaleApiService';

@Controller()
export class StatsController {
  private network: EnvironmentNetwork;

  constructor(
    private readonly whaleClient: WhaleApiService,
    private readonly configService: ConfigService,
    private defichainStatsService: DeFiChainStatsService,
  ) {
    this.network = configService.getOrThrow<EnvironmentNetwork>(`defichain.network`);
  }

  @SkipThrottle()
  @Get('/stats')
  async get(@Param('date') date?: string) {
    // return this.whaleClient.getClient().stats.get();
    return this.defichainStatsService.getDefiChainStats(date);
  }

  @Get('/test')
  async getTest() {
    return this.defichainStatsService.test();
  }
}
