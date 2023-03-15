import { IsDateString, IsOptional } from 'class-validator';
import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: BridgedEvmToDfc;
}
export type BridgedEvmToDfc = Record<SupportedDFCTokenSymbols, string>;

export type Iso8601DateOnlyString = `${number}-${number}-${number}`;

export class StatsDto {
  @IsDateString()
  @IsOptional()
  date?: Iso8601DateOnlyString;
}
