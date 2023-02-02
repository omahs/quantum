import clsx from "clsx";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { NetworkName, RowDataI, TransferData } from "types";
import { useNetworkContext } from "@contexts/NetworkContext";
import useDisableEscapeKey from "@hooks/useDisableEscapeKey";
import truncateTextFromMiddle from "@utils/textHelper";
import IconTooltip from "@components/commons/IconTooltip";
import Modal from "@components/commons/Modal";
import NumericFormat from "@components/commons/NumericFormat";
import BrLogoIcon from "@components/icons/BrLogoIcon";
import DeFiChainToERC20Transfer from "@components/erc-transfer/DeFiChainToERC20Transfer";
import EvmToDeFiChainTransfer from "@components/erc-transfer/EvmToDeFiChainTransfer";
import { CONSORTIUM_INFO, FEES_INFO } from "../constants";

function RowData({
  data,
  label,
  networkLabel,
  isSendingToDFC = true,
}: {
  data: RowDataI;
  label: string;
  networkLabel: string;
  isSendingToDFC?: boolean;
}) {
  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-semibold tracking-wide text-dark-500">
          {label}
        </span>
        <Image
          width={100}
          height={100}
          src={data.networkIcon}
          alt={data.networkName}
          className={clsx("block w-7 h-7", "md:hidden md:w-9 md:h-9")}
        />
        <hr className="w-full border-dark-200" />
      </div>
      <div className={clsx("flex gap-4 py-6", "md:gap-2 md:py-4")}>
        <Image
          width={100}
          height={100}
          src={data.networkIcon}
          alt={data.networkName}
          className={clsx(
            "hidden w-7 h-7 ml-2",
            "md:block md:w-9 md:h-9 md:ml-0"
          )}
        />
        <div className={clsx("flex flex-col w-1/2", "md:grow md:w-auto")}>
          <span
            className={clsx(
              "text-sm text-dark-900 !leading-5 break-all",
              "md:text-base md:break-normal"
            )}
          >
            {data.address}
          </span>
          <span
            className={clsx("text-xs text-dark-700 mt-1", "md:text-sm md:mt-0")}
          >
            {networkLabel} {isSendingToDFC ? `(${data.networkName})` : ""}
          </span>
        </div>
        <div
          className={clsx(
            "flex flex-col self-center w-1/2",
            "md:self-end md:w-auto"
          )}
        >
          <span
            className={clsx(
              "!text-xl font-bold leading-6 text-right",
              "md:text-lg md:font-semibold",
              data.amount.isPositive() ? "text-valid" : "text-error"
            )}
          >
            {data.amount.toFixed(2)}
          </span>
          <div className="flex items-center justify-end gap-1">
            <Image
              width={100}
              height={100}
              src={data.tokenIcon}
              alt={data.tokenName}
              className={clsx(
                "w-5 h-5 order-last",
                "md:w-4 md:h-4 md:order-none"
              )}
            />
            <span className="text-sm text-dark-700 mt-0.5 md:mt-0">
              {data.tokenName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmTransferModal({
  show,
  onClose,
  amount,
  fromAddress,
  toAddress,
}: {
  show: boolean;
  onClose: () => void;
  amount: string;
  fromAddress: string;
  toAddress: string;
}) {
  const {
    selectedNetworkA,
    selectedTokensA,
    selectedNetworkB,
    selectedTokensB,
  } = useNetworkContext();
  useDisableEscapeKey(show);

  // Direction of transfer
  const isSendingToDFC = selectedNetworkB.name === NetworkName.DeFiChain;

  const data: TransferData = {
    from: {
      address: (isSendingToDFC ? fromAddress : "DeFiChain address") as string,
      networkName: NetworkName[selectedNetworkA.name],
      networkIcon: selectedNetworkA.icon,
      tokenName: selectedTokensA.tokenA.name,
      tokenIcon: selectedTokensA.tokenA.icon,
      amount: new BigNumber(amount).negated(),
    },
    to: {
      address: toAddress,
      networkName: NetworkName[selectedNetworkB.name],
      networkIcon: selectedNetworkB.icon,
      tokenName: selectedTokensB.tokenA.name,
      tokenIcon: selectedTokensB.tokenA.icon,
      amount: new BigNumber(amount),
    },
  };

  // TODO: Replace with real address
  const consortiumAddress = "df10szLaksgysjl088man5vfmsm6wsstquabds9123";

  return (
    <Modal title="Transfer" isOpen={show} onClose={onClose}>
      <RowData
        data={data.from}
        label="FROM"
        networkLabel="Source"
        isSendingToDFC={isSendingToDFC}
      />
      <RowData data={data.to} label="TO" networkLabel="Destination" />
      <div className="w-full border-t border-t-dark-200 md:mt-3" />

      {/* Fees */}
      <div className="flex justify-between mt-6 md:mt-5 py-2">
        <div className="inline-flex items-center">
          <span className="text-dark-700 text-sm md:text-base">Fees</span>
          <div className="ml-2">
            <IconTooltip
              title={FEES_INFO.title}
              content={FEES_INFO.content}
              position="right"
            />
          </div>
        </div>
        <NumericFormat
          className="text-right text-dark-900 tracking-[0.01em] md:tracking-normal"
          value={0}
          decimalScale={2}
          thousandSeparator
          suffix=" DFI" // TODO: Create hook to get fee based on source/destination
        />
      </div>

      {/* Consortium */}
      <div className="flex justify-between items-baseline mt-4 md:mt-2 py-2">
        <div className="inline-flex items-center">
          <span className="text-dark-700 text-sm md:text-base">Consortium</span>
          <div className="ml-2">
            <IconTooltip
              title={CONSORTIUM_INFO.title}
              content={CONSORTIUM_INFO.content}
              position="right"
            />
          </div>
        </div>
        {/* TODO: Add link to Scan once available */}
        <div>
          <span className="text-right text-dark-900 tracking-[0.01em] md:tracking-normal">
            {truncateTextFromMiddle(consortiumAddress, 8)}
          </span>
          <div className="flex items-center mt-2 md:mt-1">
            <BrLogoIcon />
            <span className="text-xs md:text-sm text-dark-700 ml-2">
              Birthday Research
            </span>
          </div>
        </div>
      </div>

      {isSendingToDFC ? (
        <EvmToDeFiChainTransfer data={data} />
      ) : (
        <DeFiChainToERC20Transfer />
      )}
    </Modal>
  );
}
