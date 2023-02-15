import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TokenSymbol } from '@prisma/client';
import { TokenSymbolValidationPipe } from 'src/pipes/TokenSymbolValidation.pipe';

import { SaveTransactionDto } from '../model/SaveTransactionDto';
import { DailyLimit, TransactionService } from '../services/TransactionService';

@Controller('/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/save')
  async post(@Body() data: SaveTransactionDto): Promise<{ success: boolean }> {
    return this.transactionService.save(data);
  }

  @Get('/daily-limit')
  async get(@Query('symbol', new TokenSymbolValidationPipe()) symbol: TokenSymbol): Promise<DailyLimit> {
    return this.transactionService.dailyLimit(symbol);
  }
}
