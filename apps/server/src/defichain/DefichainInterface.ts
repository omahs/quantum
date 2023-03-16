import { IsDateString, IsOptional } from 'class-validator';
import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: BridgedDfcToEvm;
}
export type BridgedDfcToEvm = Record<SupportedDFCTokenSymbols, string>;

export type Iso8601DateOnlyString = `${number}-${number}-${number}`;

export class DFCStatsDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}
