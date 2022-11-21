import useResponsive from "@hooks/useResponsive";

function Home() {
  // TODO: Remove this here
  const { isMobile } = useResponsive();
  return (
    <section
      className="relative min-h-screen flex flex-col bg-light-00 dark:bg-dark-00"
      data-testid="homepage"
    >
      <h1 className="text-light-1000 dark:text-dark-1000">
        {isMobile
          ? "DeFiChain ERC-20 Bridge Mobile"
          : "DeFiChain ERC-20 Bridge"}
      </h1>
    </section>
  );
}

export default Home;
