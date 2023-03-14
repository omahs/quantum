import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface DeFiChainStats {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridgedToDfc: BridgedEvmToDfc;
}
export type BridgedEvmToDfc = Record<SupportedDFCTokenSymbols, string>;
