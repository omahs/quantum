import clsx from "clsx";
import { useEnvironmentNetworkContext } from "@contexts/EnvironmentNetworkContext";

export default function EnvironmentNetworkSwitch(): JSX.Element {
  const { network, updateNetwork } = useEnvironmentNetworkContext();

  const handleOnClick = () => {
    const newNetwork = network === "mainnet" ? "testnet" : "mainnet";
    updateNetwork(newNetwork);
  };

  return (
    <button
      type="button"
      className="flex items-center rounded-[37px] dark-section-bg border border-dark-card-stroke px-2 py-1 lg:px-3 lg:py-2 ml-2"
      onClick={handleOnClick}
    >
      <div
        className={clsx(
          "w-2 h-2 rounded-full mr-1",
          network === "mainnet" ? "bg-valid" : "bg-warning"
        )}
      />
      <span className="text-dark-1000 text-2xs font-bold tracking-[0.08em] uppercase">
        {network}
      </span>
    </button>
  );
}
