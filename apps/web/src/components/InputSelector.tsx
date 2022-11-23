import clsx from "clsx";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown, FaCheckCircle } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { shift, autoUpdate, size, useFloating } from "@floating-ui/react-dom";

const networks = [
  {
    name: "Ethereum",
    icon: "/tokens/Ethereum.svg",
    tokens: [
      {
        tokenA: { name: "wBTC", icon: "/tokens/wBTC.svg" },
        tokenB: { name: "dBTC", icon: "/tokens/dBTC.svg" },
      },
      {
        tokenA: { name: "USDT", icon: "/tokens/USDT.svg" },
        tokenB: { name: "dUSDT", icon: "/tokens/dUSDT.svg" },
      },
      {
        tokenA: { name: "USDC", icon: "/tokens/USDC.svg" },
        tokenB: { name: "dUSDC", icon: "/tokens/dUSDC.svg" },
      },
      {
        tokenA: { name: "ETH", icon: "/tokens/ETH.svg" },
        tokenB: { name: "dETH", icon: "/tokens/dETH.svg" },
      },
    ],
  },
  {
    name: "DeFiChain",
    icon: "/tokens/DeFichain.svg",
    tokens: [
      {
        tokenA: { name: "dBTC", icon: "/tokens/dBTC.svg" },
        tokenB: { name: "wBTC", icon: "/tokens/wBTC.svg" },
      },
      {
        tokenA: { name: "dUSDT", icon: "/tokens/dUSDT.svg" },
        tokenB: { name: "USDT", icon: "/tokens/USDT.svg" },
      },
      {
        tokenA: { name: "dUSDC", icon: "/tokens/dUSDC.svg" },
        tokenB: { name: "USDC", icon: "/tokens/USDC.svg" },
      },
      {
        tokenA: { name: "dETH", icon: "/tokens/dETH.svg" },
        tokenB: { name: "ETH", icon: "/tokens/ETH.svg" },
      },
    ],
  },
];

enum Type {
  Network = "Network",
  Token = "Token",
}

interface TokenDetailI {
  name: string;
  icon: string;
}

interface TokensI {
  tokenA: TokenDetailI;
  tokenB: TokenDetailI;
}
interface NetworkOptionsI extends TokenDetailI {
  tokens: TokensI[];
}

interface SelectorI {
  disabled?: boolean;
  label: string;
  type: Type;
  popUpLabel: string;
  floating?: (node: HTMLElement | null) => void;
  options?: NetworkOptionsI[] | TokensI[];
  onSelect?: (value: NetworkOptionsI | TokensI) => void;
  value: NetworkOptionsI | TokensI;
}

