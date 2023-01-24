import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { NetworkEnvironment } from "types";
import { useNetworkEnvironmentContext } from "./NetworkEnvironmentContext";

type Erc20Token = "wBTC" | "USDT" | "USDC" | "ETH";

interface ContractContextI {
  BridgeProxyContractAddress: `0x${string}`;
  Erc20Tokens: Record<Erc20Token, `0x${string}`>;
}

const ContractContext = createContext<ContractContextI>(undefined as any);

export function useContractContext(): ContractContextI {
  return useContext(ContractContext);
}

const MAINNET_CONFIG: ContractContextI = {
  BridgeProxyContractAddress: "0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C", // TODO: Replace with deployed contract address on mainnet
  Erc20Tokens: {
    wBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    ETH: "0x0000000000000000000000000000000000000000",
  },
};

const GOERLI_CONFIG: ContractContextI = {
  BridgeProxyContractAddress: "0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C",
  Erc20Tokens: {
    wBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    USDT: "0xA218A0EA9a888e3f6E2dfFdf4066885f596F07bF", // MUSDT
    USDC: "0xB200af2b733B831Fbb3d98b13076BC33F605aD58", // MUSDC
    ETH: "0x0000000000000000000000000000000000000000",
  },
};

export function ContractProvider({
  children,
}: PropsWithChildren<{}>): JSX.Element | null {
  const { networkEnv } = useNetworkEnvironmentContext();
  const [config, setConfig] = useState(MAINNET_CONFIG);

  useEffect(() => {
    if (networkEnv === NetworkEnvironment.mainnet) {
      setConfig(MAINNET_CONFIG);
    } else {
      setConfig(GOERLI_CONFIG);
    }
  }, [networkEnv]);

  return (
    <ContractContext.Provider value={config}>
      {children}
    </ContractContext.Provider>
  );
}
