import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

import { MultiQueueManager } from './MultiQueueManager';
import { Queue } from './Queue';

@Injectable()
export class DeFiChainTransactionConfirmerQueue
  extends Queue<DeFiChainTransactionConfirmerJob, any>
  implements OnApplicationBootstrap
{
  constructor(
    readonly queue: MultiQueueManager<DeFiChainTransactionConfirmerJob, void>,
    private readonly configService: ConfigService,
  ) {
    super(configService.getOrThrow('queues.defichain'), queue);
  }

  async onApplicationBootstrap(): Promise<void> {
    await super.startConsumers();
  }

  async consumerHandler({ data: { transactionId } }: Job<DeFiChainTransactionConfirmerJob, void>): Promise<void> {
    // TODO: When submitting to this queue, the transactionId should be the jobId
    const job = await this.getJobById(transactionId);

    // Since there is no job, it will not retry
    if (job === undefined) {
      throw new Error(`DeFiChainTransactionConfirmerQueue job with id: ${transactionId} does not exist`);
    }

    // In the unlikely event that the transaction is not confirmable after the maximum amount of retries
    if (job.attemptsMade > this.configService.getOrThrow('queues.defichain.attempts')) {
      // TODO: Logic to handle not confirmable scenario
      //  note that we cannot throw an error here because the job will be retried
      return;
    }

    if ((await this.isTransactionConfirmed(transactionId)) === false) {
      // Throw error here to fail job and let bull auto retry again after X seconds delay
      throw new Error();
    }
  }

  // TODO: Logic to check the number of confirmations
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  async isTransactionConfirmed(transactionId: string): Promise<boolean> {
    return true;
  }
}

export type DeFiChainTransactionConfirmerJob = {
  transactionId: string;
};
