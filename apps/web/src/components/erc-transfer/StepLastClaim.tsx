import clsx from "clsx";
import ActionButton from "@components/commons/ActionButton";

export default function StepLastClaim({
  goToNextStep,
}: {
  goToNextStep: () => void;
}) {
  return (
    <div className={clsx("mt-14 px-6", "md:mt-4 md:px-[73px] md:py-6")}>
      <span className="font-semibold block text-center text-dark-900 tracking-[0.01em] md:tracking-wider text-2xl">
        Ready for claiming
      </span>
      <span className="block text-center text-sm text-dark-900 mt-3 pb-6">
        Your transaction has been verified and is now ready to be transferred to
        destination chain (ERC-20). You will be redirected to your wallet to
        claim your tokens.
      </span>
      <ActionButton label="Claim tokens" onClick={goToNextStep} />
    </div>
  );
}
