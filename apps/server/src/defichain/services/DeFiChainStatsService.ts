import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/PrismaService';

import { SupportedDFCTokenSymbols } from '../../AppConfig';
import { BridgedEvmToDfc, DeFiChainStats } from '../DefichainInterface';
import { StatsDto } from '../model/StatsDto';

@Injectable()
export class DeFiChainStatsService {
  constructor(private prisma: PrismaService) {}

  async getDefiChainStats(date?: StatsDto): Promise<DeFiChainStats> {
    const dateOnly = date ?? new Date();
    const today = new Date(dateOnly.toString());
    today.setUTCHours(0, 0, 0, 0); // set to UTC +0
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [totalTransactions, confirmedTransactions] = await Promise.all([
      this.prisma.deFiChainAddressIndex.count({
        where: {
          createdAt: {
            //   new Date() creates date with current time and day and etc.
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      this.prisma.deFiChainAddressIndex.findMany({
        where: {
          claimSignature: { not: null },
          address: { not: undefined },
          createdAt: {
            // new Date() creates date with current time and day and etc.
            gte: today,
            lt: tomorrow,
          },
        },
        select: {
          tokenSymbol: true,
          claimAmount: true,
        },
      }),
    ]);

    const amountBridged = getAmountBridged(confirmedTransactions);

    return {
      totalTransactions,
      confirmedTransactions: confirmedTransactions.length,
      amountBridged,
    };
  }
}

function getAmountBridged(
  confirmedTransactions: Array<{
    tokenSymbol: string | null;
    claimAmount: string | null;
  }>,
): BridgedEvmToDfc {
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

  return amountBridgedToDfc;
}
