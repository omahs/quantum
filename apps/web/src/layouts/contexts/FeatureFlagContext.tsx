import {
  getEnvironment,
  FeatureFlag,
  FeatureFlagID,
} from "@waveshq/walletkit-core";
import {
  useGetFeatureFlagsQuery,
  usePrefetch,
} from "@waveshq/walletkit-ui/dist/store";
import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { satisfies } from "semver";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { FeatureFlagPersistence } from "@api/index";

const MAX_RETRY = 3;
export interface FeatureFlagContextI {
  featureFlags: FeatureFlag[];
  enabledFeatures: FeatureFlagID[];
  updateEnabledFeatures: (features: FeatureFlagID[]) => void;
  isFeatureAvailable: (featureId: FeatureFlagID) => boolean;
  isBetaFeature: (featureId: FeatureFlagID) => boolean;
  hasBetaFeatures: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextI>(undefined as any);

export function useFeatureFlagContext(): FeatureFlagContextI {
  return useContext(FeatureFlagContext);
}

export function FeatureFlagProvider(
  props: React.PropsWithChildren<any>
): JSX.Element | null {
  const { network } = useNetworkContext();

  const {
    data: featureFlags = [],
    isLoading,
    isError,
    refetch,
  } = useGetFeatureFlagsQuery(`${network}`);

  const prefetchPage = usePrefetch("getFeatureFlags");

  // TODO hardcoded app version
  const applicationVersion = "1.0.1";
  const appVersion = applicationVersion ?? "0.0.0";
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureFlagID[]>([]);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (isError && retries < MAX_RETRY) {
      setTimeout(() => {
        prefetchPage({});
        setRetries(retries + 1);
      }, 10000);
    } else if (!isError) {
      prefetchPage({});
    }
  }, [isError]);

  useEffect(() => {
    refetch();
  }, [network]);

  function isBetaFeature(featureId: FeatureFlagID): boolean {
    return featureFlags.some(
      (flag: FeatureFlag) =>
        satisfies(appVersion, flag.version) &&
        flag.networks?.includes(network) &&
        flag.id === featureId &&
        flag.stage === "beta"
    );
  }

  function checkFeatureStage(feature: FeatureFlag): boolean {
    switch (feature.stage) {
      case "alpha":
        return getEnvironment(process.env.NODE_ENV).debug;
      case "beta":
        return enabledFeatures.includes(feature.id);
      case "public":
        return true;
      default:
        return false;
    }
  }

  function isFeatureAvailable(featureId: FeatureFlagID): boolean {
    return featureFlags.some((flag: FeatureFlag) => {
      if (flag.networks?.includes(network)) {
        if (process.env) {
          return flag.id === featureId && checkFeatureStage(flag);
        }
        return (
          satisfies(appVersion, flag.version) &&
          flag.id === featureId &&
          checkFeatureStage(flag)
        );
      }
      return false;
    });
  }

  const updateEnabledFeatures = async (
    flags: FeatureFlagID[]
  ): Promise<void> => {
    setEnabledFeatures(flags);
    await FeatureFlagPersistence.set(flags);
  };

  const context = useMemo(
    () => ({
      featureFlags,
      enabledFeatures,
      updateEnabledFeatures,
      isFeatureAvailable,
      isBetaFeature,
      hasBetaFeatures: featureFlags.some(
        (flag) =>
          satisfies(appVersion, flag.version) &&
          flag.networks?.includes(network) &&
          flag.stage === "beta"
      ),
    }),
    [enabledFeatures, featureFlags, appVersion, network]
  );

  useEffect(() => {
    FeatureFlagPersistence.get()
      .then((features) => {
        setEnabledFeatures(features);
      })
      // logger.error
      .catch((err) => console.error(err));
  }, []);

  /*
    Note: return null === app will be stuck at white screen until the feature flags API are applied
  */
  if (isLoading) {
    return null;
  }

  if (isError && !isLoading && retries < MAX_RETRY) {
    return <div />;
  }

  const { children } = props;

  return (
    <FeatureFlagContext.Provider value={context}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function FeatureGate({
  children,
  feature,
}: {
  children: ReactElement;
  feature: FeatureFlagID;
}): JSX.Element | null {
  const { isFeatureAvailable } = useFeatureFlagContext();
  return isFeatureAvailable(feature) ? children : null;
}
