import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import { useConfirmEthTxnMutation } from "@store/website";
import { getStorageItem } from "@utils/localStorage";
import { HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import useBridgeFormStorageKeys from "./useBridgeFormStorageKeys";

/**
 * This polls in the /handle-transaction to verify if txn is confirmed (>= 65 confirmations)
 */
export default function useWatchEthTxn() {
  const { networkEnv } = useNetworkEnvironmentContext();

  const [ethTxnStatus, setEthTxnStatus] = useState<{
    isConfirmed: boolean;
    numberOfConfirmations: string;
  }>({ isConfirmed: false, numberOfConfirmations: "0" });
  const [txnHash, setTxnHash] = useState<string | undefined>(undefined);

  const { TXN_HASH_KEY } = useBridgeFormStorageKeys();
  const [confirmEthTxn] = useConfirmEthTxnMutation();

  /* Poll to check if the txn is already confirmed */
  useEffect(() => {
    const pollConfirmEthTxn = async function poll() {
      const txnHashStorage = getStorageItem<string>(TXN_HASH_KEY) ?? undefined;
      setTxnHash(txnHashStorage);

      try {
        if (txnHashStorage === undefined) {
          return;
        }

        const data = await confirmEthTxn({
          txnHash: txnHashStorage,
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
      setTimeout(pollConfirmEthTxn, 5000);
    };
    pollConfirmEthTxn();
  }, [networkEnv]);

  return { ethTxnStatus, txnHash };
}
