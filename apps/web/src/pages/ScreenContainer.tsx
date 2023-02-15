import Footer from "@components/Footer";
import Header from "@components/Header";
import Maintenance from "./Maintenance";

export default function ScreenContainer({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  // TODO update logic when endpoint is ready
  const isMaintenanceEnabled = false;

  return (
    <div>
      {isMaintenanceEnabled ? (
        <Maintenance />
      ) : (
        <div className="relative">
          <Header />
          <main className="relative z-[1] flex-grow md:pb-28">{children}</main>
          <div className="absolute top-0 left-0 z-auto h-full w-full bg-[url('/background/mobile.png')] bg-cover bg-local bg-clip-padding bg-top bg-no-repeat bg-origin-padding mix-blend-screen md:bg-[url('/background/tablet.png')] lg:bg-[url('/background/desktop.png')] lg:bg-center" />
          <Footer />
        </div>
      )}
    </div>
  );
}
