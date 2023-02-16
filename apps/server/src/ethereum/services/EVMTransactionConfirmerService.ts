import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EthereumTransactionStatus } from '@prisma/client';
import { BigNumber, Contract, ethers } from 'ethers';
import { BridgeV1__factory } from 'smartcontracts';

import { SendService } from '../../defichain/services/SendService';
import { ETHERS_RPC_PROVIDER } from '../../modules/EthersModule';
import { PrismaService } from '../../PrismaService';
import { getEndOfDayTimeStamp } from '../../utils/MathUtils';

@Injectable()
export class EVMTransactionConfirmerService {
  private contract: Contract;

  constructor(
    @Inject(ETHERS_RPC_PROVIDER) readonly ethersRpcProvider: ethers.providers.StaticJsonRpcProvider,
    private readonly sendService: SendService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.contract = new ethers.Contract(
      this.configService.getOrThrow('ethereum.contracts.bridgeProxy.address'),
      BridgeV1__factory.abi,
      this.ethersRpcProvider,
    );
  }

  async handleTransaction(transactionHash: string): Promise<HandledEVMTransaction | any> {
    const txReceipt = await this.ethersRpcProvider.getTransactionReceipt(transactionHash);
    const isReverted = txReceipt.status === 0;
    if (isReverted === true) {
      throw new BadRequestException(`Transaction Reverted`);
    }
    const currentBlockNumber = await this.ethersRpcProvider.getBlockNumber();
    const numberOfConfirmations = currentBlockNumber - txReceipt.blockNumber;
    const txHashFound = await this.prisma.bridgeEventTransactions.findFirst({
      where: {
        transactionHash,
      },
    });
    if (txHashFound === null) {
      if (numberOfConfirmations < 65) {
        await this.prisma.bridgeEventTransactions.create({
          data: {
            transactionHash,
            status: EthereumTransactionStatus.NOT_CONFIRMED,
          },
        });
        return { numberOfConfirmations, isConfirmed: false };
      }
      await this.prisma.bridgeEventTransactions.create({
        data: {
          transactionHash,
          status: EthereumTransactionStatus.CONFIRMED,
        },
      });
      return { numberOfConfirmations, isConfirmed: true };
    }
    if (numberOfConfirmations < 65) {
      return { numberOfConfirmations, isConfirmed: false };
    }
    await this.prisma.bridgeEventTransactions.update({
      where: {
        id: txHashFound?.id,
      },
      data: {
        status: EthereumTransactionStatus.CONFIRMED,
      },
    });
    return { numberOfConfirmations, isConfirmed: true };
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
      const domainName = await this.contract.name();
      const domainVersion = await this.contract.version();
      const deadline = getEndOfDayTimeStamp();

      const domain = {
        name: domainName,
        chainId,
        verifyingContract: this.contract.address,
        version: domainVersion,
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

  async allocateDFCFund(transactionHash: string): Promise<any> {
    try {
      const txReceipt = await this.ethersRpcProvider.getTransactionReceipt(transactionHash);
      const isReverted = txReceipt.status === 0;
      if (isReverted === true) {
        throw new BadRequestException(`Transaction Reverted`);
      }
      const currentBlockNumber = await this.ethersRpcProvider.getBlockNumber();
      const numberOfConfirmations = currentBlockNumber - txReceipt.blockNumber;
      // check if tx is confirmed with min required confirmation
      if (numberOfConfirmations < 65) {
        throw new Error('Transaction is not yet confirmed with min block threshold');
      }

      const txDetails = await this.prisma.bridgeEventTransactions.findFirst({
        where: {
          transactionHash,
        },
      });
      // check if tx details are available in db
      if (!txDetails) {
        throw new Error('Transaction detail not available');
      }

      // check if fund is already allocated for the given txn
      // TODO check if fund is allocated or not
      if (txDetails?.status === EthereumTransactionStatus.CONFIRMED) {
        const onChainTxnDetail = await this.ethersRpcProvider.getTransaction(transactionHash);
        const { params } = decodeTxnData(onChainTxnDetail);
        // eslint-disable-next-line no-underscore-dangle
        const address = ethers.utils.toUtf8String(params._defiAddress);
        // TODO check 0.1% charge for EVM => DFI
        // await this.sendService.send(address, {
        //   symbol: '',
        //   id: '',
        //   // eslint-disable-next-line no-underscore-dangle
        //   amount: params._amount
        // })
        // transfer logic
        return { ...params, address };
      }
      return {};
    } catch (e: any) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There is a problem in allocating fund',
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

export interface HandledEVMTransaction {
  numberOfConfirmations: number;
  isConfirmed: boolean;
}

const decodeTxnData = (txDetail: ethers.providers.TransactionResponse) => {
  const iface = new ethers.utils.Interface(BridgeV1__factory.abi);
  const decodedData = iface.parseTransaction({ data: txDetail.data, value: txDetail.value });
  const fragment = iface.getFunction(decodedData.name);
  const params = decodedData.args.reduce((res, param, i) => {
    let parsedParam = param;
    const isUint = fragment.inputs[i].type.indexOf('uint') === 0;
    const isInt = fragment.inputs[i].type.indexOf('int') === 0;
    const isAddress = fragment.inputs[i].type.indexOf('address') === 0;

    if (isUint || isInt) {
      const isArray = Array.isArray(param);

      if (isArray) {
        parsedParam = param.map((val) => BigNumber.from(val).toString());
      } else {
        parsedParam = BigNumber.from(param).toString();
      }
    }

    // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
    if (isAddress) {
      const isArray = Array.isArray(param);
      if (isArray) {
        parsedParam = param.map((_) => _.toLowerCase());
      } else {
        parsedParam = param.toLowerCase();
      }
    }
    return {
      ...res,
      [fragment.inputs[i].name]: parsedParam,
    };
  }, {});

  return {
    params,
    name: decodedData.name,
  };
};
