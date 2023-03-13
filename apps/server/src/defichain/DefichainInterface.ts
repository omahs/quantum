import { SupportedDFCTokenSymbols } from 'src/AppConfig';

export interface StatsModel {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: {
    [token in SupportedDFCTokenSymbols]?: number;
  };
}
