import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { theme } from "../../tailwind.config";

const useResponsive = () => {
  const [isClient, setIsClient] = useState(false);

  const { screens } = theme;

  const isMobile = useMediaQuery({ maxWidth: screens.xs });

  const isXs = useMediaQuery({ minWidth: screens.xs });

  const isSm = useMediaQuery({ minWidth: screens.sm });

  const isMd = useMediaQuery({ minWidth: screens.md });

  const isLg = useMediaQuery({ minWidth: screens.lg });

  const isXl = useMediaQuery({ minWidth: screens.xl });

  const is2xl = useMediaQuery({ minWidth: screens["2xl"] });

  const is3xl = useMediaQuery({ minWidth: screens["3xl"] });

  useEffect(() => {
    if (typeof window !== "undefined") setIsClient(true);
  }, []);

  type Key = `is${Capitalize<keyof typeof screens>}`;
  /**
   * useMediaQuery is using `window` fn that is only available on the client side,
   * `isClient` condition is added below to prevent `hydration error`.
   * More info: https://nextjs.org/docs/messages/react-hydration-error
   */
  return {
    isClient,
    isMobile: isClient ? isMobile : false,
    isXs: isClient ? isXs : false,
    isSm: isClient ? isSm : false,
    isMd: isClient ? isMd : false,
    isLg: isClient ? isLg : true,
    isXl: isClient ? isXl : true,
    is2xl: isClient ? is2xl : true,
    is3xl: isClient ? is3xl : true,
  } as Record<Key | "isMobile" | "isClient", boolean>;
};

export default useResponsive;
