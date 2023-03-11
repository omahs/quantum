import { SupportedEVMTokenSymbols } from 'src/AppConfig';
import { Iso8601String } from 'src/types';

export interface StatsModel {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: {
    [token in SupportedEVMTokenSymbols]?: string;
  };
  date: Iso8601String;
}
