import { fromAddress } from '@defichain/jellyfish-address';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeFiChainAddressIndex } from '@prisma/client';
import { EnvironmentNetwork } from '@waveshq/walletkit-core';

import { PrismaService } from '../../PrismaService';
import { WhaleApiClientProvider } from '../providers/WhaleApiClientProvider';
import { WhaleWalletProvider } from '../providers/WhaleWalletProvider';

@Injectable()
export class WhaleWalletService {
  constructor(
    private readonly whaleWalletProvider: WhaleWalletProvider,
    private readonly clientProvider: WhaleApiClientProvider,
    private prisma: PrismaService,
  ) {}

  async generateAddress(
    refundAddress: string,
    network: EnvironmentNetwork,
  ): Promise<Omit<DeFiChainAddressIndex, 'id' | 'index'>> {
    try {
      const decodedAddress = fromAddress(refundAddress, this.clientProvider.remapNetwork(network));
      if (decodedAddress === undefined) {
        throw new Error(`Invalid refund address for DeFiChain ${network}`);
      }
      const lastIndex = await this.prisma.deFiChainAddressIndex.findFirst({
        orderBy: [{ index: 'desc' }],
      });
      const index = lastIndex?.index;
      const nextIndex = index ? index + 1 : 2;
      const wallet = this.whaleWalletProvider.createWallet(nextIndex);
      const address = await wallet.getAddress();
      const data = await this.prisma.deFiChainAddressIndex.create({
        data: {
          index: nextIndex,
          address,
          refundAddress,
        },
      });
      return {
        address: data.address,
        createdAt: data.createdAt,
        refundAddress: data.refundAddress,
      };
    } catch (e: any) {
      // TODO: Improve error handling
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There is a problem in generating an address',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }

  async getAddressDetails(address: string): Promise<Omit<DeFiChainAddressIndex, 'id' | 'index'>> {
    try {
      const data = await this.prisma.deFiChainAddressIndex.findFirst({
        where: {
          address,
        },
        select: {
          address: true,
          refundAddress: true,
          createdAt: true,
        },
      });
      if (!data) {
        throw new Error('Address detail not available');
      }
      return data;
    } catch (e: any) {
      // TODO: Improve error handling
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There is a problem in fetching an address',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }
}
