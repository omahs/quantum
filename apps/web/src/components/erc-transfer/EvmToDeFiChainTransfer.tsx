import { ethers, utils } from "ethers";
import { erc20ABI, useContractReads } from "wagmi";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useContractContext } from "@contexts/ContractContext";
import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import useResponsive from "@hooks/useResponsive";
import useWriteApproveToken from "@hooks/useWriteApproveToken";
import useWriteBridgeToDeFiChain from "@hooks/useWriteBridgeToDeFiChain";
import AlertInfoMessage from "@components/commons/AlertInfoMessage";
import ActionButton from "@components/commons/ActionButton";
import ErrorModal from "@components/commons/ErrorModal";
import Modal from "@components/commons/Modal";
import { Erc20Token, TransferData } from "types";
import { useTransactionHashContext } from "@contexts/TransactionHashContext";
import useBridgeFormStorageKeys from "@hooks/useBridgeFormStorageKeys";
import { setStorageItem } from "@utils/localStorage";
import {
  BridgeStatus,
  DISCLAIMER_MESSAGE,
  ETHEREUM_SYMBOL,
} from "../../constants";

export default function EvmToDeFiChainTransfer({
  data,
  onClose,
}: {
  data: TransferData;
  onClose: () => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [hasPendingTx, setHasPendingTx] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>(
    BridgeStatus.NoTxCreated
  );

  const { isMobile } = useResponsive();
  const { networkEnv } = useNetworkEnvironmentContext();
  const { BridgeV1, Erc20Tokens, ExplorerURL } = useContractContext();
  const sendingFromETH = data.from.tokenName === ETHEREUM_SYMBOL;
  const { setTxnHash } = useTransactionHashContext();
  const { TXN_KEY } = useBridgeFormStorageKeys();

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

  const {
    eventError,
    isBridgeTxnLoading,
    isBridgeTxnCreated,
    refetchBridge,
    writeBridgeToDeFiChain,
    transactionHash,
  } = useWriteBridgeToDeFiChain({
    receiverAddress: data.to.address,
    transferAmount: data.to.amount,
    tokenName: data.from.tokenName as Erc20Token,
    tokenDecimals,
    onBridgeTxnSettled: () => setHasPendingTx(false),
  });

  const {
    isApproveTxnLoading,
    isApproveTxnSuccess,
    refetchedBridgeFn,
    writeApprove,
  } = useWriteApproveToken({
    tokenName: data.from.tokenName as Erc20Token,
    setErrorMessage,
    refetchBridge,
  });

  useEffect(() => {
    if (transactionHash !== undefined) {
      setTxnHash("unconfirmed", transactionHash);
      setTxnHash("confirmed", null);
      setTxnHash("reverted", null);
      setStorageItem(TXN_KEY, null);
      onClose();
    }
  }, [transactionHash]);

  // Requires approval for more allowance
  useEffect(() => {
    if (eventError?.customErrorDisplay === "InsufficientAllowanceError") {
      setRequiresApproval(true);
    }
  }, [eventError?.customErrorDisplay]);

  // Consolidate all the possible status of the txn before its tx hash is created
  useEffect(() => {
    let status = BridgeStatus.NoTxCreated;

    if ((hasPendingTx && requiresApproval) || isApproveTxnLoading) {
      status = BridgeStatus.IsTokenApprovalInProgress;
    } else if (
      eventError !== undefined &&
      eventError?.customErrorDisplay !== "InsufficientAllowanceError"
    ) {
      setErrorMessage(eventError.message);
    } else if (hasPendingTx) {
      status = BridgeStatus.IsBridgeToDfcInProgress;
    } else if (isApproveTxnSuccess && requiresApproval) {
      status = BridgeStatus.IsTokenApproved;
    } else if (!isApproveTxnSuccess && requiresApproval) {
      status = BridgeStatus.IsTokenRejected;
    }

    setBridgeStatus(status);
  }, [
    hasPendingTx,
    isApproveTxnLoading,
    isApproveTxnSuccess,
    isBridgeTxnLoading,
    isBridgeTxnCreated,
    requiresApproval,
    transactionHash,
    networkEnv,
    eventError,
  ]);

  useEffect(() => {
    // Trigger `bridgeToDeFiChain` once allowance is approved
    const hasEnoughAllowance = data.to.amount.lte(tokenAllowance);
    const successfulApproval =
      requiresApproval && isApproveTxnSuccess && refetchedBridgeFn;

    if (successfulApproval && hasEnoughAllowance) {
      setRequiresApproval(false);
      writeBridgeToDeFiChain?.();
    } else if (successfulApproval && !hasEnoughAllowance) {
      writeApprove?.();
    }
  }, [isApproveTxnSuccess, tokenAllowance, refetchedBridgeFn]);

  const handleInitiateTransfer = () => {
    setErrorMessage(undefined);
    setHasPendingTx(true);
    if (requiresApproval) {
      writeApprove?.();
      return;
    }
    // If no approval required, perform bridge function directly
    writeBridgeToDeFiChain?.();
  };

  return (
    <>
      {errorMessage !== undefined && (
        <ErrorModal
          title="Transaction error"
          message={errorMessage}
          primaryButtonLabel={
            transactionHash ? "View on Etherscan" : "Try again"
          }
          onPrimaryButtonClick={() =>
            transactionHash
              ? window.open(`${ExplorerURL}/tx/${transactionHash}`, "_blank")
              : handleInitiateTransfer()
          }
        />
      )}

      {bridgeStatus === BridgeStatus.IsTokenApprovalInProgress && (
        <Modal isOpen>
          <div className="flex flex-col items-center mt-6 mb-14">
            <div className="w-24 h-24 border border-brand-200 border-b-transparent rounded-full animate-spin" />
            <span className="font-bold text-2xl text-dark-900 mt-12">
              Waiting for approval
            </span>
            <span className="text-dark-900 mt-2">
              {`Requesting permission to access your ${data.from.tokenName} funds.`}
            </span>
          </div>
        </Modal>
      )}

      {bridgeStatus === BridgeStatus.IsBridgeToDfcInProgress && (
        <Modal isOpen>
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

      <AlertInfoMessage
        message={DISCLAIMER_MESSAGE}
        containerStyle="px-5 py-4 mt-8"
        textStyle="text-xs"
      />
      <div className={clsx("px-6 py-8", "md:px-[72px] md:pt-16")}>
        <ActionButton
          testId="confirm-transfer-btn"
          label={isMobile ? "Confirm transfer" : "Confirm transfer on wallet"}
          onClick={() => handleInitiateTransfer()}
          disabled={
            hasPendingTx ||
            (writeApprove === undefined && writeBridgeToDeFiChain === undefined)
          }
        />
      </div>
    </>
  );
}
