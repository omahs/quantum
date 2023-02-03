import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EnvironmentNetwork } from '@waveshq/walletkit-core/dist/api/environment';

import { Prisma } from '../../prisma/Client';
import { WhaleWalletProvider } from '../providers/WhaleWalletProvider';

@Injectable()
export class WhaleWalletService {
  constructor(private readonly whaleWalletProvider: WhaleWalletProvider) {}

  async generateAddress(network: EnvironmentNetwork = EnvironmentNetwork.MainNet): Promise<{ address: string }> {
    try {
      const lastIndex = await Prisma.pathIndex.findFirst({
        where: {
          network,
        },
        orderBy: [{ index: 'desc' }],
      });
      const index = lastIndex?.index;
      const nextIndex = index ? index + 1 : 2;
      const wallet = this.whaleWalletProvider.createWallet(network, nextIndex);
      const address = await wallet.getAddress();
      await Prisma.pathIndex.create({
        data: {
          index: nextIndex,
          address,
          network,
        },
      });
      return { address };
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
}
