import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  color?: string;
  textStyle?: string;
}

export default function ThemedText({
  children,
  color = "1000",
  textStyle = "",
}: Props): JSX.Element {
  const isLight = false; // TODO: Get mode from context
  const textColor = isLight ? `text-light-${color}` : `text-dark-${color}`;
  return <span className={clsx(textColor, textStyle)}>{children}</span>;
}
