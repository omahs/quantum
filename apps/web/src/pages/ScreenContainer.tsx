import Footer from "@components/Footer";
import Header from "@components/Header";
import clsx from "clsx";
import Maintenance from "./Maintenance";

export default function ScreenContainer({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  // TODO update logic when endpoint is ready
  const isMaintenanceEnabled = false;
  const bgPicture = isMaintenanceEnabled
    ? "bg-[url('/background/error_mobile.png')] md:bg-[url('/background/error_tablet.png')] lg:bg-[url('/background/error_desktop.png')]"
    : "bg-[url('/background/mobile.png')] md:bg-[url('/background/tablet.png')] lg:bg-[url('/background/desktop.png')]";

  return (
    <div className="relative">
      <Header />
      <div className="relative z-[1] flex-grow md:pb-28">
        {isMaintenanceEnabled ? <Maintenance /> : <main>{children}</main>}
      </div>
      <div
        className={clsx(
          "absolute top-0 left-0 z-auto h-full w-full bg-cover bg-local bg-clip-padding bg-top bg-no-repeat bg-origin-padding mix-blend-screen lg:bg-center",
          bgPicture
        )}
      />
      <Footer />
    </div>
  );
}
