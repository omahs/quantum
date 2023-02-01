import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bridgeApi = createApi({
  reducerPath: "website",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.BRIDGE_API_URL || "http://localhost:5741/defichain",
  }),
  endpoints: (builder) => ({
    generateAddress: builder.mutation<{ address: string }, any>({
      query: ({ network }) => ({
        url: "/wallet/generate-address",
        params: { network },
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json; charset=UTF-8",
        },
      }),
      extraOptions: { maxRetries: 3 },
    }),
  }),
});

const { useGenerateAddressMutation } = bridgeApi;

export { useGenerateAddressMutation };
