import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseJobOptions, Job, Queue, QueueEvents, Worker, WorkerOptions } from 'bullmq';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_OPTIONS = 'REDIS_OPTIONS';
type QueueName = string;

/**
 * Provisions a MultiQueueManager to provision several in-memory queues, with Redis for persistence
 * Each queue has at least a single worker (1 queue to many workers topology).
 */
@Injectable()
export class MultiQueueManager<DataType, ResultType> {
  private logger = new Logger(MultiQueueManager.name);

  private workers = new Map<QueueName, Worker[]>();

  private queues = new Map<QueueName, Queue>();

  private queueEvents = new Map<QueueName, QueueEvents>();

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(REDIS_OPTIONS) private readonly redisOptions: RedisOptions,
  ) {}

  // NestJs lifecycle hook - https://docs.nestjs.com/fundamentals/lifecycle-events
  public async onApplicationBootstrap(): Promise<void> {
    await this.initializeQueueManager();
  }

  // NestJs lifecycle hook - https://docs.nestjs.com/fundamentals/lifecycle-events
  public async beforeApplicationShutdown(): Promise<void> {
    await this.closeQueueEvents();
    await this.closeWorkers();
    await this.closeQueues();
    await this.closeRedis();
  }

  private async closeWorkers(): Promise<void> {
    for (const queueWorkers of Array.from(this.workers.values())) {
      for (const queueWorker of queueWorkers) {
        await queueWorker.close();
      }
    }
    this.logger.log(`MultiQueueManager shutdown hook - closed ${this.workers.size} workers`);
  }

  private async closeQueues(): Promise<void> {
    for (const queue of Array.from(this.queues.values())) {
      await queue.close();
    }
    this.logger.log(`MultiQueueManager shutdown hook - closed ${this.queues.size} queues`);
  }

  private async closeQueueEvents(): Promise<void> {
    for (const queueEvent of Array.from(this.queueEvents.values())) {
      await queueEvent.close();
    }
  }

  public async initializeQueueManager(): Promise<void> {
    // Establish redis connection if it's not connected
    if (this.redisClient.status === 'end') {
      await this.redisClient.connect();
      this.logger.log(
        `MultiQueueManager startup hook - redis client connected. Current status: ${this.redisClient.status}`,
      );
    }
    // Re-initializes all queues
    const queueNames = await this.listQueueNames();
    for (const queueName of queueNames) {
      this.createQueue(queueName);
    }
  }

  private async closeRedis(): Promise<void> {
    await this.redisClient.disconnect();
    this.logger.log('MultiQueueManager shutdown hook - redis client disconnected');
  }

  /**
   * Publish some data to a Queue to be picked up by a worker.
   * The Queue is lazily created by Bull (by constructing a new Queue).
   */
  async publish(options: QueuePublisherOptions, data: DataType): Promise<Job<DataType, ResultType>> {
    const queue = this.getQueue(options.queueName);
    const job = await queue.add(options.jobName, data, options.jobOptions);
    this.logger.log(`Published job '${options.jobName}' to queue '${options.queueName}'`);
    return job;
  }

  /**
   * This function is used by a service's onApplicationStartup
   * Enables queue durability by resuming processing from where it last left off.
   *
   * Jobs need to be idempotent to ensure that there are no unwanted side effects when restarting jobs.
   */
  public async startConsumer(
    options: QueueConsumerOptions,
    workerCallback: (job: Job<DataType, ResultType>) => Promise<ResultType>,
  ): Promise<void> {
    const queue = this.getQueue(options.queueName);
    const jobs = await queue.getJobs(['active']);
    for (const job of jobs) {
      // Sets jobs that were set to 'active' back to 'waiting' to restart the job and execute it again
      await job.moveToDelayed(1);
    }
    await this.assignSingletonWorker(options, workerCallback);
  }

  /**
   * Assigns a singleton Worker to the given Queue for processing Jobs.
   * The singleton Worker is lazily created.
   */
  private async assignSingletonWorker(
    options: QueueConsumerOptions,
    workerCallback: (job: Job<DataType, ResultType>) => Promise<ResultType>,
  ): Promise<void> {
    if (this.workers.has(options.queueName) === false) {
      await this.createWorker(options, workerCallback);
      this.logger.log(`Created singleton worker for queue '${options.queueName}'`);
    }
  }

  private async createWorker(
    options: QueueConsumerOptions,
    workerCallback: (job: Job<DataType, ResultType>) => Promise<ResultType>,
  ): Promise<void> {
    const queueWorkers: Worker[] = [];
    // Create X number of workers for a given queue for scalability
    for (let i = 0; i < (options.numWorkers ?? 1); i += 1) {
      const worker = new Worker<DataType, ResultType>(options.queueName, workerCallback, {
        ...options.workerOptions,
        connection: this.redisOptions,
      });
      await worker.waitUntilReady();
      queueWorkers.push(worker);
    }
    this.workers.set(options.queueName, queueWorkers);
  }

  public createQueue(queueName: string): Queue<DataType, ResultType> {
    const queue = new Queue<DataType, ResultType>(queueName, {
      connection: this.redisOptions,
    });
    this.queues.set(queueName, queue);
    return queue;
  }

  public createQueueEvent(queueName: string): QueueEvents {
    const queueEvent = new QueueEvents(queueName, {
      connection: this.redisOptions,
    });
    this.queueEvents.set(queueName, queueEvent);
    return queueEvent;
  }

  /**
   * Returns a reference to the queue. The queue will only be created
   * in Redis if a message is published to it.
   *
   * If the queue does not already exist, it will be created.
   */
  public getQueue(queueName: string): Queue<DataType, ResultType> {
    const queue = this.queues.get(queueName);
    if (queue === undefined) {
      return this.createQueue(queueName);
    }
    return queue;
  }

  /**
   * Returns a reference to the queue event. The queue event will only be created
   * in Redis if a message is published to it.
   *
   * If the queue event does not already exist, it will be created.
   */
  public getQueueEvent(queueName: string): QueueEvents {
    const queueEvent = this.queueEvents.get(queueName);
    if (queueEvent === undefined) {
      return this.createQueueEvent(queueName);
    }
    return queueEvent;
  }

  /**
   * Helper method to list all created Bull queues.
   */
  public async listQueueNames(): Promise<string[]> {
    const queueIds: string[] = await new Promise((resolve, reject) => {
      this.redisClient.keys('bull:*:id', (err, reply) => {
        if (err !== null && err !== undefined) {
          this.logger.error(err);
          reject(err);
        } else {
          resolve(reply ?? []);
        }
      });
    });

    // 'bull:queueA:id', 'bull:queueB:id', ...
    return queueIds.map((id) => id.split(':')[1]);
  }

  public async getJobById(queueName: string, jobId: string): Promise<Job | undefined> {
    return this.getQueue(queueName).getJob(jobId);
  }
}

export interface QueueConsumerOptions {
  queueName: string;
  numWorkers?: Number;
  workerOptions?: WorkerOptions;
}

export interface QueuePublisherOptions {
  queueName: string;
  jobName: string;
  jobOptions?: BaseJobOptions;
}
