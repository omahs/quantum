import clsx from "clsx";
import React, { PropsWithChildren, useState } from "react";

interface Props {
  content: string;
  containerClass?: string;
  disableTooltip?: boolean;
}

export default function Tooltip({
  content,
  children,
  containerClass = "",
  disableTooltip = false,
}: PropsWithChildren<Props>): JSX.Element {
  let timeout: NodeJS.Timeout;
  const [active, setActive] = useState<boolean>(false);

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, 300);
  };

  const hideTooltip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  return (
    // eslint-disable-next-line
    <div
      className={clsx(
        "inline-block relative p-1 rounded-full",
        { "hover:bg-dark-200 active:dark-btn-pressed": !disableTooltip },
        containerClass
      )}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseDown={hideTooltip}
    >
      {children}
      {!disableTooltip && active && (
        <div
          className={`absolute left-1/2 -top-8 -translate-x-1/2 z-[100] rounded-lg px-3 py-1 text-dark-00 bg-dark-1000 text-sm whitespace-nowrap
          before:absolute before:left-1/2 before:top-[20%] before:rotate-45 before:-z-[1] before:rounded-[1px] before:h-0 before:w-0 before:-ml-2.5
          before:border-[10.5px] before:border-transparent before:bg-dark-1000 before:border-t-dark-1000`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
