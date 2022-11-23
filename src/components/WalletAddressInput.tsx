import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import * as ethers from "ethers";
import { fromAddress } from "@defichain/jellyfish-address";
import { FiClipboard } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import useResponsive from "@hooks/useResponsive";

type Blockchain = "Ethereum" | "DeFiChain";
type Network = "mainnet" | "testnet";

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
  const [error, setError] = useState({ message: "", isWarning: false });

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
    if (network === "testnet" && blockchain === "DeFiChain") {
      return `Enter ${blockchainNameMap[blockchain]} (${networkNameMap[network]}) address`;
    }
    return `Enter ${blockchainNameMap[blockchain]} address`;
  };

  /* Validate wallet address input onchange */
  useEffect(() => {
    if (addressInput === "") {
      setIsValidAddress(false);
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput]);

  /* Autoresize the textarea height */
  useEffect(() => {
    if (textAreaRef.current) {
      const currentRef = textAreaRef.current;
      currentRef.style.height = "0px";
      currentRef.style.height = `${currentRef.scrollHeight}px`;
    }
  }, [textAreaRef, addressInput]);

  /* Error and warning messages */
  useEffect(() => {
    const isDeFiChain = blockchain === "DeFiChain";
    if (!isValidAddress && addressInput) {
      const blockchainName = blockchainNameMap[blockchain];
      const dfiNetwork = isDeFiChain ? ` ${networkNameMap[network]}` : "";
      setError({
        message: `Use correct address for ${blockchainName}${dfiNetwork}`,
        isWarning: false,
      });
    } else if (isDeFiChain && network === "testnet") {
      setError({
        message: "Make sure to only use TestNet for testing",
        isWarning: true,
      });
    } else {
      setError({ message: "", isWarning: false });
    }
  }, [addressInput, isValidAddress, blockchain, network]);

  const showBorderError = addressInput && !isValidAddress && !isFocused;
  const showVerifiedBadge = isValidAddress && !isFocused;
  return (
    <>
      <div
        className={clsx(
          "relative min-h-[48px] flex items-center border rounded-[10px] py-2.5 pr-3.5 pl-4 lg:px-5 lg:py-[21px]",
          {
            "bg-dark-100 opacity-30": disabled,
            "border-error": showBorderError,
            "border-transparent dark-bg-gradient-2": isFocused,
            "border-dark-300 hover:border-dark-500": !(
              disabled ||
              showBorderError ||
              isFocused
            ), // Default
          }
        )}
      >
        <FiClipboard
          size={20}
          className={clsx("text-dark-1000 ml-1 mr-4 shrink-0", {
            "cursor-pointer": !disabled,
          })}
          onMouseDown={handlePasteBtnClick}
        />
        {showVerifiedBadge && (
          <AddressWithVerifiedBadge
            value={addressInput}
            onClick={handleFocusWithCursor}
          />
        )}
        <textarea
          ref={textAreaRef}
          className={clsx(
            `bg-transparent focus:outline-none text-dark-1000 lg:text-dark-900 text-sm lg:text-xl grow placeholder:text-sm lg:placeholder:text-xl resize-none`,
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
      {error.message && !disabled && (
        <span
          className={clsx(
            "px-4 lg:px-6 pt-2 text-xs lg:text-sm",
            error.isWarning ? "text-warning" : "text-error"
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
        "w-full bg-transparent focus:outline-none break-all text-dark-1000 lg:text-dark-900 text-sm lg:text-xl mr-10 relative after:absolute",
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
