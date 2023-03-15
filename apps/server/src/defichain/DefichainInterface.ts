import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: BridgedEvmToDfc;
}
export type BridgedEvmToDfc = Record<SupportedDFCTokenSymbols, string>;
