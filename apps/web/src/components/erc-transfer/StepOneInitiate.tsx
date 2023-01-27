import clsx from "clsx";
import { useState } from "react";
import IconTooltip from "@components/commons/IconTooltip";
import ActionButton from "@components/commons/ActionButton";
import { useNetworkContext } from "@contexts/NetworkContext";
import { Network } from "types";
import { useAccount } from "wagmi";
import WalletAddressInputField from "@components/WalletAddressInputField";
import { TRANSACTION_ERROR_INFO } from "../../constants";

export default function StepOneInitiate({
  goToNextStep,
}: {
  goToNextStep: () => void;
}) {
  const { selectedNetworkA } = useNetworkContext();
  const { isConnected } = useAccount();

  const [addressInput, setAddressInput] = useState<string>("");
  const [hasAddressInputErr, setHasAddressInputErr] = useState<boolean>(false);

  return (
    <div className={clsx("flex flex-col mt-6", "md:flex-row md:gap-7 md:mt-4")}>
      <div className="flex flex-col justify-center grow">
        <span className="font-semibold tracking-wider text-dark-900">
          Getting started
        </span>
        <p className={clsx("text-sm text-dark-900 mt-1", "md:mt-2")}>
          Transactions on-chain are irreversible. Ensure your transaction
          details are correct and funds are sent in a single transaction, with a
          stable network connection.
        </p>
        <p
          className={clsx(
            "text-sm text-dark-900 mt-1 relative",
            "md:block md:mt-2 hidden"
          )}
        >
          Provide your DeFiChain wallet address below in the event that there is
          a need for a refund.
        </p>
        <div className="absolute md:bottom-[202px] md:left-[180px] hidden md:block">
          <IconTooltip
            title={TRANSACTION_ERROR_INFO.title}
            content={TRANSACTION_ERROR_INFO.content}
            customIconColor="text-dark-900"
          />
        </div>

        {/* Mobile view */}
        <p
          className={clsx(
            "text-sm text-dark-900 items-center md:hidden block",
            "md:mt-2"
          )}
        >
          Provide your DeFiChain wallet address below in the event that there is
          a need for a refund.
          <div className="ml-auto md:hidden block">
            <IconTooltip
              title={TRANSACTION_ERROR_INFO.title}
              content={TRANSACTION_ERROR_INFO.content}
              customIconColor="text-dark-900"
            />
          </div>
        </p>

        <WalletAddressInputField
          label=""
          blockchain={selectedNetworkA.name as Network}
          addressInput={addressInput}
          onAddressInputChange={(addrInput) => setAddressInput(addrInput)}
          onAddressInputError={(hasError) => setHasAddressInputErr(hasError)}
          disabled={!isConnected}
        />
        <div className="pt-5">
          <ActionButton
            label="Continue"
            variant="primary"
            needsResponsiveSizing={false}
            disabled={hasAddressInputErr}
            onClick={goToNextStep}
          />
        </div>
      </div>
    </div>
  );
}
