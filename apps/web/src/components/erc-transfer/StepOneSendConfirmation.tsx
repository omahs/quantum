import clsx from "clsx";
import { useState, useEffect, useCallback } from "react";
import { FiCopy } from "react-icons/fi";
import QRCode from "react-qr-code";
import useCopyToClipboard from "@hooks/useCopyToClipboard";
import useResponsive from "@hooks/useResponsive";
import { getStorageItem, setStorageItem } from "@utils/localStorage";
import AlertInfoMessage from "@components/commons/AlertInfoMessage";
import Tooltip from "@components/commons/Tooltip";
import UtilityButton from "@components/commons/UtilityButton";
import { useGenerateAddressMutation } from "@store/website";
import AddressError from "@components/commons/AddressError";
import TimeLimitCounter from "./TimeLimitCounter";
import { DISCLAIMER_MESSAGE, STORAGE_DFC_ADDR_KEY } from "../../constants";

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function ConfirmButton({
  onConfirm,
  disabled = false,
}: {
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <UtilityButton
      label="Confirm send"
      onClick={onConfirm}
      disabled={disabled}
      withArrowIcon
    />
  );
}

function SuccessCopy({
  containerClass,
  show,
}: {
  containerClass: string;
  show: boolean;
}) {
  return (
    <div
      className={clsx(
        "absolute md:w-full md:text-center",
        show ? "opacity-100" : "opacity-0",
        containerClass
      )}
    >
      <span className="rounded bg-valid px-2 py-1 text-2xs text-dark-00  transition duration-300 md:text-xs">
        Copied to clipboard
      </span>
    </div>
  );
}

export default function StepOneSendConfirmation({
  goToNextStep,
}: {
  goToNextStep: () => void;
}) {
  const [dfcUniqueAddress, setDfcUniqueAddress] = useState<string>("");
  const [showSuccessCopy, setShowSuccessCopy] = useState(false);
  const [hasTimeElapsed, setHasTimeElapsed] = useState(false);

  const [throttleError, setThrottleError] = useState("");
  const [generateAddress] = useGenerateAddressMutation();
  const { isMobile } = useResponsive();
  const { copy } = useCopyToClipboard();

  const handleConfirmClick = () => {
    goToNextStep();
  };

  const handleOnCopy = (text) => {
    copy(text);
    setShowSuccessCopy(true);
  };

  const generateDfcUniqueAddress = useCallback(
    debounce(async () => {
      const localDfcAddress = getStorageItem<string>(STORAGE_DFC_ADDR_KEY);
      if (localDfcAddress) {
        setDfcUniqueAddress(localDfcAddress);
      } else {
        generateAddress({})
          .unwrap()
          .then((data) => {
            setStorageItem<string>(STORAGE_DFC_ADDR_KEY, data.address);
            setDfcUniqueAddress(data.address);
            setThrottleError("");
          })
          .catch(({ data }) => {
            if (data?.statusCode === 429) {
              setThrottleError(data.message);
            }
            setDfcUniqueAddress("");
          });
      }
    }, 200),
    []
  );

  const handleGenerateNewDfcAddress = async () => {
    await generateDfcUniqueAddress();
    setHasTimeElapsed(false);
  };

  useEffect(() => {
    generateDfcUniqueAddress();
  }, []);

  useEffect(() => {
    if (showSuccessCopy) {
      setTimeout(() => setShowSuccessCopy(false), 2000);
    }
  }, [showSuccessCopy]);

  return (
    <div className={clsx("flex flex-col mt-6", "md:flex-row md:gap-7 md:mt-4")}>
      <div
        className={clsx(
          "w-full flex flex-row gap-4 order-1 mt-8",
          "md:w-2/5 md:flex-col md:shrink-0 md:gap-3 md:order-none md:border-[0.5px] border-dark-200 rounded md:px-5 md:pt-4 md:pb-3 md:mt-0",
          { "justify-center": hasTimeElapsed }
        )}
      >
        {throttleError !== "" ? (
          <AddressError
            error={throttleError}
            onClick={async () => generateDfcUniqueAddress()}
          />
        ) : (
          <div>
            {hasTimeElapsed ? (
              <AddressError
                error="Address has expired and is now unavailable for use."
                onClick={async () => handleGenerateNewDfcAddress()}
              />
            ) : (
              <>
                {dfcUniqueAddress !== "" && (
                  <div className="w-[164px] h-[164px] bg-dark-1000 p-0.5 md:rounded">
                    <QRCode value={dfcUniqueAddress} size={160} />
                  </div>
                )}
                <div className="flex flex-col">
                  <div
                    className={clsx(
                      "text-xs font-semibold text-dark-700 text-left",
                      "md:text-center md:mt-3"
                    )}
                  >
                    Unique DFC address
                  </div>
                  <Tooltip
                    content="Click to copy address"
                    containerClass={clsx("relative pt-0 mt-1", {
                      "cursor-default": isMobile,
                    })}
                    disableTooltip={isMobile}
                  >
                    <button
                      type="button"
                      className={clsx(
                        "text-sm text-dark-900 text-left break-all focus-visible:outline-none",
                        "md:text-xs md:text-center md:cursor-pointer md:hover:underline"
                      )}
                      onClick={() =>
                        !isMobile && handleOnCopy(dfcUniqueAddress)
                      }
                    >
                      {dfcUniqueAddress}
                    </button>
                    {!isMobile && (
                      <SuccessCopy
                        containerClass="bottom-11"
                        show={showSuccessCopy}
                      />
                    )}
                  </Tooltip>
                  {isMobile && (
                    <>
                      <button
                        type="button"
                        className="relative flex items-center text-dark-700 active:text-dark-900 mt-2"
                        onClick={() => handleOnCopy(dfcUniqueAddress)}
                      >
                        <FiCopy size={16} className="mr-2" />
                        <span className="text-sm font-semibold">
                          Copy address
                        </span>
                        <SuccessCopy
                          containerClass="bottom-7"
                          show={showSuccessCopy}
                        />
                      </button>
                      {!hasTimeElapsed && (
                        <TimeLimitCounter
                          onTimeElapsed={() => setHasTimeElapsed(true)}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center grow">
        <span className="font-semibold tracking-wider text-dark-900">
          Transfer DFC tokens
        </span>
        <p className={clsx("text-sm text-dark-700 mt-1", "md:mt-2")}>
          Send your DFC tokens to the unique DFC address to start the withdrawal
          process. This address is only valid for 30 minutes.
        </p>
        {!isMobile && !hasTimeElapsed && (
          <TimeLimitCounter onTimeElapsed={() => setHasTimeElapsed(true)} />
        )}

        <div className={clsx("hidden mt-12", "md:block")}>
          {/* Web confirm button */}
          <ConfirmButton
            onConfirm={handleConfirmClick}
            disabled={hasTimeElapsed}
          />
        </div>
      </div>

      <div className={clsx("order-last pt-6", "md:hidden")}>
        <AlertInfoMessage
          message={DISCLAIMER_MESSAGE}
          containerStyle="px-5 py-4"
          textStyle="text-xs"
        />
        <div className={clsx("px-6 pt-12", "md:px-0")}>
          {/* Mobile confirm button */}
          <ConfirmButton
            onConfirm={handleConfirmClick}
            disabled={hasTimeElapsed}
          />
        </div>
      </div>
    </div>
  );
}
