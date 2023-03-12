import { Erc20Token } from 'src/types';

export interface StatsModel {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: {
    [token in Erc20Token]?: number;
  };
}
