import ActionButton from "./ActionButton";
import Modal from "./Modal";

export interface ModalConfigType {
  title: string;
  message: string;
  primaryButtonLabel: string;
  onPrimaryButtonClick: () => void;
  secondaryButtonLabel: string;
  onSecondaryButtonClick: () => void;
}

export default function UtilityModal({
  title,
  message,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
}: ModalConfigType) {
  return (
    <Modal isOpen>
      <div className="flex flex-col items-center mt-6 mb-14">
        <span className="font-bold text-lg lg:text-2xl text-dark-900 text-center">
          {title}
        </span>
        <div className="text-sm md:text-lg leading-5 md:leading-6 w-full text-dark-900 text-center mt-2 px-[29px]">
          {message}
        </div>
        <span className="mt-[76px] w-full max-w-[231px] md:max-w-[316px]">
          <ActionButton
            label={primaryButtonLabel}
            responsiveStyle="text-base py-3 md:px-6 lg:px-8 xl:px-14"
            customStyle="bg-error"
            onClick={onPrimaryButtonClick}
          />
          <ActionButton
            label={secondaryButtonLabel}
            variant="secondary"
            responsiveStyle="text-base py-3 mt-2 md:px-2.5 lg:px-8 xl:px-14 "
            customStyle="border-[0.5px] border-dark-500"
            onClick={onSecondaryButtonClick}
          />
        </span>
      </div>
    </Modal>
  );
}
