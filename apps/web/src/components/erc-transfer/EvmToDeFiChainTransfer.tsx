import { ethers, utils } from "ethers";
import {
  erc20ABI,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import useResponsive from "@hooks/useResponsive";
import AlertInfoMessage from "@components/commons/AlertInfoMessage";
import ActionButton from "@components/commons/ActionButton";
import Modal from "@components/commons/Modal";
import { TransferData } from "@components/ConfirmTransferModal";
import { useContractContext } from "@contexts/ContractContext";
import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import { setStorageItem } from "@utils/localStorage";
import {
  DEFAULT_SPENDING_LIMIT,
  DISCLAIMER_MESSAGE,
  ETHEREUM_SYMBOL,
  STORAGE_TXN_KEY,
} from "../../constants";
import clsx from "clsx";
import BigNumber from "bignumber.js";

function getSpendLimitToApprove(
  transferAmount: BigNumber,
  tokenAllowance: string | number
) {
  if (transferAmount.gt(tokenAllowance)) {
    return transferAmount.plus(0.1).toString();
  }
  return DEFAULT_SPENDING_LIMIT;
}

export default function EvmToDeFiChainTransfer({
  data,
}: {
  data: TransferData;
}) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showLoader, setShowLoader] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [refetchedBridgeFn, setRefetchedBridgeFn] = useState(false);

  const router = useRouter();
  const { isMobile } = useResponsive();
  const { networkEnv } = useNetworkEnvironmentContext();
  const { BridgeV1, Erc20Tokens } = useContractContext();
  const sendingFromETH = data.from.tokenName === ETHEREUM_SYMBOL;

  // Read details from token contract
  const erc20TokenContract = {
    address: Erc20Tokens[data.from.tokenName].address,
    abi: erc20ABI,
  };
  const { data: readTokenData } = useContractReads({
    contracts: [
      {
        ...erc20TokenContract,
        functionName: "allowance",
        args: [data.from.address as `0x${string}`, BridgeV1.address],
      },
      {
        ...erc20TokenContract,
        functionName: "decimals",
      },
    ],
    enabled: !sendingFromETH,
    watch: true,
  });
  const tokenDecimals = readTokenData?.[1] ?? "gwei";
  const tokenAllowance = utils.formatEther(
    readTokenData?.[0] ?? ethers.BigNumber.from(0)
  );

  // Prepare write contract for `bridgeToDeFiChain` function
  const { config: bridgeConfig, refetch: refetchBridge } =
    usePrepareContractWrite({
      address: BridgeV1.address,
      abi: BridgeV1.abi,
      functionName: "bridgeToDeFiChain",
      args: [
        utils.hexlify(utils.toUtf8Bytes(data.to.address)) as `0x${string}`,
        Erc20Tokens[data.from.tokenName].address,
        utils.parseUnits(data.to.amount.toString(), tokenDecimals),
      ],
      ...(sendingFromETH
        ? {
            overrides: {
              value: ethers.utils.parseEther(data.to.amount.toString()),
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
    onSettled: () => setShowLoader(false),
  });

  // Prepare write (ERC20 token) contract for `approve` function
  const { config: tokenConfig } = usePrepareContractWrite({
    ...erc20TokenContract,
    functionName: "approve",
    args: [
      BridgeV1.address,
      utils.parseUnits(
        getSpendLimitToApprove(data.to.amount, tokenAllowance),
        tokenDecimals
      ),
    ],
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
    onSuccess: () => refetchBridge().then(() => setRefetchedBridgeFn(true)),
  });

  useEffect(() => {
    if (
      writeBridgeTxnError ||
      writeApproveError ||
      approveTxnError ||
      bridgeTxnError
    ) {
      setErrorMessage(
        writeBridgeTxnError?.message ??
          writeApproveError?.message ??
          approveTxnError?.message ??
          bridgeTxnError?.message
      );
    }
  }, [writeBridgeTxnError, writeApproveError, approveTxnError, bridgeTxnError]);

  useEffect(() => {
    // Trigger `bridgeToDeFiChain` once allowance is approved
    const hasEnoughAllowance = data.to.amount.lte(tokenAllowance);
    if (
      requiresApproval &&
      isApproveTxnSuccess &&
      refetchedBridgeFn &&
      hasEnoughAllowance
    ) {
      writeBridgeToDeFiChain?.();
    }
  }, [isApproveTxnSuccess, tokenAllowance, refetchedBridgeFn]);

  useEffect(() => {
    // On success, clear unconfirmed txn from local storage
    if (isBridgeTxnSuccess) {
      const TXN_KEY = `${networkEnv}.${STORAGE_TXN_KEY}`;
      setStorageItem(TXN_KEY, null);
    }
  }, [isBridgeTxnSuccess]);

  const handleTransfer = () => {
    setShowLoader(true);
    if (requiresApproval) {
      writeApprove?.();
      return;
    }
    // If no approval required, perform bridge directly
    writeBridgeToDeFiChain?.();
  };

  return (
    <>
      {(showLoader || isApproveTxnLoading || isBridgeTxnLoading) && (
        <Modal isOpen={showLoader}>
          <div className="flex flex-col items-center mt-6 mb-14">
            <div className="w-24 h-24 border border-brand-200 border-b-transparent rounded-full animate-spin" />
            <span className="font-bold text-2xl text-dark-900 mt-12">
              Waiting for confirmation
            </span>
            <span className="text-dark-900 mt-2">
              Confirm this transaction in your Wallet.
            </span>
          </div>
        </Modal>
      )}
      {isBridgeTxnSuccess && (
        // TODO: Replace success ui/message
        <Modal isOpen={isBridgeTxnSuccess} onClose={() => router.reload()}>
          <div className="flex flex-col items-center mt-6 mb-14">
            <FiCheck className="text-8xl text-valid ml-1" />
            <span className="font-bold text-2xl text-dark-900 mt-12">
              Transaction confirmed
            </span>
            <span className="text-dark-900 mt-2">
              Funds will be transferred to your DeFiChain wallet shortly.
            </span>
          </div>
        </Modal>
      )}
      {errorMessage && (
        // TODO: Replace error ui/message
        <Modal isOpen={!!errorMessage} onClose={() => router.reload()}>
          <div className="flex flex-col items-center mt-6 mb-14">
            <FiAlertCircle className="text-8xl text-error ml-1" />
            <span className="font-bold text-2xl text-dark-900 mt-12">
              Transaction error
            </span>
            <span className="text-dark-900 mt-2">{errorMessage}</span>
          </div>
        </Modal>
      )}
      <AlertInfoMessage
        message={DISCLAIMER_MESSAGE}
        containerStyle="px-5 py-4 mt-8"
        textStyle="text-xs"
      />
      <div className={clsx("px-6 py-8", "md:px-[72px] md:pt-16")}>
        <ActionButton
          testId="confirm-transfer-btn"
          label={isMobile ? "Confirm transfer" : "Confirm transfer on wallet"}
          onClick={() => handleTransfer()}
          disabled={isBridgeTxnSuccess}
        />
      </div>
      {/* TODO: Update screen shown for successful transfer */}
      {isBridgeTxnSuccess && (
        <div className="flex justify-center items-center text-valid">
          Transfer successful! <FiCheck size={20} className="text-valid ml-1" />
        </div>
      )}
    </>
  );
}
