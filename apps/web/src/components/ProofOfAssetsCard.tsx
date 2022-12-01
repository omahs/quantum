import BigNumber from "bignumber.js";
import Image from "next/image";
import { FiInfo } from "react-icons/fi";
import { TokenDetailI } from "types";
import { truncateTextFromMiddle } from "@utils/textHelper";
import { useNetworkContext } from "@contexts/NetworkContext";
import useResponsive from "@hooks/useResponsive";
import ProgressBar from "./commons/ProgressBar";
import NumericFormat from "./commons/NumericFormat";
import BrLogo from "./icons/BrLogo";

const asset = {
  walletAddress: "0xaab27b150451726ecsds38aa1d0a94505c8729bd1",
  dailyLimit: 25,
  usedLimit: 12.675,
};

export default function ProofOfAssetsCard() {
  const { isLg } = useResponsive();
  const { selectedTokensA, selectedTokensB } = useNetworkContext();
  const limitPercentage = new BigNumber(asset.usedLimit)
    .dividedBy(asset.dailyLimit)
    .multipliedBy(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN);

  return (
    <div className="relative w-full dark-card-bg-image rounded-lg lg:rounded-xl border border-dark-200 backdrop-blur-[18px] px-6 pt-6 lg:px-8 lg:pt-8">
      <span className="block text-lg lg:text-2xl font-semibold leading-6 lg:leading-9 tracking-wide text-dark-900">
        Proof of assets
      </span>
      <div className="text-xs lg:text-sm text-valid">
        {truncateTextFromMiddle(asset.walletAddress, isLg ? 16 : 10)}
      </div>
      <div className="flex items-center mt-5 lg:mt-6">
        <span className="text-xs lg:text-sm font-semibold lg:tracking-wide text-dark-700">
          TOKEN SUPPLY
        </span>
        <button type="button" className="ml-2">
          {/* TODO: Disply token supply info onclick */}
          <FiInfo size={16} className="text-dark-700" />
        </button>
      </div>
      <div className="flex flex-wrap gap-3 lg:gap-2 mt-2">
        <TokenSupplyItem token={selectedTokensA.tokenA} />
        <TokenSupplyItem token={selectedTokensB.tokenA} />
      </div>
      <div className="mt-5 lg:mt-6">
        <div className="flex items-center mb-2">
          <span className="text-xs lg:text-sm font-semibold lg:tracking-wide text-dark-700">
            DAILY LIMIT
          </span>
          <button type="button" className="ml-2">
            {/* TODO: Disply daily limit info onclick */}
            <FiInfo size={16} className="text-dark-700" />
          </button>
        </div>
        <ProgressBar progressPercentage={limitPercentage} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm lg:text-base text-dark-900">
          {`${asset.usedLimit} ${selectedTokensA.tokenA.symbol} (${limitPercentage}%)`}
        </span>
        <span className="text-sm lg:text-base text-dark-700">
          {`/${asset.dailyLimit} ${selectedTokensA.tokenA.symbol}`}
        </span>
      </div>
      <div className="flex items-center rounded-b-lg lg:rounded-b-xl dark-bg-card-section -mx-6 mt-4 lg:-mx-8 lg:mt-6 px-6 pt-4 pb-5 lg:px-8 lg:py-5">
        <span className="text-xs text-dark-700 mr-2 lg:mr-3">Backed by</span>
        <BrLogo size={isLg ? 20 : 14} />
      </div>
    </div>
  );
}

function TokenSupplyItem({ token }: { token: TokenDetailI }) {
  return (
    <div className="flex flex-row items-center min-w-[45%] 2xl:min-w-[30%]">
      <Image
        width={100}
        height={100}
        src={token.icon}
        alt={token.name}
        className="w-5 h-5 lg:w-6 lg:h-6"
      />
      <NumericFormat
        className="text-left text-dark-900 lg:text-lg leading-5 lg:leading-6 tracking-[0.01em] lg:tracking-normal ml-2 lg:ml-1"
        value={token.supply}
        decimalScale={4}
        thousandSeparator
        suffix={` ${token.name}`}
      />
    </div>
  );
}
