import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { EthereumAddressValidationPipe } from '../../pipes/EthereumAddressValidation.pipe';
import { EthereumTransactionValidationPipe } from '../../pipes/EthereumTransactionValidation.pipe';
import { EVMTransactionConfirmerService, HandledEVMTransaction } from '../services/EVMTransactionConfirmerService';

@Controller()
export class EthereumController {
  constructor(private readonly evmTransactionConfirmerService: EVMTransactionConfirmerService) {}

  @Get('balance')
  async getBalance(@Query('address', new EthereumAddressValidationPipe()) address: string): Promise<string> {
    return this.evmTransactionConfirmerService.getBalance(address);
  }

  @Post('handleTransaction')
  @UseGuards(ThrottlerGuard)
  async handleTransaction(
    @Body('transactionHash', new EthereumTransactionValidationPipe()) transactionHash: string,
  ): Promise<HandledEVMTransaction> {
    return this.evmTransactionConfirmerService.handleTransaction(transactionHash);
  }
}
