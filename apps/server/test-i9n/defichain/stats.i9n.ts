import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@birthdayresearch/sticky-testcontainers';

import { BridgeServerTestingApp } from '../testing/BridgeServerTestingApp';
import { buildTestConfig, TestingModule } from '../testing/TestingModule';
import { DeFiChainStubContainer, StartedDeFiChainStubContainer } from './containers/DeFiChainStubContainer';

let defichain: StartedDeFiChainStubContainer;
let testing: BridgeServerTestingApp;
let startedPostgresContainer: StartedPostgreSqlContainer;
describe('DeFiChain Stats Testing', () => {
  // Tests are slower because it's running 3 containers at the same time
  jest.setTimeout(3600000);
  beforeAll(async () => {
    startedPostgresContainer = await new PostgreSqlContainer().start();

    defichain = await new DeFiChainStubContainer().start();
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
    await startedPostgresContainer.stop();
    await defichain.stop();
  });

  it('should be able to make calls to DeFiChain server', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: `/defichain/stats`,
    });

    await expect(initialResponse.statusCode).toStrictEqual(200);
  });

  it(`should use today's date if no date is provided by the user`, async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: `/defichain/stats`,
    });
    const dateToday = new Date().toISOString().slice(0, 10);
    expect(JSON.parse(initialResponse.payload).date).toStrictEqual(dateToday);
  });

  it(`should return stats for the given date`, async () => {
    const targetDate = '2023-03-11';

    const initialResponse = await testing.inject({
      method: 'GET',
      url: `/defichain/stats?date=${targetDate}`,
    });
    expect(JSON.parse(initialResponse.payload).date).toStrictEqual(targetDate);
  });

  it(`should throw an error if invalid or no date is provided`, async () => {
    const txReceipt1 = await testing.inject({
      method: 'GET',
      url: `/defichain/stats?date=abc`,
    });

    const txReceipt2 = await testing.inject({
      method: 'GET',
      url: `/defichain/stats?date=`,
    });

    const expectedErrorMessage = 'API call for DefiChain statistics was unsuccessful: Invalid time value';
    expect(JSON.parse(txReceipt1.payload).status).toStrictEqual(500);
    expect(JSON.parse(txReceipt1.payload).error).toStrictEqual(expectedErrorMessage);
    expect(JSON.parse(txReceipt2.payload).status).toStrictEqual(500);
    expect(JSON.parse(txReceipt2.payload).error).toStrictEqual(expectedErrorMessage);
  });

  it(`should be correctly formatted`, async () => {
    const txReceipt = await testing.inject({
      method: 'GET',
      url: `/defichain/stats`,
    });

    const parsedPayload = JSON.parse(txReceipt.payload);

    expect(parsedPayload).toHaveProperty('totalTransactions');
    expect(parsedPayload).toHaveProperty('confirmedTransactions');
    expect(parsedPayload).toHaveProperty('amountBridged');

    expect(parsedPayload.amountBridged).toHaveProperty('USDC');
    expect(parsedPayload.amountBridged).toHaveProperty('USDT');
    expect(parsedPayload.amountBridged).toHaveProperty('BTC');
    expect(parsedPayload.amountBridged).toHaveProperty('ETH');
    expect(parsedPayload.amountBridged).toHaveProperty('DFI');
    expect(parsedPayload.amountBridged).toHaveProperty('EUROC');
  });
});
