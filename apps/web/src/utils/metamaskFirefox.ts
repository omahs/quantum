/**
 * Firefox Metamask Hack
 * Due to https://github.com/MetaMask/metamask-extension/issues/3133
 * Copied workaround from https://github.com/MetaMask/metamask-extension/issues/3133#issuecomment-1025641185
 */
import { WindowPostMessageStream } from "@metamask/post-message-stream";
import { initializeProvider } from "@metamask/providers";

export default function setupFirefoxMetamaskConnection() {
  if (window.ethereum) {
    return;
  }
  if (navigator.userAgent.includes("Firefox")) {
    // Setup background connection
    const metamaskStream = new WindowPostMessageStream({
      name: "metamask-inpage",
      target: "metamask-contentscript",
    });

    // This will initialize the provider and set it as window.ethereum
    initializeProvider({
      connectionStream: metamaskStream as any,
      shouldShimWeb3: true,
    });
  }
}
