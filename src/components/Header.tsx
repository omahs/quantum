import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

export default function Header(): JSX.Element {
  const isLight = false;
  return (
    <div className="flex items-center justify-between px-5 pt-8 pb-6 sm:px-12 sm:py-6 xl:px-[120px] xl:pt-10 xl:pb-12">
      <Link href="/">
        <div className="relative cursor-pointer w-[140px] h-[32px] xl:w-[264px] xl:h-[60px]">
          <Image
            fill
            data-testid="bridge-logo"
            src="/header-logo.svg"
            alt="Bridge Logo"
          />
        </div>
      </Link>
      <div>
        <button
          data-testid="connect-button"
          type="button"
          className={clsx(
            "flex items-center justify-center border-[1.5px] border-transparent rounded-3xl px-4 py-2 group hover:fill-bg-gradient-1",
            isLight ? "light-bg-gradient-1" : "dark-bg-gradient-1"
          )}
        >
          <span
            className={clsx(
              "text-sm font-semibold",
              isLight ? "text-dark-900" : "text-light-50"
            )}
          >
            Connect
          </span>
        </button>
      </div>
    </div>
  );
}
