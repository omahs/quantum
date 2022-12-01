import BigNumber from "bignumber.js";
import Image from "next/image";
import { FiInfo } from "react-icons/fi";
import { truncateTextFromMiddle } from "@utils/textHelper";
import { TokenDetailI } from "types";
import { useNetworkContext } from "@contexts/NetworkContext";
import ProgressBar from "./commons/ProgressBar";
import NumericFormat from "./commons/NumericFormat";
import BrLogo from "./icons/BrLogo";

const asset = {
  walletAddress: "0xaab27b150451726ecsds38aa1d0a94505c8729bd1",
  dailyLimit: 25,
  usedLimit: 12.675,
};

export default function ProofOfAssetsCard() {
  const { selectedTokensA, selectedTokensB } = useNetworkContext();
  const limitPercentage = new BigNumber(asset.usedLimit)
    .dividedBy(asset.dailyLimit)
    .multipliedBy(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN);

  return (
    <div className="relative w-full dark-card-bg-image rounded-lg lg:rounded-xl border border-dark-200 backdrop-blur-[18px] px-8 pt-8">
      <span className="block text-2xl font-semibold leading-9 tracking-wide text-dark-900">
        Proof of assets
      </span>
      <div className="text-sm text-valid">
        {truncateTextFromMiddle(asset.walletAddress, 16)}
      </div>
      <div className="mt-6">
        <span className="align-middle text-sm font-semibold tracking-wide text-dark-700">
          TOKEN SUPPLY
        </span>
        <button type="button" className="align-middle ml-2">
          {/* TODO: Disply token supply info onclick */}
          <FiInfo size={16} className="text-dark-700" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <TokenSupplyItem token={selectedTokensA.tokenA} />
        <TokenSupplyItem token={selectedTokensB.tokenA} />
      </div>
      <div className="mt-6">
        <span className="block align-middle text-sm font-semibold tracking-wide text-dark-700 mb-2">
          DAILY LIMIT
        </span>
        <ProgressBar progressPercentage={limitPercentage} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-dark-900">
          {`${asset.usedLimit} ${selectedTokensA.tokenA.symbol} (${limitPercentage}%)`}
        </span>
        <span className="text-dark-700">
          {`/${asset.dailyLimit} ${selectedTokensA.tokenA.symbol}`}
        </span>
      </div>
      <div className="flex items-center rounded-b-lg lg:rounded-b-xl dark-bg-card-section -mx-8 mt-6 px-8 py-5">
        <span className="text-xs text-dark-700 mr-3">Backed by</span>
        <BrLogo />
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
        className="w-6 h-6"
      />
      <NumericFormat
        className="text-left text-dark-1000 text-xs lg:text-base ml-1"
        value={token.supply}
        decimalScale={4}
        thousandSeparator
        suffix={` ${token.name}`}
      />
    </div>
  );
}
