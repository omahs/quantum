import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
  useEffect,
} from "react";
import { Erc20Token, Network, TokensI } from "types";
import { useLazyBridgeSettingsQuery } from "@store/index";

interface NetworkContextI {
  evmFee: string | number;
  dfcFee: string | number;
  filteredNetwork: [NetworkI<Erc20Token>, NetworkI<string>];
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
  const [dfcFee, setDfcFee] = useState<`${number}` | number>(0);
  const [evmFee, setEvmFee] = useState<`${number}` | number>(0);
  const [filteredNetwork, setFilteredNetwork] =
    useState<[NetworkI<Erc20Token>, NetworkI<string>]>(networks);
  const [trigger] = useLazyBridgeSettingsQuery();

  // fetch bridge settings
  useEffect(() => {
    const getBridgeSettings = async () => {
      const { data, isSuccess } = await trigger({});
      console.log("data", data);
      if (isSuccess) {
        if (data.defichain) {
          setDfcFee(data.defichain.transferFee);
        }
        if (data.ethereum) {
          setEvmFee(data.ethereum.transferFee);
        }

        const matchedNetworks = networks.map((network) => {
          const supportedToken =
            network.name === Network.DeFiChain
              ? data?.defichain.supportedTokens
              : data?.ethereum.supportedTokens;

          let tokenMatcher: TokensI[] = [];
          if (supportedToken !== undefined) {
            tokenMatcher = network.tokens.filter((token) =>
              supportedToken.includes(token.tokenA.symbol)
            );
          }
          return {
            ...network,
            tokens: tokenMatcher,
          };
        });
        setFilteredNetwork(
          matchedNetworks as [NetworkI<Erc20Token>, NetworkI<string>]
        );
      }
    };
    getBridgeSettings();
  }, [networks]);

  const context: NetworkContextI = useMemo(
    () => ({
      evmFee,
      dfcFee,
      filteredNetwork,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredNetwork]
  );

  return (
    <NetworkContext.Provider value={context}>
      {children}
    </NetworkContext.Provider>
  );
}
