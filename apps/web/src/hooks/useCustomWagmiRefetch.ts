import { useCallback, useEffect, useRef } from "react";

/**
 * Triggers `refetch` action manually every <n interval> time.
 * Use this hook instead of setting property `watch: true` on any Wagmi hook that polls data.
 * Should reduce chances of reaching rpc url's rate limit
 */

const POLL_INTERVAL = 10000; // 10 secs

export default function useCustomWagmiRefetch(
  refetch: () => void,
  { enabled = true, interval = POLL_INTERVAL }
) {
  const intervalRefID = useRef<any>(null);

  const startIntervalRefetch = useCallback(() => {
    intervalRefID.current = setInterval(() => {
      refetch();
    }, interval);
  }, []);

  const stopIntervalRefetch = useCallback(() => {
    clearInterval(intervalRefID.current);
    intervalRefID.current = null;
  }, []);

  useEffect(() => {
    if (enabled) {
      startIntervalRefetch();
    } else {
      stopIntervalRefetch();
    }

    return () => clearInterval(intervalRefID?.current);
  }, [enabled]);

  return { startIntervalRefetch, stopIntervalRefetch };
}
