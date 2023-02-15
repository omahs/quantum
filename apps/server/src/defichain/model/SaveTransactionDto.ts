import { TokenSymbol } from '@prisma/client';
import { IsEnum, IsNumberString, IsString } from 'class-validator';

export class SaveTransactionDto {
  @IsString()
  transactionId: string;

  @IsNumberString()
  amount: string;

  @IsEnum(TokenSymbol)
  symbol: TokenSymbol;

  @IsString()
  to: string;

  @IsString()
  from: string;

  constructor(transactionId: string, amount: string, symbol: TokenSymbol, to: string, from: string) {
    this.transactionId = transactionId;
    this.amount = amount;
    this.symbol = symbol;
    this.to = to;
    this.from = from;
  }
}
