import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@birthdayresearch/sticky-testcontainers';

import { StartedDeFiChainStubContainer } from '../defichain/containers/DeFiChainStubContainer';
import { BridgeServerTestingApp } from './BridgeServerTestingApp';
import { buildTestConfig, TestingModule } from './TestingModule';

describe('Statistics Service Test', () => {
  let testing: BridgeServerTestingApp;
  let startedPostgresContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    startedPostgresContainer = await new PostgreSqlContainer().start();

    testing = new BridgeServerTestingApp(
      TestingModule.register(
        buildTestConfig({
          defichain: { key: StartedDeFiChainStubContainer.LOCAL_MNEMONIC },
          startedPostgresContainer,
        }),
      ),
    );

    await testing.start();
  });

  afterAll(async () => {
    await testing.stop();
  });

  it(`should return today's data if no param is given`, async () => {
    const txReceipt = await testing.inject({
      method: 'GET',
      url: `/ethereum/stats`,
    });

    const dateToday = new Date().toISOString().slice(0, 10);
    expect(JSON.parse(txReceipt.payload).date).toStrictEqual(dateToday);
  });

  it(`should return given date's data`, async () => {
    const targetDate = '2023-03-11';

    const txReceipt = await testing.inject({
      method: 'GET',
      url: `/ethereum/stats?date=${targetDate}`,
    });

    expect(JSON.parse(txReceipt.payload).date).toStrictEqual(targetDate);
  });

  it(`should throw an error if invalid or no date is provided`, async () => {
    const txReceipt1 = await testing.inject({
      method: 'GET',
      url: `/ethereum/stats?date=abc`,
    });

    const txReceipt2 = await testing.inject({
      method: 'GET',
      url: `/ethereum/stats?date=`,
    });

    const expectedErrorMessage = 'API call for Ethereum statistics was unsuccessful: Invalid time value';
    expect(JSON.parse(txReceipt1.payload).status).toStrictEqual(500);
    expect(JSON.parse(txReceipt1.payload).error).toStrictEqual(expectedErrorMessage);
    expect(JSON.parse(txReceipt2.payload).status).toStrictEqual(500);
    expect(JSON.parse(txReceipt2.payload).error).toStrictEqual(expectedErrorMessage);
  });

  it(`should be correctly formatted`, async () => {
    const txReceipt = await testing.inject({
      method: 'GET',
      url: `/ethereum/stats`,
    });

    const parsedPayload = JSON.parse(txReceipt.payload);

    expect(parsedPayload).toHaveProperty('date');
    expect(parsedPayload).toHaveProperty('cacheTime');
    expect(parsedPayload).toHaveProperty('totalTransactions');
    expect(parsedPayload).toHaveProperty('confirmedTransactions');
    expect(parsedPayload).toHaveProperty('amountBridged');

    expect(parsedPayload.amountBridged).toHaveProperty('ETH');
    expect(parsedPayload.amountBridged).toHaveProperty('WBTC');
    expect(parsedPayload.amountBridged).toHaveProperty('USDT');
    expect(parsedPayload.amountBridged).toHaveProperty('USDC');
  });
});
