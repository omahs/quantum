import { HardhatNetwork, HardhatNetworkContainer, StartedHardhatNetworkContainer } from 'smartcontracts';

import { BridgeServerTestingApp } from '../src/BridgeServerTestingApp';
import { RedisContainer, StartedRedisContainer } from '../testing/RedisContainer';
import { buildTestConfig, TestingExampleModule } from '../testing/TestingExampleModule';

describe('Bridge Service Integration Tests', () => {
  let startedHardhatContainer: StartedHardhatNetworkContainer;
  let startedRedisContainer: StartedRedisContainer;
  let hardhatNetwork: HardhatNetwork;
  let testing: BridgeServerTestingApp;

  beforeAll(async () => {
    startedHardhatContainer = await new HardhatNetworkContainer().start();
    startedRedisContainer = await new RedisContainer().start();
    hardhatNetwork = await startedHardhatContainer.ready();
    testing = new BridgeServerTestingApp(
      TestingExampleModule.register(buildTestConfig(startedHardhatContainer, startedRedisContainer)),
    );
    await testing.start();
  });

  afterAll(async () => {
    await testing.stop();
    await hardhatNetwork.stop();
    await startedRedisContainer.stop();
  });

  it('should be able to start successfully', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: '/',
    });

    await expect(initialResponse).toStrictEqual(expect.any(Object));
  });

  it('should be able to make calls to the underlying hardhat node', async () => {
    // Given an initial block height of 1000 (due to the initial block generation when calling HardhatNetwork.ready())
    const initialResponse = await testing.inject({
      method: 'GET',
      url: '/app/blockheight',
    });

    await expect(initialResponse.body).toStrictEqual('1000');

    // When one block is mined
    await hardhatNetwork.generate(1);

    // Then the new block height should be 1
    const responseAfterGenerating = await testing.inject({
      method: 'GET',
      url: '/app/blockheight',
    });

    expect(responseAfterGenerating.body).toStrictEqual('1001');
  });

  // Sample only, will re-org once we have proper layers
  it('should be able to make calls to DeFiChain server /stats', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: '/defichain/stats?network=regtest',
    });

    await expect(initialResponse.statusCode).toStrictEqual(200);
  });

  // Sample only, this currently does nothing at all
  it('should be able to make calls to DeFiChain server /confirmer', async () => {
    const initialResponse = await testing.inject({
      method: 'POST',
      url: '/defichain/confirmer',
      payload: {
        transactionId: 'weNeedAnId',
      },
    });

    await expect(initialResponse.statusCode).toStrictEqual(201);
  });

  it('should fail network validation', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: '/defichain/stats?network=devtest',
    });

    await expect(initialResponse.statusCode).toStrictEqual(500);
    await expect(initialResponse.statusMessage).toStrictEqual('Internal Server Error');
  });
});
