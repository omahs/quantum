import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  textStyle?: string;
}

export default function ThemedText({
  children,
  textStyle = "",
}: Props): JSX.Element {
  const isLight = false; // TODO: Get mode from context
  const textColor = isLight ? "text-dark-900" : "text-light-50";

  return <span className={clsx(textColor, textStyle)}>{children}</span>;
}
