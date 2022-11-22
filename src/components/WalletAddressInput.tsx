import { useEffect, useState } from "react";
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
}

export default function WalletAddressInput({
  type,
  networkName = "mainnet",
}: Props): JSX.Element {
  const [addressInput, setAddressInput] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const handlePasteBtnClick = () => {};

  useEffect(() => {
    if (addressInput === "") {
      setIsValidAddress(false);
      return;
    }
    validateAddressInput(addressInput);
  }, [addressInput]);

  return (
    <div
      className={clsx(
        "h-12 w-[335px] flex items-center py-2.5 pr-3.5 pl-4 border rounded-[10px]",
        isFocused ? "border-transparent dark-bg-gradient-2" : "border-dark-300"
      )}
    >
      <input
        className="h-full bg-transparent text-dark-1000 text-sm focus:outline-none grow placeholder:text-dark-500 placeholder:text-sm overflow-ellipsis"
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
            className="text-dark-1000 cursor-pointer"
            onClick={handlePasteBtnClick}
          />
        )}
      </div>
    </div>
  );
}
