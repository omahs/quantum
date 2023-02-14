import React from "react";
import { FaReddit, FaGithub, FaTwitter } from "react-icons/fa";
import { BsMedium } from "react-icons/bs";
import Image from "next/image";

const DeFiChainSocialItems = [
  {
    icon: FaTwitter,
    testId: "twitter_dfc",
    label: "Twitter",
    href: "https://twitter.com/BirthdayDev",
  },
  {
    icon: FaReddit,
    testId: "reddit_dfc",
    label: "Reddit",
    href: "https://www.reddit.com/r/defiblockchain",
  },
  {
    icon: FaGithub,
    testId: "gitHub_dfc",
    label: "GitHub",
    href: "https://github.com/DeFiCh",
  },
];
const BirthdayResearchSocialItems = [
  {
    icon: FaTwitter,
    testId: "twitter_br",
    label: "Twitter",
    href: "https://twitter.com/BirthdayDev/",
  },
  {
    icon: BsMedium,
    testId: "medium_br",
    label: "Medium",
    href: "https://medium.com/@birthdayresearch",
  },
  {
    icon: FaGithub,
    testId: "gitHub_br",
    label: "GitHub",
    href: "https://github.com/BirthdayResearch",
  },
];

export default function Footer() {
  return (
    <footer
      data-testid="footer"
      className="bg-inherit relative z-[1] w-full border-dark-300 pb-[34px] pt-4 md:pt-3"
    >
      {/* desktop view */}
      <section
        data-testid="footer_web"
        className="text-dark-900 px-[120px] hidden lg:block"
      >
        <div className="border-t-[0.5px] dark:border-dark-300">
          <div className="relative h-[32px] w-[140px] cursor-pointer lg:h-[60px] lg:w-[264px] mt-3">
            <Image
              fill
              data-testid="footer-bridge-logo"
              src="/header-logo.svg"
              alt="Bridge Logo"
            />
          </div>
        </div>
        <div className="pl-1 flex flex-row justify-between text-sm">
          <div className="flex flex-col">
            <div className="font-semibold">
              Quantum is a proud development of Birthday Research — the
              blockchain R&D arm of Cake DeFi.
            </div>
            <div className="md:items-center flex flex-row">
              <div className="flex flex-row justify-between pt-2.5 pb-2 pr-[12.5px]">
                &copy; Birthday Research
              </div>
              <div
                data-testid="br_socials"
                className="flex flex-row space-x-3.5"
              >
                {BirthdayResearchSocialItems.map(
                  ({ href, testId, icon: Icon }) => (
                    <a
                      href={href}
                      key={testId}
                      target="_blank"
                      className=""
                      rel="noreferrer"
                      data-testid={testId}
                    >
                      <Icon size={18} />
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="flex-col self-end relative bottom-[10px]">
            <div className="pb-2">&copy; DeFiChain</div>
            <div className="flex flex-row justify-between">
              {DeFiChainSocialItems.map(({ href, testId, icon: Icon }) => (
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
      <section
        data-testid="footer_tablet_mobile"
        className="px-10 text-dark-900 text-xs lg:hidden"
      >
        <div className="border-t-[0.5px] dark:border-dark-300">
          <div className="relative h-[32px] w-[140px] cursor-pointer my-6 lg:h-[60px] lg:w-[264px]">
            <Image
              fill
              data-testid="footer-bridge-logo"
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
              {BirthdayResearchSocialItems.map(
                ({ href, testId, icon: Icon }) => (
                  <a
                    href={href}
                    key={testId}
                    target="_blank"
                    rel="noreferrer"
                    className=""
                    data-testid={`${testId}_tablet_mobile`}
                  >
                    <Icon size={18} />
                  </a>
                )
              )}
            </div>
          </div>
          <div className="flex xs:flex-col-reverse md:flex-row">
            <div className="flex flex-row justify-between pr-[11px] xs:space-x-3.5 xs:pt-2 md:pt-0">
              {DeFiChainSocialItems.map(({ href, testId, icon: Icon }) => (
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
