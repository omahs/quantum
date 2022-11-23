import WalletAddressInput from "@components/WalletAddressInput";
import useResponsive from "@hooks/useResponsive";

function Home() {
  // TODO: Remove this here
  const { isMobile } = useResponsive();
  return (
    <section
      className="relative min-h-screen flex flex-col bg-dark-00 p-2 lg:p-10 text-dark-1000"
      data-testid="homepage"
    >
      <h1 className="text-dark-1000">
        {isMobile
          ? "DeFiChain ERC-20 Bridge Mobile"
          : "DeFiChain ERC-20 Bridge"}
      </h1>
      {/* TODO: Remove test wallet input here */}
      <div className="p-4 sm:w-1/2 border border-dark-100 rounded-lg bg-[#0E0E0E]">
        <WalletAddressInput blockchain="DeFiChain" />
        <br />
        <WalletAddressInput blockchain="Ethereum" />
        <br />
        <WalletAddressInput blockchain="DeFiChain" network="testnet" />
        <br />
        <br />
        /* Disabled */
        <WalletAddressInput blockchain="Ethereum" network="testnet" disabled />
        <br />
        <WalletAddressInput blockchain="DeFiChain" network="testnet" disabled />
      </div>
    </section>
  );
}

export default Home;
