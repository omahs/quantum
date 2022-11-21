import useResponsive from "@hooks/useResponsive";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { truncateTextFromMiddle } from "@utils/textHelper";
import MetaMaskIcon from "./icons/MetaMaskIcon";

interface Wallet {
  address: string;
  token: string;
}

interface MobileProps {
  walletText: string;
  show: boolean;
}

interface TabletOrWebProps extends MobileProps {
  wallet: Wallet;
}

export default function Header(): JSX.Element {
  // TODO: Replace test data here
  const mockWallet = {
    address: "0xaab27b150451726ecsds38aa1d0a94505c8729bd1",
    token: "Ethereum",
  };
  const [wallet, setWallet] = useState<Wallet>();

  return (
    <div className="flex items-center justify-between bg-dark-00 px-5 pt-8 pb-6 sm:px-12 sm:py-6 lg:px-[120px] lg:pt-10 lg:pb-12">
      <Link href="/">
        <div className="relative cursor-pointer w-[140px] h-[32px] lg:w-[264px] lg:h-[60px]">
          <Image
            fill
            data-testid="bridge-logo"
            src="/header-logo.svg"
            alt="Bridge Logo"
          />
        </div>
      </Link>
      <div className="h-9 sm:h-10 lg:h-12 flex items-center">
        {wallet ? (
          <WalletDisplay wallet={wallet} onClick={() => setWallet(undefined)} />
        ) : (
          <ConnectButtonDisplay onClick={() => setWallet(mockWallet)} />
        )}
        {/* TODO: Add back if needed */}
        {/* {isLg && (
          <div className="flex items-center ml-3">
            <ThemeSwitch />
          </div>
        )} */}
      </div>
    </div>
  );
}

function ConnectButtonDisplay({
  onClick,
}: {
  onClick: () => void;
}): JSX.Element {
  const { isSm } = useResponsive();
  const btnLabel = isSm ? "Connect wallet" : "Connect";
  return (
    <button
      data-testid="connect-button"
      type="button"
      className={clsx(
        `flex items-center justify-center h-full border-[1.5px] border-transparent rounded-3xl  
          px-4 py-2 sm:px-6 sm:py-2.5 lg:px-6 lg:py-3
          dark-bg-gradient-1 hover:fill-bg-gradient-1 active:fill-bg-gradient-5`
      )}
      onClick={onClick}
    >
      <span className="text-dark-1000 text-sm font-semibold">{btnLabel}</span>
    </button>
  );
}

function WalletDisplay({
  wallet,
  onClick,
}: {
  wallet: Wallet;
  onClick: () => void;
}): JSX.Element {
  const { isXs, isSm, isLg } = useResponsive();
  const walletText = truncateTextFromMiddle(wallet.address, isLg ? 5 : 4);
  return (
    <button
      data-testid="wallet-button"
      type="button"
      onClick={onClick}
      className={clsx(
        `flex items-center rounded-[48px] border-[0.5px] px-3 py-2 lg:px-2.5 lg:py-1.5
          h-8 sm:h-[52px] lg:h-12 sm:w-[156px] lg:w-[165px]
          hover:dark-btn-hover hover:border-transparent active:dark-btn-pressed
          border-dark-card-stroke dark-card-bg`
      )}
    >
      <TabletOrWebWallet wallet={wallet} walletText={walletText} show={isSm} />
      <MobileWallet walletText={walletText} show={isXs && !isSm} />
    </button>
  );
}

function MobileWallet({ walletText, show }: MobileProps) {
  return show ? (
    <>
      <div className="w-3 h-3 bg-valid rounded-full mr-2" />
      <span className="text-dark-1000 text-xs">{walletText}</span>
    </>
  ) : null;
}

function TabletOrWebWallet({ wallet, walletText, show }: TabletOrWebProps) {
  return show ? (
    <div className="flex items-center">
      <MetaMaskIcon />

      <div className="ml-2 text-left">
        <span className="text-dark-1000 text-sm block">{walletText}</span>
        <div className="flex items-center">
          <span className="text-dark-700 text-xs">{wallet.token}</span>
          <div className="w-2 h-2 bg-valid rounded-full ml-1" />
        </div>
      </div>
    </div>
  ) : null;
}
