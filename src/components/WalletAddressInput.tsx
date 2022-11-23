import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import * as ethers from "ethers";
import { fromAddress } from "@defichain/jellyfish-address";
import { FiClipboard } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import VerifiedIcon from "./icons/VerifiedIcon";

type Source = "Ethereum" | "DeFiChain";
type Network = "mainnet" | "testnet";

interface Props {
  type: Source;
  networkName?: Network;
  disabled?: boolean;
}

export default function WalletAddressInput({
  type,
  networkName = "mainnet",
  disabled = false,
}: Props): JSX.Element {
  const [addressInput, setAddressInput] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const validateAddressInput = (input: string) => {
    let isValid = false;
    if (type === "Ethereum") {
      isValid = ethers.utils.isAddress(input);
    } else {
      const decodedAddress = fromAddress(input, networkName);
      isValid = decodedAddress !== undefined;
    }
    setIsValidAddress(isValid);
    return isValid;
  };

  const handlePasteBtnClick = async () => {
    const copiedText = await navigator.clipboard.readText();
    setAddressInput(copiedText);
  };

  useEffect(() => {
    if (addressInput === "") {
      setIsValidAddress(false);
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput]);

  useEffect(() => {
    if (textAreaRef.current) {
      const currentRef = textAreaRef.current;
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      currentRef.style.height = "0px";
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      currentRef.style.height = `${currentRef.scrollHeight}px`;
    }
  }, [textAreaRef, addressInput]);

  const hasError = addressInput && !isValidAddress && !isFocused;

  const handleFocusWithCursor = () => {
    const textArea = textAreaRef.current;
    const cursorPosition = addressInput.length;
    setIsFocused(true);
    setTimeout(() => {
      if (textArea) {
        textArea.setSelectionRange(cursorPosition, cursorPosition);
        textArea.focus();
      }
    }, 1);
  };

  // useEffect(() => {
  //   if (isFocused) {
  //     const cursorPosition = addressInput.length;
  //     textAreaRef.current?.setSelectionRange(cursorPosition, cursorPosition);
  //     textAreaRef.current?.focus();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isFocused]);

  return (
    <>
      <div
        className={clsx(
          "relative min-h-[48px] w-[335px] flex items-center py-2.5 pr-3.5 pl-4 border rounded-[10px]",
          { "bg-dark-100 opacity-30": disabled, "border-error": hasError },
          isFocused
            ? "border-transparent dark-bg-gradient-2"
            : "border-dark-300"
        )}
      >
        <FiClipboard
          size={20}
          className={clsx("text-dark-1000 mr-4 shrink-0", {
            "cursor-pointer": !disabled,
          })}
          onClick={handlePasteBtnClick}
        />
        {isValidAddress && !isFocused && (
          // {/* GHOST DIV */}
          // eslint-disable-next-line
          <div
            className={clsx(
              "bg-transparent text-dark-1000 text-sm focus:outline-none break-all mr-9",
              "after:content-[url('/verified-20x20.svg')] after:absolute after:ml-1"
              // { hidden: !(isValidAddress && !isFocused) }
            )}
            onClick={() => {
              // console.log("current:", textAreaRef.current);
              // textAreaRef.current?.focus();
              // setIsFocused(true);
              handleFocusWithCursor();
              // TODO: Set cursor to end
            }}
          >
            {addressInput}
          </div>
        )}
        <textarea
          ref={textAreaRef}
          spellCheck={false}
          className={clsx(
            `bg-transparent text-dark-1000 text-sm focus:outline-none grow  placeholder:text-sm resize-none after:content-['haluu***']`,
            { hidden: isValidAddress && !isFocused },
            disabled
              ? "placeholder:text-dark-1000"
              : "placeholder:text-dark-500"
          )}
          placeholder={
            type === "Ethereum"
              ? "Enter ERC20 addressyy"
              : "Enter DeFiChain addressyy"
          }
          value={addressInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          disabled={disabled}
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
      <br />
      <div
        className={clsx(
          "h-12 w-[335px] flex items-center py-2.5 pr-3.5 pl-4 border rounded-[10px]",
          { "bg-dark-100 opacity-30": disabled, "border-error": hasError },
          isFocused
            ? "border-transparent dark-bg-gradient-2"
            : "border-dark-300"
        )}
      >
        <input
          className={clsx(
            "h-full bg-transparent text-dark-1000 text-sm focus:outline-none grow  placeholder:text-sm overflow-ellipsis",
            disabled
              ? "placeholder:text-dark-1000"
              : "placeholder:text-dark-500"
          )}
          type="text"
          placeholder={
            type === "Ethereum"
              ? "Enter ERC20 address"
              : "Enter DeFiChain address"
          }
          value={addressInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setAddressInput(e.target.value)}
          disabled={disabled}
        />
        {isValidAddress && <VerifiedIcon className="ml-1" />}
        <div className="ml-4 p-2">
          {addressInput ? (
            <IoCloseCircle
              size={20}
              className="fill-dark-500 cursor-pointer"
              onClick={() => setAddressInput("")}
            />
          ) : (
            <FiClipboard
              size={20}
              className={clsx("text-dark-1000", {
                "cursor-pointer": !disabled,
              })}
              onClick={handlePasteBtnClick}
            />
          )}
        </div>
      </div>
    </>
  );
}
