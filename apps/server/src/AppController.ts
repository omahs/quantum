import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BigNumber, Event } from 'ethers';

import { AppService } from './AppService';

interface SignClaim {
  receiverAddress: string;
  tokenAddress: string;
  amount: string;
}

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('blockheight')
  async getBlockHeight(): Promise<number> {
    return this.appService.getBlockHeight();
  }

  @Get('balance')
  async getBalance(@Query('address') address: string): Promise<BigNumber> {
    return this.appService.getBalance(address);
  }

  @Get('getAllEventsFromBlockNumber')
  async getAllEventsFromBlockNumber(@Query('blockNumber') blockNumber: number): Promise<Event[]> {
    return this.appService.getAllEventsFromBlockNumber(Number(blockNumber));
  }

  @Post('sign-claim')
  async signClaim(@Body() data: SignClaim): Promise<{ signature: string; nonce: number }> {
    return this.appService.signClaim(data.receiverAddress, data.tokenAddress, data.amount);
  }
}
