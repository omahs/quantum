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
  const defaultColor = "text-light-1000 dark:text-dark-1000";
  return (
    <span className={clsx(color ?? defaultColor, textStyle)}>{children}</span>
  );
}
