import BigNumber from "bignumber.js";
import { useEffect } from "react";
import { useBalance } from "wagmi";

// TODO: Find a way to clear interval when confirm modal is displayed (Lyka)

const BALANCE_INTERVAL_MS = 10000;

interface WagmiBalance {
  address: `0x${string}`;
  tokenAddress?: `0x${string}`;
}

export default function useCustomWagmiBalance({
  address,
  tokenAddress,
}: WagmiBalance): BigNumber {
  const { data, refetch } = useBalance({
    address,
    ...(tokenAddress && { token: tokenAddress }),
  });
  const balance = new BigNumber(data?.formatted ?? 0);

  let pollBalance;
  useEffect(() => {
    pollBalance = setInterval(() => {
      refetch();
    }, BALANCE_INTERVAL_MS);

    return () => {
      if (pollBalance !== undefined) {
        clearInterval(pollBalance);
      }
    };
  }, []);

  return balance;
}
