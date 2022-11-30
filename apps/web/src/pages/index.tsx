import BridgeForm from "@components/BridgeForm";
import WelcomeHeader from "@components/WelcomeHeader";

function Home() {
  return (
    <section
      className="relative min-h-screen flex flex-col mt-8 md:mt-7 lg:mt-12"
      data-testid="homepage"
    >
      <div className="flex flex-col md:flex-row w-full px-0 md:px-12 lg:px-[120px]">
        <div className="px-6 pb-6 md:px-0 md:pb-0 md:w-5/12 md:mr-8 lg:mr-[72px]">
          <WelcomeHeader />
        </div>
        <div className="flex-1">
          <BridgeForm />
        </div>
      </div>
    </section>
  );
}

export default Home;
