import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BigNumber, Contract, ethers, Event } from 'ethers';
import { BridgeV1__factory } from 'smartcontracts';

import { ETHERS_RPC_PROVIDER } from './modules/EthersModule';

@Injectable()
export class AppService {
  private contract: Contract;

  constructor(
    @Inject(ETHERS_RPC_PROVIDER) readonly ethersRpcProvider: ethers.providers.JsonRpcProvider,
    private configService: ConfigService,
  ) {
    this.contract = new ethers.Contract(
      this.configService.getOrThrow('ethereum.testnet.contracts.bridgeProxy.address'),
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

  async signData(tokenAddress: string, amount: string): Promise<string> {
    try {
      const signer = await this.ethersRpcProvider.getSigner();
      // TODO: Create transaction
      // TODO: Get nonce

      const domain = {
        chainId: 5,
        verifyingContract: this.contract.address,
        version: '0.1',
      };
      const eip712Types = {
        CLAIM: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'tokenAddress', type: 'address' },
        ],
      };
      const eip712Data = {
        to: signer,
        amount,
        nonce: 0,
        deadline: ethers.constants.MaxUint256,
        tokenAddress,
      };

      // eslint-disable-next-line no-underscore-dangle
      return await signer._signTypedData(domain, eip712Types, eip712Data);
    } catch (err) {
      throw new Error(err as any);
    }
  }
}
