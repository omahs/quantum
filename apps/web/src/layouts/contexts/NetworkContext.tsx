import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
  useEffect,
} from "react";
import { Erc20Token, Network, NetworkOptionsI, TokensI } from "types";
import { useLazyBridgeSettingsQuery } from "@store/index";

interface NetworkContextI {
  selectedNetworkA: NetworkOptionsI;
  selectedTokensA: TokensI;
  selectedNetworkB: NetworkOptionsI;
  selectedTokensB: TokensI;
  setSelectedNetworkA: (networkA: NetworkOptionsI) => void;
  setSelectedTokensA: (tokenA: TokensI) => void;
  setSelectedNetworkB: (networkB: NetworkOptionsI) => void;
  setSelectedTokensB: (tokenB: TokensI) => void;
  resetNetworkSelection: () => void;
  evmFee: string | number;
  dfcFee: string | number;
  isFetchingSupportedToken: boolean;
}

interface TokenDetailI<T> {
  name: T;
  symbol: string;
  icon: string;
  supply: string;
}

interface NetworkI<T> {
  name: Network;
  icon: string;
  tokens: {
    tokenA: TokenDetailI<T>;
    tokenB: TokenDetailI<string>;
  }[];
}

export const networks: [NetworkI<Erc20Token>, NetworkI<string>] = [
  {
    name: Network.Ethereum,
    icon: "/tokens/Ethereum.svg",
    // 4 available tokens to mint from as of now
    tokens: [
      {
        tokenA: {
          name: "wBTC",
          symbol: "WBTC",
          icon: "/tokens/wBTC.svg",
          supply: "1925543.1234",
        },
        tokenB: {
          name: "dBTC",
          symbol: "BTC",
          icon: "/tokens/dBTC.svg",
          supply: "1925543.1234",
        },
      },
      {
        tokenA: {
          name: "USDT",
          symbol: "USDT",
          icon: "/tokens/USDT.svg",
          supply: "6503681021.125",
        },
        tokenB: {
          name: "dUSDT",
          symbol: "USDT",
          icon: "/tokens/dUSDT.svg",
          supply: "6503681021.125",
        },
      },
      {
        tokenA: {
          name: "USDC",
          symbol: "USDC",
          icon: "/tokens/USDC.svg",
          supply: "43666178314.768",
        },
        tokenB: {
          name: "dUSDC",
          symbol: "USDC",
          icon: "/tokens/dUSDC.svg",
          supply: "43666178314.768",
        },
      },
      {
        tokenA: {
          name: "ETH",
          symbol: "ETH",
          icon: "/tokens/ETH.svg",
          supply: "120052901.9012",
        },
        tokenB: {
          name: "dETH",
          symbol: "ETH",
          icon: "/tokens/dETH.svg",
          supply: "120052901.9012",
        },
      },
    ],
  },
  {
    name: Network.DeFiChain,
    icon: "/tokens/DeFichain.svg",
    tokens: [
      {
        tokenA: {
          name: "dBTC",
          symbol: "BTC",
          icon: "/tokens/dBTC.svg",
          supply: "1801245.4321",
        },
        tokenB: {
          name: "wBTC",
          symbol: "WBTC",
          icon: "/tokens/wBTC.svg",
          supply: "1801245.4321",
        },
      },
      {
        tokenA: {
          name: "dUSDT",
          symbol: "USDT",
          icon: "/tokens/dUSDT.svg",
          supply: "5903681123.781",
        },
        tokenB: {
          name: "USDT",
          symbol: "USDT",
          icon: "/tokens/USDT.svg",
          supply: "5903681123.781",
        },
      },
      {
        tokenA: {
          name: "dUSDC",
          symbol: "USDC",
          icon: "/tokens/dUSDC.svg",
          supply: "33777178314.091",
        },
        tokenB: {
          name: "USDC",
          symbol: "USDC",
          icon: "/tokens/USDC.svg",
          supply: "33777178314.091",
        },
      },
      {
        tokenA: {
          name: "dETH",
          symbol: "ETH",
          icon: "/tokens/dETH.svg",
          supply: "107732901.8210",
        },
        tokenB: {
          name: "ETH",
          symbol: "ETH",
          icon: "/tokens/ETH.svg",
          supply: "107732901.8210",
        },
      },
    ],
  },
];

