import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@birthdayresearch/sticky-testcontainers';
import BigNumber from 'bignumber.js';

import { PrismaService } from '../../src/PrismaService';
import { BridgeServerTestingApp } from '../testing/BridgeServerTestingApp';
import { buildTestConfig, TestingModule } from '../testing/TestingModule';

describe('DeFiChain Save Transaction and Daily Limit Testing', () => {
  let testing: BridgeServerTestingApp;
  let startedPostgresContainer: StartedPostgreSqlContainer;
  let prismaService: PrismaService;
  const transactionAmount = new BigNumber('0.0001');

  beforeAll(async () => {
    startedPostgresContainer = await new PostgreSqlContainer().start();
    testing = new BridgeServerTestingApp(
      TestingModule.register(
        buildTestConfig({
          startedPostgresContainer,
        }),
      ),
    );

    const app = await testing.start();
    // Initialize postgres database
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Teardown database
    await prismaService.deFiChainTransactions.deleteMany({});
    await testing.stop();
    await startedPostgresContainer.stop();
  });

  it('should be able to save DeFiChain transaction', async () => {
    const txnData = {
      symbol: 'BTC',
      amount: transactionAmount.toString(),
      to: 'tf1qm5hf2lhrsyfzeu0mnnzl3zllznfveua5rprhr4',
      from: 'tf1q54yxra5jk5dqkcjgx3mtghul75m6uak2wq9hll',
      transactionHash: '0x9d9baa381d5956a4def4dc3bf3ca3912a4a94809cae8aa1502cf500515eab311',
    };
    const response = await testing.inject({
      method: 'POST',
      url: '/defichain/transaction/save',
      payload: txnData,
    });
    expect(response.statusCode).toStrictEqual(201);
    expect(JSON.parse(response.body)).toStrictEqual({ success: true });

    const insertedTxn = await prismaService.deFiChainTransactions.findFirst({
      where: { transactionHash: txnData.transactionHash },
    });
    expect(insertedTxn).not.toBeNull();
    expect(insertedTxn).toEqual(
      expect.objectContaining({
        symbol: txnData.symbol,
        to: txnData.to,
        from: txnData.from,
        transactionHash: txnData.transactionHash,
      }),
    );
    expect(insertedTxn?.amount?.toString()).toStrictEqual(txnData.amount);
    expect(insertedTxn?.status).toStrictEqual('PENDING');
  });

  it('should fetch daily limit with used and remaining allowance for DeFiChain', async () => {
    const response = await testing.inject({
      method: 'GET',
      url: '/defichain/transaction/daily-limit?symbol=BTC',
    });

    const { dailyLimit, currentDailyUsage, remainingDailyLimit } = JSON.parse(response.body);
    const computedLimit = new BigNumber(remainingDailyLimit).plus(currentDailyUsage);

    expect(response.statusCode).toStrictEqual(200);
    expect(dailyLimit).toBeDefined();
    expect(currentDailyUsage).toBeDefined();
    expect(remainingDailyLimit).toBeDefined();
    expect(computedLimit.toString()).toEqual(dailyLimit);
  });
});
