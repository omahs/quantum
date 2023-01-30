import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import * as ethers from "ethers";
import { useAccount } from "wagmi";
import { IoCloseCircle } from "react-icons/io5";
import { fromAddress } from "@defichain/jellyfish-address";
import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import useResponsive from "@hooks/useResponsive";
import useAutoResizeTextArea from "@hooks/useAutoResizeTextArea";
import { Network, NetworkName } from "types";

interface Props {
  blockchain: Network;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  addressInput: string;
  onAddressInputChange: (address: string) => void;
  onAddressInputError: (hasError: boolean) => void;
}

/**
 * Displays wallet address with verified badge
 * Acts like a 'clone' for textarea, since ::after pseudo doesnt work for textarea
 * When displayed, textarea is hidden
 */
export function VerifiedBadge({
  value,
  onClick,
}: {
  value: string;
  onClick: () => void;
}): JSX.Element {
  const { isLg } = useResponsive();
  return (
    <div
      role="button"
      className={clsx(
        "relative mr-10 w-full break-all bg-transparent text-sm text-dark-1000 after:absolute focus:outline-none",
        isLg
          ? "after:-bottom-2 after:ml-1 after:content-[url('/verified-24x24.svg')]"
          : "after:ml-1 after:content-[url('/verified-20x20.svg')]"
      )}
      onClick={() => onClick()}
      onKeyDown={() => {}}
      tabIndex={0}
    >
      {value}
    </div>
  );
}

// TODO @chloe reused existing component WalletAddressInput
export default function WalletAddressInputField({
  blockchain,
  label,
  disabled = false,
  readOnly = false,
  addressInput,
  onAddressInputChange,
  onAddressInputError,
}: Props): JSX.Element {
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholder, setPlaceholder] = useState<string>("");
  const [copiedFromClipboard, setCopiedFromClipboard] = useState(false);

  const { isConnected } = useAccount();
  const { networkEnv, networkEnvDisplayName } = useNetworkEnvironmentContext();
  useAutoResizeTextArea(textAreaRef.current, [addressInput, placeholder]);

  const validateAddressInput = (input: string): void => {
    let isValid = false;
    if (blockchain === Network.Ethereum) {
      isValid = ethers.utils.isAddress(input);
    } else {
      const decodedAddress = fromAddress(input, networkEnv);
      isValid = decodedAddress !== undefined;
    }
    setIsValidAddress(isValid);
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
    }, 0);
  };

  useEffect(() => {
    const displayedName = NetworkName[blockchain];
    if (networkEnv === "testnet" && blockchain === Network.DeFiChain) {
      setPlaceholder(
        `Enter ${displayedName} (${networkEnvDisplayName}) address`
      );
    } else {
      setPlaceholder(`Enter ${displayedName} address`);
    }
  }, [blockchain, networkEnv, isConnected]);

  useEffect(() => {
    if (addressInput === "") {
      setIsValidAddress(false);
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput, networkEnv, blockchain]);

  useEffect(() => {
    onAddressInputError(!addressInput || !isValidAddress);
  }, [addressInput, isValidAddress, blockchain, networkEnv]);

  useEffect(() => {
    if (copiedFromClipboard) {
      setTimeout(() => setCopiedFromClipboard(false), 2000);
    }
  }, [copiedFromClipboard]);

  const showErrorBorder = addressInput && !isValidAddress;
  const showVerifiedBadge = isValidAddress && !isFocused;
  return (
    <>
      {/* Address label */}
      <div className="h-5 group relative mb-2 flex items-center ">
        <span className="pl-5 text-xs font-semibold xl:tracking-wider text-dark-900">
          {label}
        </span>
      </div>

      {/* Main wallet input container */}
      <div
        className={clsx(
          "relative flex min-h-[48px] items-center rounded-lg border py-2.5 pr-3.5 pl-4",
          {
            "bg-dark-100 opacity-30": disabled,
            "border-error": showErrorBorder,
            "before:dark-gradient-2 z-0 border-transparent before:-inset-[1px] before:rounded-lg before:p-px":
              isFocused && !showErrorBorder,
            "border-dark-300 hover:border-dark-500": !(
              disabled ||
              showErrorBorder ||
              isFocused
            ),
            "pointer-events-none": readOnly,
          }
        )}
      >
        {/* Copy of textarea */}
        {showVerifiedBadge && (
          <VerifiedBadge value={addressInput} onClick={handleFocusWithCursor} />
        )}

        {/* Textarea input */}
        <textarea
          ref={textAreaRef}
          className={clsx(
            `w-full max-h-36 grow resize-none bg-transparent text-sm tracking-[0.01em] text-dark-1000 placeholder:text-sm focus:outline-none`,
            { hidden: showVerifiedBadge },
            isFocused
              ? "placeholder:text-dark-300"
              : "placeholder:text-dark-500"
          )}
          placeholder={placeholder}
          value={addressInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onAddressInputChange(e.target.value)}
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
            className="ml-4 mr-1 shrink-0 cursor-pointer fill-dark-500"
            onMouseDown={() => {
              onAddressInputChange("");
              handleFocusWithCursor();
            }}
          />
        )}
      </div>
    </>
  );
}
