import Header from "@components/Header";
import useResponsive from "@hooks/useResponsive";

function Home() {
  // TODO: Remove this here
  const { isMobile } = useResponsive();
  return (
    <section
      className="relative min-h-screen flex flex-col bg-dark-900"
      data-testid="homepage"
    >
      <Header />
      <h1 className="text-light-50">
        {isMobile
          ? "DeFiChain ERC-20 Bridge Mobile"
          : "DeFiChain ERC-20 Bridge"}
      </h1>
    </section>
  );
}

export default Home;
