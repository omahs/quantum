import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";
import { EnvironmentNetwork } from "types";

interface NetworkContextI {
  network: EnvironmentNetwork;
  networkDisplayName: string;
  updateNetwork: (network: EnvironmentNetwork) => void;
}

const DEFAULT_NETWORK = "mainnet";
const NETWORK_DISPLAY_NAME: Record<EnvironmentNetwork, string> = {
  mainnet: "MainNet",
  testnet: "TestNet",
};

const EnvironmentNetworkContext = createContext<NetworkContextI>(
  undefined as any
);

export function useEnvironmentNetworkContext(): NetworkContextI {
  return useContext(EnvironmentNetworkContext);
}

export function EnvironmentNetworkProvider({
  children,
}: PropsWithChildren<{}>): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork>(DEFAULT_NETWORK);
  const [networkDisplayName, setNetworkDisplayName] = useState<string>(
    NETWORK_DISPLAY_NAME[DEFAULT_NETWORK]
  );

  const handleNetworkChange = (value: EnvironmentNetwork) => {
    setNetwork(value);
    setNetworkDisplayName(NETWORK_DISPLAY_NAME[value]);
  };

  const context: NetworkContextI = useMemo(
    () => ({
      network,
      networkDisplayName,
      updateNetwork: handleNetworkChange,
    }),
    [network]
  );

  return (
    <EnvironmentNetworkContext.Provider value={context}>
      {children}
    </EnvironmentNetworkContext.Provider>
  );
}
