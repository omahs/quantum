/**
 * Hook to write `approve` function from specific ERC20 token contract
 */

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  erc20ABI,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useContractContext } from "@contexts/ContractContext";
import { Erc20Token } from "types";

interface ApproveTokenI {
  tokenName: Erc20Token;
  setErrorMessage: any;
  refetchBridge?: () => Promise<any>;
}

export default function useWriteApproveToken({
  tokenName,
  refetchBridge,
  setErrorMessage,
}: ApproveTokenI) {
  const [refetchedBridgeFn, setRefetchedBridgeFn] = useState(false);
  const { BridgeV1, Erc20Tokens } = useContractContext();

  const erc20TokenContract = {
    address: Erc20Tokens[tokenName].address,
    abi: erc20ABI,
  };

  // Prepare write (ERC20 token) contract for `approve` function
  const { config: tokenConfig } = usePrepareContractWrite({
    ...erc20TokenContract,
    functionName: "approve",
    args: [BridgeV1.address, ethers.constants.MaxInt256],
  });

  // Write (ERC20 token) contract for `approve` function
  const {
    data: tokenContract,
    write: writeApprove,
    error: writeApproveError,
  } = useContractWrite(tokenConfig);

  // Wait and get result from write (ERC20 token) contract for `approve` function
  const {
    error: approveTxnError,
    isSuccess: isApproveTxnSuccess,
    isLoading: isApproveTxnLoading,
  } = useWaitForTransaction({
    hash: tokenContract?.hash,
    onSuccess: () => refetchBridge?.().then(() => setRefetchedBridgeFn(true)),
  });

  useEffect(() => {
    if (writeApproveError || approveTxnError) {
      setErrorMessage(writeApproveError?.message ?? approveTxnError?.message);
    }
  }, [writeApproveError, approveTxnError]);

  return {
    isApproveTxnLoading,
    isApproveTxnSuccess,
    refetchedBridgeFn,
    writeApprove,
  };
}
