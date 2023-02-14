import secureLocalStorage from "react-secure-storage";
import { FeatureFlagID } from "@waveshq/walletkit-core";

const KEY = "BRIDGE.ENABLED_FEATURES";

async function set(features: FeatureFlagID[] = []): Promise<void> {
  await secureLocalStorage.setItem(KEY, JSON.stringify(features));
}

async function get(): Promise<FeatureFlagID[]> {
  const features = (await secureLocalStorage.getItem(KEY)) ?? "[]";
  return JSON.parse(features.toLocaleString());
}

// eslint-disable-next-line import/prefer-default-export
export const FeatureFlagPersistence = {
  set,
  get,
};
