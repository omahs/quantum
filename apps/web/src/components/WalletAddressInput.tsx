import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import * as ethers from "ethers";
import { FiClipboard } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import { fromAddress } from "@defichain/jellyfish-address";
import useResponsive from "@hooks/useResponsive";
import useAutoResizeTextArea from "@hooks/useAutoResizeTextArea";
import { Blockchain, Network } from "types";
import Tooltip from "./commons/Tooltip";
import NetworkTag from "./NetworkTag";

interface Props {
  blockchain: Blockchain;
  network?: Network;
  disabled?: boolean;
}

const networkNameMap: Record<Network, string> = {
  mainnet: "MainNet",
  testnet: "TestNet",
};
const blockchainNameMap: Record<Blockchain, string> = {
  DeFiChain: "DeFiChain",
  Ethereum: "ERC20",
};

export default function WalletAddressInput({
  blockchain,
  network = "mainnet",
  disabled = false,
}: Props): JSX.Element {
  const [addressInput, setAddressInput] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState({ message: "", isError: false });

  const { isSm } = useResponsive();
  useAutoResizeTextArea(textAreaRef.current, addressInput);

  const validateAddressInput = (input: string): void => {
    let isValid = false;
    if (blockchain === "Ethereum") {
      isValid = ethers.utils.isAddress(input);
    } else {
      const decodedAddress = fromAddress(input, network);
      isValid = decodedAddress !== undefined;
    }
    setIsValidAddress(isValid);
  };

  const handlePasteBtnClick = async () => {
    if (disabled) return;
    const copiedText = await navigator.clipboard.readText();
    setAddressInput(copiedText);
  };

  const handleFocusWithCursor = () => {
    setIsFocused(true);
    setTimeout(() => {
      // Only added timeout for ref's unexplained delay
      const textArea = textAreaRef.current;
      const cursorPosition = addressInput.length;
      if (textArea) {
        textArea.setSelectionRange(cursorPosition, cursorPosition);
        textArea.focus();
      }
    }, 1);
  };

  const getPlaceholder = () => {
    const displayedName = blockchainNameMap[blockchain];
    if (network === "testnet" && blockchain === "DeFiChain") {
      return `Enter ${displayedName} (${networkNameMap[network]}) address`;
    }
    return `Enter ${displayedName} address`;
  };

  useEffect(() => {
    if (addressInput === "") {
      setIsValidAddress(false);
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput]);

  useEffect(() => {
    let message: string;
    const isDeFiChain = blockchain === "DeFiChain";
    const hasInvalidInput = !!(addressInput && !isValidAddress);
    if (hasInvalidInput) {
      const dfiNetwork = isDeFiChain ? ` ${networkNameMap[network]}` : "";
      message = `Use correct address for ${blockchainNameMap[blockchain]}${dfiNetwork}`;
    } else {
      const isTestnet = isDeFiChain && network === "testnet";
      message = isTestnet ? "Make sure to only use TestNet for testing" : "";
    }
    setError({ message, isError: hasInvalidInput });
  }, [addressInput, isValidAddress, blockchain, network]);

  const showErrorBorder = addressInput && !isValidAddress && !isFocused;
  const showVerifiedBadge = isValidAddress && !isFocused;
  return (
    <>
      {/* Address label */}
      <div className="flex items-center mb-2 lg:mb-3">
        <span className="text-xs lg:text-base font-semibold">Address</span>
        {blockchain === "DeFiChain" && <NetworkTag network={network} />}
      </div>

      {/* Main wallet input container */}
      <div
        className={clsx(
          "relative min-h-[48px] flex items-center border rounded-[10px] py-2.5 pr-3.5 pl-4 lg:px-5 lg:py-[21px]",
          {
            "bg-dark-100 opacity-30": disabled,
            "border-error": showErrorBorder,
            "z-0 border-transparent before:dark-gradient-2 before:p-px before:rounded-[10px] before:-inset-[1px]":
              isFocused,
            "border-dark-300 hover:border-dark-500": !(
              disabled ||
              showErrorBorder ||
              isFocused
            ),
          }
        )}
      >
        {/* Paste icon with tooltip */}
        <Tooltip
          content="Paste from clipboard"
          containerClass={clsx("mr-3 lg:mr-6 shrink-0", {
            "cursor-pointer hover:bg-dark-200 active:dark-btn-pressed":
              !disabled,
          })}
          disableTooltip={disabled || !isSm} // Disable tooltip for mobile
        >
          <FiClipboard
            size={20}
            className="text-dark-1000"
            onMouseDown={handlePasteBtnClick}
          />
        </Tooltip>

        {/* Copy of textarea */}
        {showVerifiedBadge && (
          <AddressWithVerifiedBadge
            value={addressInput}
            onClick={handleFocusWithCursor}
          />
        )}

        {/* Textarea input */}
        <textarea
          ref={textAreaRef}
          className={clsx(
            `max-h-36 bg-transparent focus:outline-none text-dark-1000 text-sm lg:text-xl grow placeholder:text-sm lg:placeholder:text-xl resize-none`,
            { hidden: showVerifiedBadge },
            isFocused
              ? "placeholder:text-dark-300"
              : "placeholder:text-dark-500"
          )}
          placeholder={getPlaceholder()}
          value={addressInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          disabled={disabled}
          spellCheck={false}
        />

        {/* Clear icon */}
        {((isFocused && addressInput) || (addressInput && !isValidAddress)) && (
          <IoCloseCircle
            size={20}
            className="fill-dark-500 cursor-pointer ml-4 mr-1 shrink-0"
            onMouseDown={() => {
              setAddressInput("");
              handleFocusWithCursor();
            }}
          />
        )}
      </div>

      {/* Error and warning messages */}
      {error.message && !disabled && (
        <span
          className={clsx(
            "px-4 lg:px-6 pt-2 text-xs lg:text-sm",
            error.isError ? "text-error" : "text-warning"
          )}
        >
          {error.message}
        </span>
      )}
    </>
  );
}

/**
 * Displays wallet address with verified badge
 * Acts like a 'clone' for textarea, since ::after pseudo doesnt work for textarea
 * When displayed, textarea is hidden
 */
function AddressWithVerifiedBadge({
  value,
  onClick,
}: {
  value: string;
  onClick: () => void;
}): JSX.Element {
  const { isLg } = useResponsive();
  return (
    // eslint-disable-next-line
    <div
      className={clsx(
        "w-full bg-transparent focus:outline-none break-all text-dark-1000 text-sm lg:text-xl mr-10 relative after:absolute",
        isLg
          ? "after:content-[url('/verified-24x24.svg')] after:ml-2 after:-bottom-1"
          : "after:content-[url('/verified-20x20.svg')] after:ml-1"
      )}
      onClick={() => onClick()}
    >
      {value}
    </div>
  );
}
