import BigNumber from "bignumber.js";
import { FiArrowUpRight } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import clsx from "clsx";

import { CONFIRMATIONS_BLOCK_TOTAL } from "../constants";
import ConfirmationProgress from "./TransactionConfirmationProgressBar";
import useResponsive from "../hooks/useResponsive";
import { useContractContext } from "../layouts/contexts/ContractContext";
import ActionButton from "./commons/ActionButton";

export default function TransactionStatus({
  isConfirmed,
  isApiSuccess,
  isReverted,
  numberOfConfirmations,
  txnHash,
  onClose,
}: {
  isConfirmed: boolean;
  isApiSuccess: boolean;
  isReverted: boolean;
  numberOfConfirmations: string;
  txnHash: string | undefined;
  onClose: () => void;
}) {
  const { ExplorerURL } = useContractContext();
  const { isLg, isMd } = useResponsive();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const confirmationBlocksCurrent = BigNumber.min(
    CONFIRMATIONS_BLOCK_TOTAL,
    numberOfConfirmations
  ).toFixed();

  useEffect(() => {
    if (isReverted) {
      setTitle("Transaction reverted");
      setDescription("");
    } else if (isConfirmed) {
      setTitle("Transaction confirmed");
      setDescription("Expect to receive your tokens in your wallet shortly.");
    } else {
      setTitle("Processing transaction");
      setDescription(
        "Do not refresh, leave the browser, or close the tab until transaction is complete. Doing so may interrupt the transaction and cause loss of funds."
      );
    }
  }, [isConfirmed, isReverted]);

  return (
    <div
      className={clsx(
        "flex-1 px-8 py-6 text-dark-1000 rounded-xl border bg-dark-100 ",
        isConfirmed
          ? "border-dark-card-stroke"
          : "dark-bg-gradient-1 border-transparent",
        isMd ? "mb-6" : "m-6",
        { "pr-6": isLg && isConfirmed }
      )}
    >
      {!isLg && (
        <div className="pb-4">
          <ConfirmationProgress
            confirmationBlocksTotal={CONFIRMATIONS_BLOCK_TOTAL}
            confirmationBlocksCurrent={confirmationBlocksCurrent}
            isConfirmed={isConfirmed}
            isApiSuccess={isApiSuccess}
          />
        </div>
      )}
      <div className="flex flex-row items-center">
        <div className="flex-1 flex-col">
          <div className="leading-5 lg:text-xl lg:font-semibold">{title}</div>
          <div className="pt-1 text-sm text-dark-700">{description}</div>
          <div className="flex flex-row items-center mt-2 text-dark-900 text-xl font-bold ">
            <a
              className="flex flex-row items-center hover:opacity-70"
              href={`${ExplorerURL}/tx/${txnHash}`}
              target="_blank"
              rel="noreferrer"
            >
              <FiArrowUpRight size={20} className="mr-2" />
              View on Etherscan
            </a>
            {/* {ethTxnStatus.isConfirmed && (
              <a className="flex flex-row items-center hover:opacity-70 ml-5">
                <IoHelpCircle size={20} className="mr-2" />
                Help
              </a>
            )} */}
          </div>
          {(isConfirmed || isReverted) && !isLg && (
            <ActionButton
              label="Close"
              variant="secondary"
              customStyle="mt-6 dark-section-bg"
              onClick={onClose}
            />
          )}
        </div>
        {isLg && (
          <div className="flex flex-row pl-8">
            <ConfirmationProgress
              confirmationBlocksTotal={CONFIRMATIONS_BLOCK_TOTAL}
              confirmationBlocksCurrent={confirmationBlocksCurrent}
              isConfirmed={isConfirmed}
              isApiSuccess={isApiSuccess}
            />
            {(isConfirmed || isReverted) && (
              <div>
                <IoCloseOutline
                  onClick={onClose}
                  size={20}
                  className="hover:opacity-70 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
