import { SupportedEVMTokenSymbols } from 'src/AppConfig';
import { Iso8601DateOnlyString, Iso8601String } from 'src/types';

export interface StatsModel {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: {
    [token in SupportedEVMTokenSymbols]?: string;
  };
  date: Iso8601DateOnlyString;
  cacheTime: Iso8601String;
}
