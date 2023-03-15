import { IsDateString, IsOptional } from 'class-validator';

import { SupportedEVMTokenSymbols } from '../AppConfig';
import { Iso8601DateOnlyString } from '../utils/StatsUtils';

export class StatsQueryDto {
  @IsOptional()
  @IsDateString()
  date?: Iso8601DateOnlyString;
}

export interface StatsModel {
  totalTransactions: number;
  confirmedTransactions: number;
  amountBridged: {
    [token in SupportedEVMTokenSymbols]?: string;
  };
}

export class StatsDto {
  readonly totalTransactions: number;

  readonly confirmedTransactions: number;

  readonly amountBridged: {
    [token in SupportedEVMTokenSymbols]?: string;
  };

  constructor(statsModel: StatsModel) {
    this.totalTransactions = statsModel.totalTransactions;
    this.confirmedTransactions = statsModel.confirmedTransactions;
    this.amountBridged = statsModel.amountBridged;
  }
}
