import { Job } from 'bullmq';

import { QueueConfig } from './Config';
import { MultiQueueManager } from './MultiQueueManager';

/**
 * An abstract class for implementing an in memory queue use Bull.
 */
export abstract class Queue<DataType, ResultType> {
  constructor(
    private readonly queueConfig: QueueConfig,
    private readonly queueManager: MultiQueueManager<DataType, ResultType>,
  ) {
    this.consumerHandler = this.consumerHandler.bind(this);
  }

  /**
   * Submits data to the queue
   * Default publisher options:
   * @attempts - 10 max retries per job
   * @type - Exponential backoff strategy
   * @delay - Delay of 3 seconds after each retry
   */
  async submit(job: DataType, jobId?: string): Promise<void> {
    await this.queueManager.publish(
      {
        queueName: this.queueName,
        jobName: this.queueConfig.jobName,
        jobOptions: {
          jobId,
          attempts: this.queueConfig.attempts,
          backoff: {
            type: this.queueConfig.backOffStrategy,
            delay: this.queueConfig.delay,
          },
        },
      },
      job,
    );
  }

  /**
   * Starts up the service's consumer to process waiting jobs when service bootstraps
   * Default consumer options:
   * @numWorkers - 1 worker
   * @concurrency - 1 concurrent jobs for each worker
   */
  async startConsumers(): Promise<void> {
    await this.startMainConsumer();
  }

  /**
   * Searches a job by its id and returns a strongly typed job
   */
  async getJobById(jobId: string): Promise<Job<DataType, ResultType> | undefined> {
    return this.queueManager.getJobById(this.queueName, jobId);
  }

  abstract consumerHandler(job: Job<DataType, ResultType>): Promise<ResultType>;

  get queueName(): string {
    return this.queueConfig.queueName;
  }

  private async startMainConsumer(): Promise<void> {
    await this.queueManager.startConsumer(
      {
        queueName: this.queueConfig.queueName,
        numWorkers: this.queueConfig.numWorkers,
        workerOptions: {
          concurrency: this.queueConfig.concurrency,
        },
      },
      this.consumerHandler,
    );
  }
}
