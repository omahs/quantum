import "../styles/globals.scss";
import NextNProgress from "nextjs-progressbar";
import { ThemeProvider } from "@contexts/ThemeProvider";
import Base from "../layouts/Base";

export default function BridgeApp({ Component, pageProps }): JSX.Element {
  return (
    <ThemeProvider>
      <Base {...pageProps}>
        <NextNProgress
          startPosition={0.3}
          stopDelayMs={200}
          showOnShallow
          color="#5B10FF"
          height={4}
          options={{ showSpinner: false }}
        />
        <Component {...pageProps} />
      </Base>
    </ThemeProvider>
  );
}
