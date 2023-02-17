import { EnvironmentNetwork } from "@waveshq/walletkit-core";

export const BASE_URLS: { [key in EnvironmentNetwork]: string } = {
  [EnvironmentNetwork.LocalPlayground]: "http://localhost:5741",
  [EnvironmentNetwork.RemotePlayground]: "http://localhost:5741",
  [EnvironmentNetwork.TestNet]: "http://localhost:5741",
  [EnvironmentNetwork.DevNet]: "http://localhost:5741",
  [EnvironmentNetwork.MainNet]: "http://localhost:5741",
};
