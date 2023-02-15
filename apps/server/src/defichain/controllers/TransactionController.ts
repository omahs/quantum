import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TokenSymbol } from '@prisma/client';

import { TokenSymbolValidationPipe } from '../../pipes/TokenSymbolValidation.pipe';
import { SaveTransactionDto } from '../model/SaveTransactionDto';
import { DailyLimit, TransactionService } from '../services/TransactionService';

@Controller('/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/save')
  @UsePipes(new ValidationPipe({ transform: true }))
  async post(@Body() data: SaveTransactionDto): Promise<{ success: boolean }> {
    return this.transactionService.save(data.toObj());
  }

  @Get('/daily-limit')
  async get(@Query('symbol', new TokenSymbolValidationPipe()) symbol: TokenSymbol): Promise<DailyLimit> {
    return this.transactionService.dailyLimit(symbol);
  }
}
