import { useEffect, useState } from "react";
import { NetworkOptionsI, TokensI } from "types";
import { useNetworkContext } from "@contexts/NetworkContext";

export default function useTokens() {
  const { filteredNetwork } = useNetworkContext();

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

  useEffect(() => {
    resetNetworkSelection();
  }, [filteredNetwork]);

  useEffect(() => {}, [selectedNetworkA]);

  return {
    selectedNetworkA,
    selectedTokensA,
    selectedNetworkB,
    selectedTokensB,
    setSelectedNetworkA,
    setSelectedTokensA,
    setSelectedNetworkB,
    setSelectedTokensB,
    resetNetworkSelection,
  };
}
