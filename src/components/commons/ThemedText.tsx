import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  color?: string;
  textStyle?: string;
}

export default function ThemedText({
  children,
  color,
  textStyle = "",
}: Props): JSX.Element {
  const isLight = false; // TODO: Get mode from context
  const defaultColor = isLight ? "text-light-1000" : "text-dark-1000";
  return (
    <span className={clsx(color ?? defaultColor, textStyle)}>{children}</span>
  );
}
