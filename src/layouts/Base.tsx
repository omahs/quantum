import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  appName,
  longDescription,
  shortDescription,
  siteTitle,
  website,
} from "@components/siteInfo";
import clsx from "clsx";
import { JSX } from "@babel/types";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";

const metamask = new MetaMaskConnector();

const client = createClient(
  getDefaultClient({
    appName,
    connectors: [metamask],
  })
);

function Base({ children }: PropsWithChildren<any>): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={clsx("flex flex-col min-h-screen antialiased")}>
      <Head>
        <base href="/" />
        <meta name="application-name" content={appName} />
        <meta charSet="UTF-8" />
        <title key="title">{siteTitle}</title>
        <meta key="description" name="description" content={longDescription} />
        <meta key="robots" name="robots" content="follow,index" />
        <meta name="googlebot" content="index,follow" />
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          key="apple-mobile-web-app-capable"
          name="apple-mobile-web-app-capable"
          content="yes"
        />
        <meta name="theme-color" content="#5B10FF" />

        <meta name="og:locale" content="en_SG" />
        <meta name="og:title" content={siteTitle} />
        <meta name="og:image" content="/bridge_share.png" />
        <meta name="og:site_name" content={appName} />
        <meta name="og:url" content={website} />
        <meta name="og:description" content={shortDescription} />

        <meta name="twitter:card" content={shortDescription} />
        <meta name="twitter:site" content={website} />
        <meta name="twitter:creator" content="@birthdaydev" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={shortDescription} />
        <meta name="twitter:image" content="/bridge_share.png" />
        <meta name="twitter:image:alt" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" sizes="64x64" href="/favicon-64x64.png" />
      </Head>

      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <main className={clsx("flex-grow")}>{mounted && children}</main>
        </ConnectKitProvider>
      </WagmiConfig>
    </div>
  );
}

export default Base;
