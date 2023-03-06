import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { UseQuery } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { QueryDefinition } from "@reduxjs/toolkit/dist/query/react";
import { useNetworkEnvironmentContext } from "@contexts/NetworkEnvironmentContext";
import BASE_URLS, { DEFICHAIN_WALLET_URL } from "../config/networkUrl";

/**
 * Wrapper for UseQuery function to inject NetworkEnvironmentContext and pass in `baseUrl` based on the current network
 * @param query
 * @param useDefiChainBase
 */
const useWrappedQuery = <U, V extends BaseQueryFn, W>(
  query: UseQuery<QueryDefinition<U, V, never, W, string>>,
  useDefiChainBase: boolean = false
): ReturnType<UseQuery<QueryDefinition<U, V, never, W, string>>> => {
  // what sould i do here ?

  const { data } = query;
  const { networkEnv } = useNetworkEnvironmentContext();

  const fetchWrapper = async (args) =>
    query({
      baseUrl: useDefiChainBase ? DEFICHAIN_WALLET_URL : BASE_URLS[networkEnv],
      ...args,
    });

  // return [refetchWrapper, result, lastPromiseInfo];

  return [fetchWrapper, data];
};

export default useWrappedQuery;
