import React, { useEffect, useState, useMemo, PropsWithChildren } from "react";
import useLocalStorage from "@hooks/useLocalStorage";
import useResponsive from "@hooks/useResponsive";
import { useMediaQuery } from "react-responsive";

type ColorScheme = "light" | "dark" | "system";
interface Theme {
  theme: ColorScheme;
  changeCurrentTheme: (theme: ColorScheme) => void;
  isLight: boolean;
}

const ThemeContext = React.createContext<Theme>(undefined as any);

export function useThemeContext(): Theme {
  return React.useContext(ThemeContext);
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const { isLg: isDesktop } = useResponsive();
  const isDarkOS = useMediaQuery({ query: COLOR_SCHEME_QUERY });

  const [localStorageTheme, setLocalStorageTheme] =
    useLocalStorage<ColorScheme>("theme", "dark");
  const [theme, setTheme] = useState<ColorScheme>(localStorageTheme);

  const changeCurrentTheme = (newTheme: ColorScheme) => {
    setLocalStorageTheme(newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    setTheme(!isDesktop ? "system" : localStorageTheme);
  }, [isDesktop, localStorageTheme]);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "system" && !isDarkOS) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme, isDarkOS]);

  const context: Theme = useMemo(
    () => ({
      theme,
      changeCurrentTheme,
      isLight: theme === "light" || (theme === "system" && !isDarkOS),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, isDarkOS]
  );

  return (
    <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
  );
}
