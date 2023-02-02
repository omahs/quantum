import { ethers, utils } from "ethers";
import { erc20ABI, useContractReads } from "wagmi";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import clsx from "clsx";
import { useContractContext } from "@contexts/ContractContext";
import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import { setStorageItem } from "@utils/localStorage";
import useResponsive from "@hooks/useResponsive";
import useWriteApproveToken from "@hooks/useWriteApproveToken";
import useWriteBridgeToDeFiChain from "@hooks/useWriteBridgeToDeFiChain";
import AlertInfoMessage from "@components/commons/AlertInfoMessage";
import ActionButton from "@components/commons/ActionButton";
import Modal from "@components/commons/Modal";
import { Erc20Token, TransferData } from "types";
import {
  DISCLAIMER_MESSAGE,
  ETHEREUM_SYMBOL,
  STORAGE_TXN_KEY,
} from "../../constants";

export default function EvmToDeFiChainTransfer({
  data,
}: {
  data: TransferData;
}) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showLoader, setShowLoader] = useState(false);

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

  const {
    isBridgeTxnLoading,
    isBridgeTxnSuccess,
    errorMessage: bridgeErrorMessage,
    refetchBridge,
    requiresApproval,
    writeBridgeToDeFiChain,
  } = useWriteBridgeToDeFiChain({
    receiverAddress: data.to.address,
    transferAmount: data.to.amount,
    tokenName: data.from.tokenName,
    tokenDecimals,
    onBridgeTxnSettled: () => setShowLoader(false),
  });

  const {
    isApproveTxnLoading,
    isApproveTxnSuccess,
    errorMessage: approveErrorMessage,
    refetchedBridgeFn,
    writeApprove,
  } = useWriteApproveToken({
    transferAmount: data.to.amount,
    tokenName: data.from.tokenName as Erc20Token,
    tokenDecimals,
    tokenAllowance,
    refetchBridge,
  });

  useEffect(() => {
    if (bridgeErrorMessage || approveErrorMessage) {
      setErrorMessage(bridgeErrorMessage ?? approveErrorMessage);
    }
  }, [bridgeErrorMessage, approveErrorMessage]);

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
    // If no approval required, perform bridge function directly
    writeBridgeToDeFiChain?.();
  };

  return (
    <>
      {(showLoader || isApproveTxnLoading || isBridgeTxnLoading) &&
        !errorMessage && (
          <Modal isOpen={showLoader}>
            <div className="flex flex-col items-center mt-6 mb-14">
              <div className="w-24 h-24 border border-brand-200 border-b-transparent rounded-full animate-spin" />
              <span className="font-bold text-2xl text-dark-900 mt-12">
                {requiresApproval && !isApproveTxnSuccess
                  ? `Waiting for approval`
                  : `Waiting for confirmation`}
              </span>
              <span className="text-dark-900 mt-2">
                {requiresApproval && !isApproveTxnSuccess
                  ? `Requesting permission to access your ${data.from.tokenName} funds.`
                  : `Confirm this transaction in your Wallet.`}
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
