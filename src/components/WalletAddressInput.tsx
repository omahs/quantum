import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import * as ethers from "ethers";
import { fromAddress } from "@defichain/jellyfish-address";
import { FiClipboard } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";

type Blockchain = "Ethereum" | "DeFiChain";
type Network = "mainnet" | "testnet";

interface Props {
  blockchain: Blockchain;
  networkName?: Network;
  disabled?: boolean;
}

export default function WalletAddressInput({
  blockchain,
  networkName = "mainnet",
  disabled = false,
}: Props): JSX.Element {
  const [addressInput, setAddressInput] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const validateAddressInput = (input: string): void => {
    let isValid = false;
    if (blockchain === "Ethereum") {
      isValid = ethers.utils.isAddress(input);
    } else {
      const decodedAddress = fromAddress(input, networkName);
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
    const networkNameMap: Record<Network, string> = {
      mainnet: "MainNet",
      testnet: "TestNet",
    };
    const blockchainName: Record<Blockchain, string> = {
      DeFiChain: "DeFiChain",
      Ethereum: "ERC20",
    };
    return `Enter ${blockchainName[blockchain]} (${networkNameMap[networkName]}) address`;
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

  const hasError = addressInput && !isValidAddress && !isFocused;
  const showVerifiedBadge = isValidAddress && !isFocused;
  return (
    <div
      className={clsx(
        "relative min-h-[48px] w-[335px] flex items-center py-2.5 pr-3.5 pl-4 border rounded-[10px]",
        { "bg-dark-100 opacity-30": disabled, "border-error": hasError },
        isFocused ? "border-transparent dark-bg-gradient-2" : "border-dark-300"
      )}
    >
      <FiClipboard
        size={20}
        className={clsx("text-dark-1000 mr-4 shrink-0", {
          "cursor-pointer": !disabled,
        })}
        onClick={handlePasteBtnClick}
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
          `bg-transparent text-dark-1000 text-sm focus:outline-none grow  placeholder:text-sm resize-none`,
          { hidden: showVerifiedBadge },
          disabled ? "placeholder:text-dark-1000" : "placeholder:text-dark-500"
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
          className="fill-dark-500 cursor-pointer ml-4 shrink-0"
          onMouseDown={() => {
            setAddressInput("");
            handleFocusWithCursor();
          }}
        />
      )}
    </div>
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
  return (
    // eslint-disable-next-line
    <div
      className={clsx(
        "bg-transparent text-dark-1000 text-sm focus:outline-none break-all mr-9",
        "after:content-[url('/verified-20x20.svg')] after:absolute after:ml-1"
      )}
      onClick={() => onClick()}
    >
      {value}
    </div>
  );
}
