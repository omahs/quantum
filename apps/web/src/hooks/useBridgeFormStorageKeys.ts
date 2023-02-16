import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import {
  STORAGE_TXN_KEY,
  STORAGE_DFC_ADDR_KEY,
  STORAGE_TXN_HASH_KEY,
} from "../constants";

export default function useBridgeFormStorageKeys() {
  const { networkEnv } = useNetworkEnvironmentContext();

  // Local storage txn key grouped by network
  const TXN_HASH_KEY = `${networkEnv}.${STORAGE_TXN_HASH_KEY}`;
  const TXN_KEY = `${networkEnv}.${STORAGE_TXN_KEY}`;
  const DFC_ADDR_KEY = `${networkEnv}.${STORAGE_DFC_ADDR_KEY}`;
  return {
    TXN_HASH_KEY,
    TXN_KEY,
    DFC_ADDR_KEY,
  };
}
