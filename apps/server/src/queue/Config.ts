export function confirmerQueueConfig(): Record<'queues', Record<string, QueueConfig>> {
  return {
    queues: {
      ethereum: {
        queueName: 'EthereumTransactionConfirmer',
        jobName: 'ethereumConfirmTransactionJob',
        backOffStrategy: 'fixed',
        numWorkers: 3,
        concurrency: 3,
        attempts: 10, // maximum of 20 minutes to reach necessary confirmations
        delay: 120000, // 2 minutes
      },
      defichain: {
        queueName: 'DeFiChainTransactionConfirmer',
        jobName: 'dfcConfirmTransactionJob',
        backOffStrategy: 'fixed',
        numWorkers: 3,
        concurrency: 3,
        attempts: 10, // maximum of 20 minutes to reach necessary confirmations
        delay: 120000, // 2 minutes
      },
    },
  };
}

export type ConfirmerQueueConfig = ReturnType<typeof confirmerQueueConfig>;
export interface QueueConfig {
  /**
   * The name of the queue
   */
  queueName: string;

  /**
   * The name of the job
   */
  jobName: string;

  /**
   *  The number of attempts allowed for this job
   */
  attempts: number;

  /**
   * The retry back off strategy to use
   */
  backOffStrategy: 'exponential' | 'fixed' | (string & {});

  /**
   * The duration between each retry in milliseconds
   */
  delay: number;

  /**
   * The number of workers to create for this queue
   */
  numWorkers: number;

  /**
   * The number of job each worker is allowed to work in parallel
   */
  concurrency: number;
}
