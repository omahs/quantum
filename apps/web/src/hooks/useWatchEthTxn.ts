import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import { useTransactionHashContext } from "@contexts/TransactionHashContext";
import { useConfirmEthTxnMutation } from "@store/website";
import { HttpStatusCode } from "axios";
import { useEffect, useState } from "react";

/**
 * This polls in the /handle-transaction to verify if txn is confirmed (>= 65 confirmations)
 */
export default function useWatchEthTxn() {
  const { networkEnv } = useNetworkEnvironmentContext();
  const { txnHash } = useTransactionHashContext();

  const [ethTxnStatus, setEthTxnStatus] = useState<{
    isConfirmed: boolean;
    numberOfConfirmations: string;
  }>({ isConfirmed: false, numberOfConfirmations: "0" });

  const [confirmEthTxn] = useConfirmEthTxnMutation();

  /* Poll to check if the txn is already confirmed */
  useEffect(() => {
    const pollConfirmEthTxn = async function poll() {
      try {
        if (txnHash.unconfirmed === undefined) {
          return;
        }

        const data = await confirmEthTxn({
          txnHash: txnHash.unconfirmed,
        }).unwrap();

        if (data) {
          setEthTxnStatus({
            isConfirmed: data?.isConfirmed,
            numberOfConfirmations: data?.numberOfConfirmations,
          });
        }
      } catch ({ data }) {
        if (data?.statusCode === HttpStatusCode.TooManyRequests) {
          //   handle throttle error;
        }
      }
      setTimeout(pollConfirmEthTxn, 20000);
    };
    pollConfirmEthTxn();
  }, [networkEnv, txnHash]);

  return { ethTxnStatus };
}
