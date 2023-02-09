import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, Contract, ethers, Event } from 'ethers';
import { BridgeV1__factory } from 'smartcontracts';

import { ETHERS_RPC_PROVIDER } from './modules/EthersModule';
import { getEndOfDayTimeStamp } from './utils/MathUtils';

@Injectable()
export class AppService {
  private contract: Contract;

  constructor(
    @Inject(ETHERS_RPC_PROVIDER) readonly ethersRpcProvider: ethers.providers.StaticJsonRpcProvider,
    private configService: ConfigService,
  ) {
    this.contract = new ethers.Contract(
      this.configService.getOrThrow('ethereum.contracts.bridgeProxy.address'),
      BridgeV1__factory.abi,
      this.ethersRpcProvider,
    );
  }

  async getBlockHeight(): Promise<number> {
    return this.ethersRpcProvider.getBlockNumber();
  }

  async getBalance(address: string): Promise<BigNumber> {
    return this.ethersRpcProvider.getBalance(address);
  }

  async getAllEventsFromBlockNumber(blockNumber: number): Promise<Event[]> {
    const currentBlockNumber = await this.ethersRpcProvider.getBlockNumber();
    const eventSignature = this.contract.filters.BRIDGE_TO_DEFI_CHAIN();
    return this.contract.queryFilter(eventSignature, blockNumber, currentBlockNumber - 65);
  }

  async signClaim({ receiverAddress, tokenAddress, amount }: SignClaim): Promise<{ signature: string; nonce: number }> {
    try {
      // Connect signer ETH wallet (admin/operational wallet)
      const wallet = new ethers.Wallet(
        this.configService.getOrThrow('ethereum.ethWalletPrivKey'),
        this.ethersRpcProvider,
      );

      const { chainId } = await this.ethersRpcProvider.getNetwork();
      const nonce = await this.contract.eoaAddressToNonce(receiverAddress);
      const deadline = getEndOfDayTimeStamp();

      // TODO: Get from BridgeV1_factory
      const domain = {
        name: 'CAKE_BRIDGE',
        chainId,
        verifyingContract: this.contract.address,
        version: '0.1',
      };
      const types = {
        CLAIM: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'tokenAddress', type: 'address' },
        ],
      };
      const data = {
        to: receiverAddress,
        amount: ethers.utils.parseEther(amount),
        nonce,
        deadline,
        tokenAddress,
      };

      // eslint-disable-next-line no-underscore-dangle
      const signature = await wallet._signTypedData(domain, types, data);
      return { signature, nonce };
    } catch (e: any) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There is a problem in signing this claim',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: e,
        },
      );
    }
  }
}

interface SignClaim {
  receiverAddress: string;
  tokenAddress: string;
  amount: string;
}
