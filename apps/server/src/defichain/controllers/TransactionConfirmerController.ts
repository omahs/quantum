import { Body, Controller, Post } from '@nestjs/common';

import { DeFiChainTransactionConfirmerQueue } from '../../queue/DeFiChainTransactionConfirmerQueue';
import { TransactionConfirmerActionDto } from '../model/TransactionConfirmerActionDto';

@Controller('/confirmer')
export class TransactionConfirmerController {
  constructor(private readonly defichainTransactionConfirmerQueue: DeFiChainTransactionConfirmerQueue) {}

  /**
   * TODO: This endpoint cannot be so simple and needs to be protected in some way
   *  with the current implementation any user can call this endpoint.
   * @param transactionConfirmerAction
   */
  @Post()
  async triggerConfirmer(@Body() transactionConfirmerAction: TransactionConfirmerActionDto): Promise<boolean> {
    await this.defichainTransactionConfirmerQueue.submit({ transactionId: transactionConfirmerAction.transactionId });
    // return true if the transaction was successfully submitted to the queue
    return true;
  }
}
