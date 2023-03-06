import BigNumber from "bignumber.js";
import { useNetworkContext } from "@contexts/NetworkContext";
import { Network } from "types";
/**
 * Computes transfer fee
 * Any changes to the fee logic can be updated here
 */
export default function useTransferFee(transferAmount: string | number) {
  const { selectedNetworkA, selectedTokensA, evmFee, dfcFee } =
    useNetworkContext();
  const isSendingFromEvm = selectedNetworkA.name === Network.Ethereum;
  const feeSymbol = selectedTokensA.tokenA.name;
  const fee = new BigNumber(transferAmount || 0).multipliedBy(
    isSendingFromEvm ? evmFee : dfcFee
  );
  return [fee, feeSymbol];
}
