import Footer from "@components/Footer";
import Header from "@components/Header";
import { FaReddit, FaGithub, FaTwitter } from "react-icons/fa";

export default function Maintenance(): JSX.Element {
  return (
    <div className="relative">
      <Header />
      <div className="relative z-[1] flex-grow">
        <section
          className="relative mt-8 flex min-h-screen flex-col md:mt-7 lg:mt-12"
          data-testid="homepage"
        >
          <div className="flex flex-col md:flex-row w-full px-0 md:px-12 lg:px-[120px]">
            <div className="flex flex-col justify-between px-6 pb-6 md:px-0 md:pb-0 md:w-6/12 md:mr-8 lg:mr-[72px]">
              <div>
                <div className="text-[16px] lg:text-[16px] leading-4 lg:leading-[16px] text-error tracking-[0.04em] pb-2">
                  SCHEDULED MAINTENANCE
                </div>
                <h1 className="text-[32px] leading-[44px] text-dark-1000 lg:text-[52px] lg:leading-[52px]">
                  Bridge is currently closed
                </h1>
                <div className="mt-2 pb-12">
                  <div className="align-middle text-base text-dark-700 lg:text-xl w-11/12 ">
                    There are regular checks to maintain performance standards
                    on the Bridge. Please try again after some time. For any
                    immediate concerns or status updates, consult the following
                    links:
                  </div>
                </div>
                <div>
                  <div className="flex flex-col space-y-6 md:mt-5">
                    <button
                      type="button"
                      className="flex flex-row items-center"
                    >
                      <FaGithub size={18} className="text-dark-700" />
                      <span className="ml-2 text-base font-semibold text-dark-700">
                        Twitter (Birthday Research)
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-row items-center"
                    >
                      <FaTwitter size={18} className="text-dark-700" />
                      <span className="ml-2 text-base font-semibold text-dark-700">
                        Github (Birthday Research)
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-row items-center"
                    >
                      <FaReddit size={18} className="text-dark-700" />
                      <span className="ml-2 text-base font-semibold text-dark-700">
                        Reddit (r/defiblockchain)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className="absolute top-0 left-0 z-auto h-full w-full bg-cover bg-local bg-clip-padding bg-top bg-no-repeat bg-origin-padding mix-blend-screen md:bg-[url('/background/maintenance_tablet.png')] bg-[url('/background/maintenance_mobile.png')] lg:bg-[url('/background/maintenance_desktop.png')] lg:bg-center" />
      <Footer />
    </div>
  );
}
