import React from "react";
import { FaReddit, FaGithub, FaTwitter } from "react-icons/fa";
import { BsMedium } from "react-icons/bs";
import Image from "next/image";

const SocialItems = [
  {
    icon: FaTwitter,
    testId: "twitter",
    label: "Twitter",
    href: "https://twitter.com/BirthdayDev",
  },
  {
    icon: FaReddit,
    testId: "reddit",
    label: "Reddit",
    href: "https://www.reddit.com/r/defiblockchain",
  },
  {
    icon: FaGithub,
    testId: "gitHub",
    label: "GitHub",
    href: "https://github.com/BirthdayResearch",
  },
];
const SocialItemsFooter = [
  {
    icon: FaTwitter,
    testId: "twitter",
    label: "Twitter",
    href: "https://twitter.com/BirthdayDev/",
  },
  {
    icon: BsMedium,
    testId: "medium",
    label: "Medium",
    href: "https://medium.com/@birthdayresearch",
  },
  {
    icon: FaGithub,
    testId: "gitHub",
    label: "GitHub",
    href: "https://github.com/BirthdayResearch",
  },
];

export default function Footer() {
  return (
    <footer className="bg-inherit relative z-[1] w-full border-dark-300 pb-[34px] pt-4 md:pt-3">
      {/* desktop view */}
      <section className="text-dark-900 px-[120px] hidden lg:block">
        <div className="border-t-[0.5px] dark:border-dark-300">
          <div className="relative h-[32px] w-[140px] cursor-pointer lg:h-[60px] lg:w-[264px] mt-3">
            <Image
              fill
              data-testid="bridge-logo"
              src="/header-logo.svg"
              alt="Bridge Logo"
            />
          </div>
        </div>
        <div className="pl-1 flex flex-row justify-between text-sm">
          <div className="flex flex-col">
            {/* TODO removed for now */}
            {/* <div className="font-semibold">Version 1.0.1&nbsp;</div> */}
            <div className="font-semibold">
              Quantum is a proud development of Birthday Research — the
              blockchain R&D arm of Cake DeFi.
            </div>
            <div className="md:items-center flex flex-row">
              <div className="flex flex-row justify-between pt-2.5 pb-2 pr-[12.5px]">
                &copy; Birthday Research
              </div>
              <div className="flex flex-row space-x-3.5">
                {SocialItemsFooter.map(({ href, testId, icon: Icon }) => (
                  <a href={href} key={testId} target="_blank" rel="noreferrer">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-col self-end relative bottom-[10px]">
            <div className="pb-2">&copy; DeFiChain</div>
            <div className="flex flex-row justify-between">
              {SocialItems.map(({ href, testId, icon: Icon }) => (
                <a
                  href={href}
                  key={testId}
                  target="_blank"
                  rel="noreferrer"
                  className=""
                  data-testid={testId}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* tablet and mobile view */}
      <section className="px-10 text-dark-900 text-xs lg:hidden">
        <div className="border-t-[0.5px] dark:border-dark-300">
          <div className="relative h-[32px] w-[140px] cursor-pointer my-6 lg:h-[60px] lg:w-[264px]">
            <Image
              fill
              data-testid="bridge-logo"
              src="/header-tablet-mobile-logo.svg"
              alt="Bridge Logo"
            />
          </div>
        </div>
        <div className="font-semibold">Version 1.0.1&nbsp;</div>
        <div className="font-semibold">
          Quantum is a proud development of Birthday Research — the blockchain
          R&D arm of Cake DeFi.
        </div>
        <div className="flex flex-row pt-[26px] justify-between">
          <div className="flex xs:flex-col md:flex-row">
            <div className="flex flex-row justify-between pb-2 pr-[12.5px] md:pb-0">
              &copy; Birthday Research
            </div>
            <div className="flex flex-row space-x-3">
              {SocialItemsFooter.map(({ href, testId, icon: Icon }) => (
                <a
                  href={href}
                  key={testId}
                  target="_blank"
                  rel="noreferrer"
                  className=""
                  data-testid={testId}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex xs:flex-col-reverse md:flex-row">
            <div className="flex flex-row justify-between pr-[11px] xs:space-x-3.5 xs:pt-2 md:pt-0">
              {SocialItems.map(({ href, testId, icon: Icon }) => (
                <a
                  href={href}
                  key={testId}
                  target="_blank"
                  rel="noreferrer"
                  className=""
                  data-testid={testId}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <div>&copy; DeFiChain</div>
          </div>
        </div>
      </section>
    </footer>
  );
}
