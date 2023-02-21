import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@birthdayresearch/sticky-testcontainers';
import { WhaleWalletAccount } from '@defichain/whale-api-wallet';

import { WhaleWalletProvider } from '../../src/defichain/providers/WhaleWalletProvider';
import { BridgeServerTestingApp } from '../testing/BridgeServerTestingApp';
import { buildTestConfig, TestingModule } from '../testing/TestingModule';
import { DeFiChainStubContainer, StartedDeFiChainStubContainer } from './containers/DeFiChainStubContainer';

let defichain: StartedDeFiChainStubContainer;
let testing: BridgeServerTestingApp;
let startedPostgresContainer: StartedPostgreSqlContainer;

describe('DeFiChain Send Transaction Testing', () => {
  // Tests are slower because it's running 3 containers at the same time
  jest.setTimeout(3600000);
  let whaleWalletProvider: WhaleWalletProvider;
  let hotWalletAddress: string;
  let hotWallet: WhaleWalletAccount;
  const WALLET_ENDPOINT = `/defichain/wallet/balance/`;

  async function getBalance(tokenSymbol: string) {
    const initialResponse = await testing.inject({
      method: 'GET',
      url: `${WALLET_ENDPOINT}${tokenSymbol}`,
    });
    const response = JSON.parse(initialResponse.body);
    return response;
  }

  beforeAll(async () => {
    startedPostgresContainer = await new PostgreSqlContainer().start();

    defichain = await new DeFiChainStubContainer().start();
    const whaleURL = await defichain.getWhaleURL();
    const dynamicModule = TestingModule.register(
      buildTestConfig({
        defichain: { whaleURL, key: StartedDeFiChainStubContainer.LOCAL_MNEMONIC },
        startedPostgresContainer,
      }),
    );
    testing = new BridgeServerTestingApp(dynamicModule);
    const app = await testing.start();

    whaleWalletProvider = app.get<WhaleWalletProvider>(WhaleWalletProvider);
    hotWallet = await whaleWalletProvider.getHotWallet();
    hotWalletAddress = await hotWallet.getAddress();
  });

  afterAll(async () => {
    await testing.stop();
    await startedPostgresContainer.stop();
    await defichain.stop();
  });

  it('Validates that the symbol inputted is supported by the bridge', async () => {
    const txReceipt = await getBalance('invalid_symbol');
    expect(txReceipt.error).toBe('Bad Request');
    expect(txReceipt.message).toBe('Token: "invalid_symbol" is not supported');
    expect(txReceipt.statusCode).toBe(400);
  });

  it('should be able to get balance of tokens in hotwallet', async () => {
    // Sends token to the hotwallet
    let BTCbalance = await getBalance('BTC');
    expect(BTCbalance).toStrictEqual(0);
    await defichain.playgroundClient?.rpc.call(
      'sendtokenstoaddress',
      [
        {},
        {
          [hotWalletAddress]: `10@BTC`,
        },
      ],
      'number',
    );
    await defichain.generateBlock();
    BTCbalance = await getBalance('BTC');
    expect(BTCbalance).toStrictEqual(10);

    const dUSDCbalance = await getBalance('USDC');
    expect(dUSDCbalance).toStrictEqual(0);
    await defichain.playgroundClient?.rpc.call(
      'sendtokenstoaddress',
      [
        {},
        {
          [hotWalletAddress]: `50@USDC`,
        },
      ],
      'number',
    );
    expect(dUSDCbalance).toStrictEqual(50);

    const dUSDTbalance = await getBalance('USDT');
    expect(dUSDTbalance).toStrictEqual(0);
    // await defichain.playgroundClient?.rpc.call(
    //   'sendtokenstoaddress',
    //   [
    //     {},
    //     {
    //       [hotWalletAddress]: `100@USDT`,
    //     },
    //   ],
    //   'number',
    // );
    // expect(dUSDTbalance).toStrictEqual(100);

    const dETHbalance = await getBalance('ETH');
    expect(dETHbalance).toStrictEqual(0);
    // await defichain.playgroundClient?.rpc.call(
    //   'sendtokenstoaddress',
    //   [
    //     {},
    //     {
    //       [hotWalletAddress]: `5@ETH`,
    //     },
    //   ],
    //   'number',
    // );
    // expect(dETHbalance).toStrictEqual(5);

    const DFIbalance = await getBalance('DFI');
    expect(DFIbalance).toStrictEqual(0);
    // await defichain.playgroundClient?.rpc.call(
    //   'sendtokenstoaddress',
    //   [
    //     {},
    //     {
    //       [hotWalletAddress]: `1000@DFI`,
    //     },
    //   ],
    //   'number',
    // );
    // expect(DFIbalance).toStrictEqual(1000);
  });
});
