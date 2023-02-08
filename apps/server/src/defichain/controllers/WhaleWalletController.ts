import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CustomErrorCodes } from 'src/CustomErrorCodes';

import { NetworkDto } from '../model/NetworkDto';
import { VerifyDto } from '../model/VerifyDto';
import { WhaleWalletService } from '../services/WhaleWalletService';

@Controller('/wallet')
export class WhaleWalletController {
  constructor(private readonly whaleWalletService: WhaleWalletService) {}

  @Throttle(5, 60)
  @Get('generate-address')
  async get(@Query() query: NetworkDto): Promise<{ address: string }> {
    return this.whaleWalletService.generateAddress(query.network);
  }

  @Throttle(5, 60)
  @Post('verify')
  async verify(
    @Body() body: VerifyDto,
    @Query() query: NetworkDto,
  ): Promise<{ isValid: boolean; statusCode?: CustomErrorCodes }> {
    return this.whaleWalletService.verify(body, query.network);
  }
}
