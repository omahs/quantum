import BigNumber from "bignumber.js";

export default function TransactionStatus({
  ethTxnStatus,
}: {
  ethTxnStatus: {
    isConfirmed: boolean;
    numberOfConfirmations: string;
  };
}) {
  return (
    <div className="w-full text-dark-1000">
      <div>Processing Transaction</div>
      <div>
        Do not refresh, leave the browser, or close the tab until transaction is
        complete. Doing so may interrupt the transaction and cause loss of
        funds.
      </div>
      <div>{`${
        new BigNumber(ethTxnStatus.numberOfConfirmations).isGreaterThan(65)
          ? "65"
          : ethTxnStatus.numberOfConfirmations
      } of 65 Confirmations`}</div>
    </div>
  );
}
