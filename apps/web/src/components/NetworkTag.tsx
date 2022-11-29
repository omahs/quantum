import clsx from "clsx";
import { EnvironmentNetwork } from "types";

export default function NetworkTag({
  network,
}: {
  network: EnvironmentNetwork;
}): JSX.Element {
  return (
    <div className="flex items-center h-7 rounded-[37px] dark-section-bg border border-dark-card-stroke px-2 py-1 lg:px-3 lg:py-2 ml-2">
      <div
        className={clsx(
          "w-2 h-2 rounded-full mr-1",
          network === "mainnet" ? "bg-valid" : "bg-warning"
        )}
      />
      <span className="text-dark-1000 text-2xs font-bold tracking-[0.08em] uppercase">
        {network}
      </span>
    </div>
  );
}
