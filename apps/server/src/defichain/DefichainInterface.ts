import { IsDateString, IsOptional } from 'class-validator';
import { SupportedDFCTokenSymbols } from 'src/AppConfig';

import { Iso8601DateOnlyString } from '../utils/StatsUtils';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: BridgedDfcToEvm;
}
export type BridgedDfcToEvm = Record<SupportedDFCTokenSymbols, string>;

export class DFCStatsDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}
