import BigNumber from "bignumber.js";
import { useNetworkContext } from "@contexts/NetworkContext";
import { useTokensContext } from "@contexts/TokensContext";
import { Network } from "types";
/**
 * Computes transfer fee
 * Any changes to the fee logic can be updated here
 */
export default function useTransferFee(transferAmount: string | number) {
  const { evmFee, dfcFee } = useNetworkContext();
  const { selectedNetworkA, selectedTokensA } = useTokensContext();
  const isSendingFromEvm = selectedNetworkA.name === Network.Ethereum;
  const feeSymbol = selectedTokensA.tokenA.name;
  const fee = new BigNumber(transferAmount || 0).multipliedBy(
    isSendingFromEvm ? evmFee : dfcFee
  );
  return [fee, feeSymbol];
}
