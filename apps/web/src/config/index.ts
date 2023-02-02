// Import Mainnet ABIs
import BridgeV1 from "../config/ABIs/mainnet/BridgeV1.json";
import WBTC from "../config/ABIs/mainnet/WBTC.json";
import USDT from "../config/ABIs/mainnet/USDT.json";
import USDC from "../config/ABIs/mainnet/USDC.json";
// Import Testnet ABIs
import BridgeV1Testnet from "../config/ABIs/mainnet/BridgeV1.json";
import MWBTC from "../config/ABIs/testnet/MWBTC.json";
import MUSDT from "../config/ABIs/testnet/MUSDT.json";
import MUSDC from "../config/ABIs/testnet/MUSDC.json";
import { ContractContextI } from "types";

export const MAINNET_CONFIG: ContractContextI = {
  BridgeV1: {
    address: "0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C",
    abi: BridgeV1, // TODO: Replace with deployed contract address on mainnet
  },
  Erc20Tokens: {
    wBTC: { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", abi: WBTC },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", abi: USDT },
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", abi: USDC },
    ETH: { address: "0x0000000000000000000000000000000000000000", abi: null },
  },
};

// Goerli
export const TESTNET_CONFIG: ContractContextI = {
  BridgeV1: {
    address: "0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C",
    abi: BridgeV1Testnet,
  },
  Erc20Tokens: {
    wBTC: { address: "0xD723D679d1A3b23d0Aafe4C0812f61DDA84fc043", abi: MWBTC },
    USDT: { address: "0xA218A0EA9a888e3f6E2dfFdf4066885f596F07bF", abi: MUSDT },
    USDC: { address: "0xB200af2b733B831Fbb3d98b13076BC33F605aD58", abi: MUSDC },
    ETH: { address: "0x0000000000000000000000000000000000000000", abi: null },
  },
};
