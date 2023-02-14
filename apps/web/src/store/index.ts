import { configureStore } from "@reduxjs/toolkit";
import {
  block,
  ocean,
  announcementWebsiteSlice,
  statusWebsiteSlice,
} from "@waveshq/walletkit-ui/dist/store";

/**
 * RootState for DeFiChain Wallet App
 *
 * All state reducer in this store must be designed for global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState.
 *
 * Non-global state should be managed independently within its own React Component.
 */
export function initializeStore() {
  return configureStore({
    reducer: {
      block: block.reducer,
      ocean: ocean.reducer,
      [announcementWebsiteSlice.reducerPath]: announcementWebsiteSlice.reducer,
      [statusWebsiteSlice.reducerPath]: statusWebsiteSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(announcementWebsiteSlice.middleware)
        .concat(statusWebsiteSlice.middleware),
  });
}

export type RootStore = ReturnType<typeof initializeStore>;
export type RootState = ReturnType<RootStore["getState"]>;
