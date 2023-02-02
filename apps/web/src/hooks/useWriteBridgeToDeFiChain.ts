/**
 * Hook to write `bridgeToDeFiChain` function from our own BridgeV1 contract
 */

import { ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useContractContext } from "@contexts/ContractContext";
import { ETHEREUM_SYMBOL } from "../constants";

export default function useWriteBridgeToDeFiChain({
  receiverAddress,
  transferAmount,
  tokenName,
  tokenDecimals,
  onBridgeTxnSettled,
}) {
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const { BridgeV1, Erc20Tokens } = useContractContext();
  const sendingFromETH = tokenName === ETHEREUM_SYMBOL;

  // Prepare write contract for `bridgeToDeFiChain` function
  const { config: bridgeConfig, refetch: refetchBridge } =
    usePrepareContractWrite({
      address: BridgeV1.address,
      abi: BridgeV1.abi,
      functionName: "bridgeToDeFiChain",
      args: [
        utils.hexlify(utils.toUtf8Bytes(receiverAddress)) as `0x${string}`,
        Erc20Tokens[tokenName].address,
        utils.parseUnits(transferAmount.toString(), tokenDecimals),
      ],
      ...(sendingFromETH
        ? {
            overrides: {
              value: ethers.utils.parseEther(transferAmount.toString()),
            },
          }
        : {}),
      onError: (err) => {
        if (err.message.includes("insufficient allowance")) {
          // Need to request approval from user
          setRequiresApproval(true);
        } else {
          // Display error message
          setErrorMessage(err.message);
        }
      },
    });

  // Write contract for `bridgeToDeFiChain` function
  const {
    data: bridgeContract,
    write: writeBridgeToDeFiChain,
    error: writeBridgeTxnError,
  } = useContractWrite(bridgeConfig);

  // Wait and get result from write contract for `bridgeToDeFiChain` function
  const {
    error: bridgeTxnError,
    isSuccess: isBridgeTxnSuccess,
    isLoading: isBridgeTxnLoading,
  } = useWaitForTransaction({
    hash: bridgeContract?.hash,
    onSettled: onBridgeTxnSettled,
  });

  useEffect(() => {
    if (writeBridgeTxnError || bridgeTxnError) {
      setErrorMessage(writeBridgeTxnError?.message ?? bridgeTxnError?.message);
    }
  }, [writeBridgeTxnError, bridgeTxnError]);

  return {
    isBridgeTxnLoading,
    isBridgeTxnSuccess,
    errorMessage,
    refetchBridge,
    requiresApproval,
    writeBridgeToDeFiChain,
  };
}