export default function InputSelector() {
  const [defaultNetworkA, defaultNetworkB] = networks;
  const [selectedNetworkA, setSelectedNetworkA] = useState(defaultNetworkA);
  const [selectedTokensA, setSelectedTokensA] = useState(
    defaultNetworkA.tokens[0]
  );
  const [selectedNetworkB, setSelectedNetworkB] = useState(defaultNetworkB);
  const [selectedTokensB, setSelectedTokensB] = useState(
    defaultNetworkB.tokens[0]
  );
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const networkB = networks.find(
      (network) => network.name !== selectedNetworkA.name
    );
    if (networkB !== undefined) {
      setSelectedNetworkB(networkB);
      const tokens = selectedNetworkA.tokens.find(
        (item) => item.tokenA.name === selectedTokensB.tokenA.name
      );
      if (tokens !== undefined) {
        setSelectedTokensA(tokens);
      }
    }
  }, [selectedNetworkA]);

  useEffect(() => {
    const tokens = selectedNetworkB.tokens.find(
      (item) => item.tokenA.name === selectedTokensA.tokenB.name
    );
    if (tokens !== undefined) {
      setSelectedTokensB(tokens);
    }
  }, [selectedTokensA]);

  const { x, y, reference, floating, strategy, refs } = useFloating({
    placement: "bottom-end",
    middleware: [
      shift(),
      size({
        apply({ rects }) {
          if (
            refs.floating.current !== null &&
            refs.floating.current !== undefined
          ) {
            Object.assign(refs.floating.current.style, {
              minWidth: "325px",
              maxWidth: "368px",
              width: `${rects.reference.width}px`,
            });
          }
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div className="mx-6">
      <div className="flex flex-row items-center mt-10" ref={reference}>
        <div className="w-1/2">
          <Selector
            label="Source Network"
            popUpLabel="Select source"
            options={networks}
            floating={floating}
            type={Type.Network}
            onSelect={(value: NetworkOptionsI) => setSelectedNetworkA(value)}
            value={selectedNetworkA}
          />
        </div>
        <div className="w-1/2">
          <Selector
            label="Token"
            popUpLabel="Select token"
            options={selectedNetworkA.tokens}
            floating={floating}
            type={Type.Token}
            onSelect={(value: TokensI) => setSelectedTokensA(value)}
            value={selectedTokensA}
          />
        </div>
      </div>
      <div className="flex flex-row items-center mt-40" ref={ref}>
        <div className="w-1/2">
          <Selector
            label="Destination Network"
            disabled
            popUpLabel="Select destination"
            type={Type.Network}
            value={selectedNetworkB}
          />
        </div>
        <div className="w-1/2">
          <Selector
            disabled
            label="Token to Receive"
            popUpLabel="Select token"
            type={Type.Token}
            value={selectedTokensB}
          />
        </div>
      </div>
    </div>
  );
}

function Selector({
  options,
  label,
  popUpLabel,
  onSelect,
  value,
  floating,
  type,
  disabled = false,
}: SelectorI) {
  const roundedBorderStyle =
    type === Type.Network ? "rounded-l-lg" : "rounded-r-lg";
  const { name, icon } =
    type === Type.Network
      ? (value as NetworkOptionsI)
      : (value as TokensI).tokenA;
  return (
    <div>
      <span className="pl-5 text-dark-900 font-semibold text-xs lg:text-base">
        {label}
      </span>
      <Listbox value={value} onChange={onSelect}>
        {({ open }) => (
          <div className="relative mt-1">
            <Listbox.Button
              onClick={(event) => {
                if (disabled) {
                  event.preventDefault();
                }
              }}
              className={clsx(
                "relative w-full outline-0",
                disabled && "cursor-default",
                type === Type.Network ? "p-px pr-0" : "p-px",
                open ? "bg-gradient-2 pr-px" : "bg-dark-200",
                roundedBorderStyle
              )}
            >
              <div
                className={clsx(
                  "flex flex-row justify-between items-center h-full w-full bg-dark-100 dark-card-bg-image pl-5 pr-3 py-3 lg:px-5 lg:py-[18px] text-left",
                  roundedBorderStyle
                )}
              >
                <div className="flex flex-row items-center">
                  <Image
                    width={100}
                    height={100}
                    src={icon}
                    alt={name}
                    data-testid={name}
                    className="w-6 h-6 lg:w-9 lg:h-9"
                  />
                  <span className="block truncate text-dark-1000 ml-2 text-sm lg:text-xl">
                    {name}
                  </span>
                </div>
                {!disabled && (
                  <span className="text-dark-900">
                    <FaChevronDown
                      className={clsx(
                        "h-5 w-5 lg:h-6 lg:w-6 text-dark-900 transition-[transform]",
                        { "rotate-180": open }
                      )}
                    />
                  </span>
                )}
              </div>
            </Listbox.Button>
            {!disabled && (
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  ref={floating}
                  className={clsx(
                    "absolute mt-2 w-full w-56 overflow-auto rounded-lg p-px z-10 outline-0",
                    { "right-0": type !== Type.Network },
                    open ? "bg-gradient-2" : "bg-dark-200"
                  )}
                >
                  <div className="bg-dark-00 rounded-lg py-4">
                    <span className="text-dark-700 font-semibold text-xs lg:text-sm px-5 lg:px-6">
                      {popUpLabel}
                    </span>
                    <div className="flex flex-col mt-3">
                      {type === Type.Network ? (
                        <NetworkOptions options={options} />
                      ) : (
                        <TokenOptions options={options} />
                      )}
                    </div>
                  </div>
                </Listbox.Options>
              </Transition>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}

function NetworkOptions({ options }) {
  return (
    <>
      {options.map((option) => (
        <Listbox.Option
          key={option.name}
          className="relative cursor-default select-none"
          value={option}
        >
          {({ selected, active }) => (
            <>
              <div className="mx-5 lg:mx-6 border-t-[0.5px] border-[#42424280]" />
              <div
                className={clsx(
                  "px-5 lg:px-6 py-3 lg:py-4 my-1 lg:my-2",
                  active && "bg-dark-gradient-1",
                  selected && "bg-dark-gradient-2"
                )}
              >
                <div className="flex flex-row justify-between items-center cursor-default">
                  <div className="flex flex-row items-center">
                    <Image
                      width={100}
                      height={100}
                      className="w-6 h-6 lg:w-[28px] lg:h-[28px]"
                      data-testid={option.name}
                      src={option.icon}
                      alt={option.name}
                    />
                    <span className="truncate text-dark-1000 ml-2 text-base lg:text-lg">
                      {option.name}
                    </span>
                  </div>
                  {selected && (
                    <FaCheckCircle className="h-6 w-6 text-[#00AD1D]" />
                  )}
                </div>
              </div>
            </>
          )}
        </Listbox.Option>
      ))}
    </>
  );
}

function TokenOptions({ options }) {
  return (
    <>
      {options.map((option) => (
        <Listbox.Option
          key={option.tokenA.name}
          className="relative cursor-default select-none"
          value={option}
        >
          {({ selected, active }) => (
            <>
              <div className="mx-5 lg:mx-6 border-t-[0.5px] border-[#42424280]" />
              <div
                className={clsx(
                  "px-5 lg:px-6 py-3 lg:py-4 my-1 lg:my-2",
                  active && "bg-dark-gradient-1",
                  selected && "bg-dark-gradient-2"
                )}
              >
                <div className="flex flex-row justify-between items-center cursor-default">
                  <div className="flex flex-row w-4/12 items-center">
                    <Image
                      width={100}
                      height={100}
                      className="w-6 h-6 lg:w-[28px] lg:h-[28px]"
                      data-testid={option.tokenA.name}
                      src={option.tokenA.icon}
                      alt={option.tokenA.name}
                    />
                    <span className="truncate text-dark-1000 ml-2 text-base lg:text-lg">
                      {option.tokenA.name}
                    </span>
                  </div>
                  <div className="flex flex-row w-2/12 justify-center items-center">
                    <FiArrowRight size={15} className="h-4 w-4 text-dark-500" />
                  </div>
                  <div className="flex flex-row w-4/12 items-center">
                    <Image
                      width={100}
                      height={100}
                      className="w-6 h-6 lg:w-[28px] lg:h-[28px]"
                      data-testid={option.tokenB.name}
                      src={option.tokenB.icon}
                      alt={option.tokenB.name}
                    />
                    <span className="truncate text-dark-900 ml-2 text-base lg:text-lg">
                      {option.tokenB.name}
                    </span>
                  </div>
                  <div className="flex flex-row w-2/12 justify-end items-center">
                    {selected && (
                      <FaCheckCircle className="h-6 w-6 text-[#00AD1D]" />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Listbox.Option>
      ))}
    </>
  );
}
