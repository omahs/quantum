import { FiInfo, FiBook, FiHelpCircle } from "react-icons/fi";

export default function WelcomeHeader() {
  return (
    <div>
      <h1 className="text-dark-1000 text-[32px] lg:text-[44px] leading-[44px] lg:leading-[60px]">
        Welcome to
      </h1>
      <h1 className="text-dark-1000 text-[32px] lg:text-[44px] leading-[44px] lg:leading-[60px]">
        DeFiChain Bridge
      </h1>
      <div className="mt-2">
        <span className="text-dark-700 text-base lg:text-xl align-middle">
          A secure and easy way to transfer tokens wrapped by DeFiChain
          Consortium
        </span>
        <button type="button" className="align-middle ml-1">
          <FiInfo size={16} className="text-dark-700" />
        </button>
      </div>
      <div className="hidden md:block">
        <div className="flex flex-row items-center md:mt-5">
          <button type="button" className="flex flex-row items-center">
            <FiBook size={20} className="text-dark-700" />
            <span className="ml-2 text-base text-dark-700">User Guide</span>
          </button>
          <button type="button" className="flex flex-row items-center ml-6">
            <FiHelpCircle size={20} className="text-dark-700" />
            <span className="ml-2 text-base text-dark-700">FAQs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
