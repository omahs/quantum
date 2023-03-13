import { Injectable } from '@nestjs/common';
// import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/PrismaService';

// import { SupportedDFCTokenSymbols } from '../../AppConfig';

@Injectable()
export class DeFiChainStatsService {
  constructor(private prisma: PrismaService) {}

  async getDefiChainStats(date?: string | undefined) {
    const today = date ? new Date(date) : new Date();
    // today.setUTCHours(0, 0, 0, 0); // set to UTC +0
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalTransactions = await this.prisma.deFiChainAddressIndex.findMany({
      where: {
        createdAt: {
          // new Date() creates date with current time and day and etc.
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
    });

    const confirmedTransactions = await this.prisma.deFiChainAddressIndex.count({
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

    const amountBridged = await this.prisma.deFiChainAddressIndex.groupBy({
      by: ['tokenSymbol'],
      where: {
        tokenSymbol: {
          not: null,
        },
        createdAt: {
          // new Date() creates date with current time and day and etc.
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
      _count: {
        _all: true,
      },
    });
    return {
      totalTransactions,
      confirmedTransactions,
      amountBridged,
    };
  }

  async test() {
    return this.prisma.$queryRaw`SELECT SUM(clai::int);`;
  }
}
