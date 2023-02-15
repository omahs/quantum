import { TokenSymbol } from '@prisma/client';
import { IsEnum, IsNumberString, IsString } from 'class-validator';

export class SaveTransactionDto {
  @IsEnum(TokenSymbol)
  symbol: TokenSymbol;

  @IsNumberString()
  amount: string;

  @IsString()
  to: string;

  @IsString()
  from: string;

  // TODO: Validate Ethereum transaction hash
  @IsString()
  transactionHash: string;

  constructor(symbol: TokenSymbol, amount: string, to: string, from: string, transactionHash: string) {
    this.symbol = symbol;
    this.amount = amount;
    this.to = to;
    this.from = from;
    this.transactionHash = transactionHash;
  }
}