const NetworkContext = createContext<NetworkContextI>(undefined as any);

export function useNetworkContext(): NetworkContextI {
  return useContext(NetworkContext);
}

export function NetworkProvider({
  children,
}: PropsWithChildren<{}>): JSX.Element | null {
  const [dfcSupportedToken, setDfcSupportedToken] = useState<string[]>([]);
  const [evmSupportedToken, setEvmSupportedToken] = useState<string[]>([]);
  const [dfcFee, setDfcFee] = useState<`${number}` | number>(0);
  const [evmFee, setEvmFee] = useState<`${number}` | number>(0);
  const [isFetchingSupportedToken, setIsFetchingSupportedToken] =
    useState<boolean>(true);
  const [filteredNetwork, setFilteredNetwork] = useState(networks);
  const [trigger] = useLazyBridgeSettingsQuery();
  const [defaultNetworkA, defaultNetworkB] = filteredNetwork;
  const [selectedNetworkA, setSelectedNetworkA] =
    useState<NetworkOptionsI>(defaultNetworkA);
  const [selectedTokensA, setSelectedTokensA] = useState<TokensI>(
    defaultNetworkA.tokens[0]
  );
  const [selectedNetworkB, setSelectedNetworkB] =
    useState<NetworkOptionsI>(defaultNetworkB);
  const [selectedTokensB, setSelectedTokensB] = useState<TokensI>(
    defaultNetworkB.tokens[0]
  );

  useEffect(() => {
    const getBridgeSettings = async () => {
      const { data, isSuccess } = await trigger({});
      if (isSuccess) {
        if (data.defichain) {
          setDfcFee(data.defichain.transferFee);
          setDfcSupportedToken(data?.defichain.supportedTokens);
        }
        if (data.ethereum) {
          setEvmFee(data.ethereum.transferFee);
          setEvmSupportedToken(data.ethereum.supportedTokens);
        }
      }
      const matchedNetworks = networks.map((network) => {
        const supportedToken =
          network.name === Network.DeFiChain
            ? dfcSupportedToken
            : evmSupportedToken;
        const tokenMatcher = network.tokens.filter((token) =>
          supportedToken.includes(token.tokenA.symbol)
        );
        return {
          ...network,
          tokens: tokenMatcher,
        };
      });
      setFilteredNetwork(matchedNetworks);
      setIsFetchingSupportedToken(false);
    };
    getBridgeSettings();
  }, [networks, isFetchingSupportedToken]);

  useEffect(() => {
    console.log("filteredNetwork", filteredNetwork);
    const networkB = filteredNetwork.find(
      (network) => network.name !== selectedNetworkA.name
    );
    if (networkB !== undefined) {
      setSelectedNetworkB(networkB);
      const tokens = selectedNetworkA.tokens.find(
        (item) => item.tokenA.name === selectedTokensB.tokenA.name
      );
      if (tokens !== undefined) {
        setSelectedTokensA(tokens);
      }
    }
  }, [selectedNetworkA]);

  useEffect(() => {
    const tokens = selectedNetworkB.tokens.find(
      (item) => item.tokenA.name === selectedTokensA.tokenB.name
    );
    if (tokens !== undefined) {
      setSelectedTokensB(tokens);
    }
  }, [selectedTokensA]);

  const resetNetworkSelection = () => {
    setSelectedNetworkA(defaultNetworkA);
    setSelectedTokensA(defaultNetworkA.tokens[0]);
    setSelectedNetworkB(defaultNetworkB);
    setSelectedTokensB(defaultNetworkB.tokens[0]);
  };

  const context: NetworkContextI = useMemo(
    () => ({
      selectedNetworkA,
      selectedTokensA,
      selectedNetworkB,
      selectedTokensB,
      setSelectedNetworkA,
      setSelectedTokensA,
      setSelectedNetworkB,
      setSelectedTokensB,
      resetNetworkSelection,
      evmFee,
      dfcFee,
      filteredNetwork,
      isFetchingSupportedToken,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedTokensA,
      selectedTokensB,
      isFetchingSupportedToken,
      filteredNetwork,
    ]
  );

  return (
    <NetworkContext.Provider value={context}>
      {children}
    </NetworkContext.Provider>
  );
}
