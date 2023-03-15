import { BadRequestException, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/PrismaService';

import { SupportedDFCTokenSymbols } from '../../AppConfig';
import { BridgedDfcToEvm, DeFiChainStats, StatsDto } from '../DefichainInterface';

@Injectable()
export class DeFiChainStatsService {
  constructor(private prisma: PrismaService) {}

  async getDefiChainStats(date?: StatsDto): Promise<DeFiChainStats> {
    const dateOnly = date ?? new Date();
    const dateFrom = new Date(dateOnly.toString());
    dateFrom.setUTCHours(0, 0, 0, 0); // set to UTC +0
    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateFrom.getDate() + 1);
    const today = new Date();

    if (dateFrom > today) {
      throw new BadRequestException(`Cannot query future date.`);
    }

    const [totalTransactions, confirmedTransactions] = await Promise.all([
      this.prisma.deFiChainAddressIndex.count({
        where: {
          createdAt: {
            //   new Date() creates date with current time and day and etc.
            gte: dateFrom,
            lt: dateTo,
          },
        },
      }),

      this.prisma.deFiChainAddressIndex.findMany({
        where: {
          claimSignature: { not: null },
          address: { not: undefined },
          tokenSymbol: { not: null },
          claimAmount: { not: null },
          createdAt: {
            // new Date() creates date with current time and day and etc.
            gte: dateFrom,
            lt: dateTo,
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
): BridgedDfcToEvm {
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
    amountBridgedBigN[tokenSymbol as SupportedDFCTokenSymbols] = amountBridgedBigN[
      tokenSymbol as SupportedDFCTokenSymbols
    ].plus(BigNumber(claimAmount as string));
  }
  const numericalPlaceholder = '0.000000';
  const amountBridgedToEVM: BridgedDfcToEvm = {
    USDC: numericalPlaceholder,
    USDT: numericalPlaceholder,
    BTC: numericalPlaceholder,
    ETH: numericalPlaceholder,
    DFI: numericalPlaceholder,
    EUROC: numericalPlaceholder,
  };

  for (const key in amountBridgedBigN) {
    if ({}.hasOwnProperty.call(amountBridgedBigN, key)) {
      amountBridgedToEVM[key as SupportedDFCTokenSymbols] = amountBridgedBigN[key as SupportedDFCTokenSymbols]
        .decimalPlaces(6, BigNumber.ROUND_FLOOR)
        .toString();
    }
  }

  return amountBridgedToEVM;
}
