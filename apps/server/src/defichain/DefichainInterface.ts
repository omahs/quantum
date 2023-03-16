import { IsDateString, IsOptional } from 'class-validator';

import { SupportedDFCTokenSymbols } from '../AppConfig';
import { Iso8601DateOnlyString } from '../utils/StatsUtils';

export class DeFiChainStats {
  readonly totalTransactions: number;

  readonly confirmedTransactions: number;

  readonly amountBridged: BridgedDfcToEvm;

  constructor(totalTransactions: number, confirmedTransactions: number, amountBridged: BridgedDfcToEvm) {
    this.totalTransactions = totalTransactions;
    this.confirmedTransactions = confirmedTransactions;
    this.amountBridged = {
      USDC: amountBridged[SupportedDFCTokenSymbols.USDC]?.toString(),
      USDT: amountBridged[SupportedDFCTokenSymbols.USDT]?.toString(),
      BTC: amountBridged[SupportedDFCTokenSymbols.BTC]?.toString(),
      ETH: amountBridged[SupportedDFCTokenSymbols.ETH]?.toString(),
      DFI: amountBridged[SupportedDFCTokenSymbols.DFI]?.toString(),
      EUROC: amountBridged[SupportedDFCTokenSymbols.EUROC]?.toString(),
    };
  }
}

export type BridgedDfcToEvm = Record<SupportedDFCTokenSymbols, string>;

export class DFCStatsDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}
