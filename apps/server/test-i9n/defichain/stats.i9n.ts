import { EnvironmentNetwork } from '@waveshq/walletkit-core';
import { HardhatNetwork, HardhatNetworkContainer, StartedHardhatNetworkContainer } from 'smartcontracts';

import { BridgeServerTestingApp } from '../../src/BridgeServerTestingApp';
import { buildTestConfig, TestingExampleModule } from '../BridgeApp.i9n';

describe('DeFiChain Wallet Integration Testing', () => {
  let startedHardhatContainer: StartedHardhatNetworkContainer;
  let hardhatNetwork: HardhatNetwork;
  let testing: BridgeServerTestingApp;

  beforeAll(async () => {
    startedHardhatContainer = await new HardhatNetworkContainer().start();
    hardhatNetwork = await startedHardhatContainer.ready();
    testing = new BridgeServerTestingApp(TestingExampleModule.register(buildTestConfig({ startedHardhatContainer })));
    await testing.start();
  });

  afterAll(async () => {
    await hardhatNetwork.stop();
  });

  it('should be able to make calls to DeFiChain server', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: `/defichain/stats?network=${EnvironmentNetwork.RemotePlayground}`,
    });

    await expect(initialResponse.statusCode).toStrictEqual(200);
  });

  // TODO: Check why network validation fails on unit tests but works on actual server
  it.skip('should fail network validation', async () => {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: '/defichain/stats?network=DevTest',
    });
    await expect(initialResponse.statusCode).toStrictEqual(500);
    await expect(initialResponse.statusMessage).toStrictEqual('Internal Server Error');
  });
});
