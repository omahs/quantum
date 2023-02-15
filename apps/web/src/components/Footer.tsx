import React from "react";
import { FaReddit, FaGithub, FaTwitter } from "react-icons/fa";
import { BsMedium } from "react-icons/bs";
import Image from "next/image";
import Socials from "./commons/Socials";

const DeFiChainSocialItems = [
  {
    icon: FaTwitter,
    testId: "twitter_dfc",
    label: "Twitter",
    href: "https://twitter.com/defichain",
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
      className="bg-inherit relative z-[1] w-full border-dark-300 pt-4 md:pt-3"
    >
      <section
        data-testid="footer_web"
        className="text-dark-900 xs:px-[24px] xs:pb-[51px] md:px-[48px] lg:px-[120px] lg:pb-[34px] text-sm"
      >
        <div className="border-t-[0.5px] dark:border-dark-300 xs:pb-[17.5px] pt-[15px]">
          <div className="relative h-[28px] w-[250px] cursor-pointer mt-3">
            <Image
              fill
              data-testid="footer-bridge-logo"
              src="/header-logo.svg"
              alt="Bridge Logo"
            />
          </div>
        </div>
        <div className="pl-1 flex-row justify-between">
          <div className="font-semibold">
            Quantum is a proud development of Birthday Research — the blockchain
            R&D arm of Cake DeFi.
          </div>
          <div className="flex flex-row justify-between xs:pt-[19px] md:pt-[26px] lg:pt-0">
            <div className="flex xs:flex-col md:items-end md:flex-row md:flex lg:flex-row item-start">
              <div className="pr-[11px] md:pb-0 xs:pb-[12.5px]">
                &copy; Birthday Research
              </div>
              <Socials items={BirthdayResearchSocialItems} />
            </div>
            <div className="md:flex md:flex-row-reverse lg:flex-col lg:items-end lg:pt-0">
              <div className="pb-0 md:pl-2 md:pb-0 xs:pb-[12.5px] lg:relative lg:bottom-[20px]">
                &copy; DeFiChain
              </div>
              <Socials items={DeFiChainSocialItems} />
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
