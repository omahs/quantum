import { IsString } from 'class-validator';

export class VerifyDto {
  @IsString()
  amount: string;

  @IsString()
  address: string;

  @IsString()
  symbol: string;

  constructor(address: string, amount: string, symbol: string) {
    this.address = address;
    this.amount = amount;
    this.symbol = symbol;
  }
}
