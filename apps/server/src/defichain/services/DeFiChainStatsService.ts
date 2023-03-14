import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/PrismaService';

import { SupportedDFCTokenSymbols } from '../../AppConfig';
import { BridgedEvmToDfc, DeFiChainStats } from '../DefichainInterface';

@Injectable()
export class DeFiChainStatsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache, private prisma: PrismaService) {}

  async getDefiChainStats(date?: string | undefined): Promise<DeFiChainStats> {
    const dateOnly = date ?? new Date().toISOString().substring(0, 10);
    const today = new Date(dateOnly);
    today.setUTCHours(0, 0, 0, 0); // set to UTC +0
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const confirmedTransactions = await this.prisma.deFiChainAddressIndex.findMany({
      where: {
        claimSignature: { not: null },
        address: { not: undefined },
        createdAt: {
          // new Date() creates date with current time and day and etc.
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalTransactions = await this.prisma.deFiChainAddressIndex.count({
      where: {
        createdAt: {
          //   new Date() creates date with current time and day and etc.
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const amountBridgedBigN = {
      USDC: BigNumber(0),
      USDT: BigNumber(0),
      BTC: BigNumber(0),
      ETH: BigNumber(0),
      DFI: BigNumber(0),
      EUROC: BigNumber(0),
    };
    for (const transaction of confirmedTransactions) {
      const { tokenSymbol, claimAmount } = transaction;
      if (tokenSymbol && claimAmount !== null) {
        amountBridgedBigN[tokenSymbol as SupportedDFCTokenSymbols] = amountBridgedBigN[
          tokenSymbol as SupportedDFCTokenSymbols
        ].plus(BigNumber(claimAmount as string));
      }
    }
    const numericalPlaceholder = '0.000000';
    const amountBridgedToDfc: BridgedEvmToDfc = {
      USDC: numericalPlaceholder,
      USDT: numericalPlaceholder,
      BTC: numericalPlaceholder,
      ETH: numericalPlaceholder,
      DFI: numericalPlaceholder,
      EUROC: numericalPlaceholder,
    };

    for (const key in amountBridgedBigN) {
      if ({}.hasOwnProperty.call(amountBridgedBigN, key)) {
        amountBridgedToDfc[key as SupportedDFCTokenSymbols] = amountBridgedBigN[key as SupportedDFCTokenSymbols]
          .decimalPlaces(6, BigNumber.ROUND_FLOOR)
          .toString();
      }
    }

    return {
      totalTransactions,
      confirmedTransactions: confirmedTransactions.length,
      amountBridgedToDfc,
    };
  }
}
