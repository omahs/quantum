import { PropsWithChildren, useMemo } from "react";
import { Provider } from "react-redux";
import { initializeStore } from "@store/index";

/**
 * Store that is memoized to network & wallets setting.
 */

export default function StoreProvider(
  props: PropsWithChildren<any>
): JSX.Element {
  const { children } = props;

  const store = useMemo(() => initializeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
