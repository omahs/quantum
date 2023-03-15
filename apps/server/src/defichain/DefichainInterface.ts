import { IsDateString, IsOptional } from 'class-validator';
import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: BridgedEvmToDfc;
}
export type BridgedEvmToDfc = Record<SupportedDFCTokenSymbols, string>;

export type Iso8601DateOnlyString = `${number}-${number}-${number}`;

export class StatsQueryDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}

export class StatsDto {
  readonly totalTransactions: number;

  readonly confirmedTransactions: number;

  readonly amountBridged: BridgedEvmToDfc;

  constructor(statsModel: DeFiChainStats) {
    this.totalTransactions = statsModel.totalTransactions;
    this.confirmedTransactions = statsModel.confirmedTransactions;
    this.amountBridged = statsModel.amountBridged;
  }
}
