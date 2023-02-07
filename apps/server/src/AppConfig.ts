import { EnvironmentNetwork } from '@waveshq/walletkit-core';
import * as Joi from 'joi';

export function appConfig() {
  return {
    defichain: {
      [EnvironmentNetwork.MainNet]: process.env.DEFICHAIN_MAINNET_KEY,
      [EnvironmentNetwork.RemotePlayground]: process.env.DEFICHAIN_REMOTE_KEY,
      [EnvironmentNetwork.LocalPlayground]: process.env.DEFICHAIN_LOCAL_KEY,
      localWhaleURL: 'http://localhost:19553',
    },
    ethereum: {
      testnet: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'localhost:8545',
        contracts: {
          bridgeProxy: {
            // https://goerli.etherscan.io/address/0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C
            address: '0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C',
          },
        },
        ethWalletPrivKey: process.env.ETHEREUM_WALLET_PRIVATE_KEY,
      },
      mainnet: {
        contracts: {
          bridgeProxy: {
            address: undefined,
          },
        },
      },
    },
  };
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export type AppConfig = DeepPartial<ReturnType<typeof appConfig>>;

export const ENV_VALIDATION_SCHEMA = Joi.object({
  ETHEREUM_RPC_URL: Joi.string().uri(),
  ETHEREUM_WALLET_PRIVATE_KEY: Joi.string(),
  DEFICHAIN_MAINNET_KEY: Joi.string(),
  DEFICHAIN_REMOTE_KEY: Joi.string(),
  DEFICHAIN_LOCAL_KEY: Joi.string(),
});
