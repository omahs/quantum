import { EnvironmentNetwork } from "@waveshq/walletkit-core";

// TODO: Replace URLs with real URLs
const BASE_URLS: { [key in EnvironmentNetwork]: string } = {
  [EnvironmentNetwork.LocalPlayground]: "http://localhost:5741/defichain",
  [EnvironmentNetwork.RemotePlayground]: "http://localhost:5741/defichain",
  [EnvironmentNetwork.TestNet]: "http://localhost:5741/defichain",
  [EnvironmentNetwork.DevNet]: "http://localhost:5741/defichain",
  [EnvironmentNetwork.MainNet]: "http://localhost:5741/defichain",
};

export default BASE_URLS;
