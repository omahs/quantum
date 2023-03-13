import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
// import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/PrismaService';

import { SupportedDFCTokenSymbols } from '../../AppConfig';

@Injectable()
export class DeFiChainStatsService {
  constructor(private prisma: PrismaService) {}

  async getDefiChainStats(date?: string | undefined) {
    const today = date ? new Date(date) : new Date();
    today.setUTCHours(0, 0, 0, 0); // set to UTC +0
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const confirmedTransactions = await this.prisma.deFiChainAddressIndex.findMany({
      where: {
        claimSignature: { not: null },
        address: { not: undefined },
        createdAt: {
          // new Date() creates date with current time and day and etc.
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
    });

    const totalTransactions = await this.prisma.deFiChainAddressIndex.count({
      where: {
        createdAt: {
          // new Date() creates date with current time and day and etc.
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
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
    const amountBridged = {
      USDC: numericalPlaceholder,
      USDT: numericalPlaceholder,
      BTC: numericalPlaceholder,
      ETH: numericalPlaceholder,
      DFI: numericalPlaceholder,
      EUROC: numericalPlaceholder,
    };

    for (const key in amountBridgedBigN) {
      if (Object.prototype.isPrototypeOf.call(amountBridgedBigN, key)) {
        amountBridged[key as SupportedDFCTokenSymbols] = amountBridgedBigN[key as SupportedDFCTokenSymbols].toString();
      }
    }

    return {
      totalTransactions,
      confirmedTransactions: confirmedTransactions.length,
      amountBridged,
      date: today,
    };
  }
}
