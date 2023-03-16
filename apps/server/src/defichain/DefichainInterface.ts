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
      USDC: amountBridged[SupportedDFCTokenSymbols.USDC]?.toString() || '0.000000',
      USDT: amountBridged[SupportedDFCTokenSymbols.USDT]?.toString() || '0.000000',
      BTC: amountBridged[SupportedDFCTokenSymbols.BTC]?.toString() || '0.000000',
      ETH: amountBridged[SupportedDFCTokenSymbols.ETH]?.toString() || '0.000000',
      DFI: amountBridged[SupportedDFCTokenSymbols.DFI]?.toString() || '0.000000',
      EUROC: amountBridged[SupportedDFCTokenSymbols.EUROC]?.toString() || '0.000000',
    };
  }
}

export type BridgedDfcToEvm = Record<SupportedDFCTokenSymbols, string>;

export class DFCStatsDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}
