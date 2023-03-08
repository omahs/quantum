import { useTokensContext } from "@contexts/TokensContext";
import { useBalanceDfcMutation, useBalanceEvmMutation } from "@store/index";
import { Network } from "types";

export default function useCheckBalance() {
  const [balanceEvm] = useBalanceEvmMutation();
  const [balanceDfc] = useBalanceDfcMutation();

  const { selectedNetworkA } = useTokensContext();
  /**
   * When sending from EVM -> DFC, check that DFC wallet has enough balance;
   * When sending from DFC -> EVM, check that EVM wallet has enough balance;
   */
  async function getBalance(tokenSymbol: string): Promise<string> {
    const balance =
      selectedNetworkA.name === Network.Ethereum
        ? await balanceDfc({ tokenSymbol }).unwrap()
        : await balanceEvm({ tokenSymbol }).unwrap();
    return balance;
  }
  return { getBalance };
}
