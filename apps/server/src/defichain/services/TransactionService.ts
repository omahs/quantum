import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenSymbol } from '@prisma/client';
import { EnvironmentNetwork } from '@waveshq/walletkit-core';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/PrismaService';
import { formatDate } from 'src/utils/DateUtils';

import { SaveTransactionObject } from '../model/SaveTransactionDto';

@Injectable()
export class TransactionService {
  private network: EnvironmentNetwork;

  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.network = configService.getOrThrow<EnvironmentNetwork>(`defichain.network`);
  }

  async save(data: SaveTransactionObject): Promise<{ success: boolean }> {
    await this.prisma.deFiChainTransactions.create({ data: { ...data, status: 'PENDING' } });
    return { success: true };
  }

  async dailyLimit(symbol: TokenSymbol): Promise<DailyLimit> {
    // Get DFC limits
    const tokenLimit = await this.getDfcDailyLimit(symbol);
    if (!tokenLimit) {
      throw new BadRequestException(`No daily limit configured for ${symbol}`);
    }

    const currentDay = new Date();
    const nextDay = new Date();
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const sentToken = await this.prisma.deFiChainTransactions.groupBy({
      by: ['symbol'],
      where: {
        symbol,
        createdAt: {
          gte: formatDate(currentDay),
          lt: formatDate(nextDay),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // eslint-disable-next-line no-underscore-dangle
    const dailyUsage = sentToken[0]?._sum?.amount?.toString() ?? '0';

    return {
      dailyLimit: tokenLimit,
      remainingDailyLimit: new BigNumber(tokenLimit).minus(dailyUsage).toString(),
      currentDailyUsage: dailyUsage,
    };
  }

  async getDfcDailyLimit(symbol: TokenSymbol): Promise<string | undefined> {
    const url = 'https://wallet.defichain.com/api/v0/bridge/limits';
    const { data } = await this.httpService.axiosRef.get(url);

    const dailyLimits: Token[] = data[this.network];
    const tokenLimit = dailyLimits.find((token) => token.symbol === symbol);

    return tokenLimit?.daily;
  }
}

export interface DailyLimit {
  dailyLimit: string;
  remainingDailyLimit: string;
  currentDailyUsage: string;
}

export interface Token {
  id: string;
  symbol: TokenSymbol;
  daily: string;
  max: string;
}
