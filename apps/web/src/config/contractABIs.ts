import { Erc20Token } from "types";

// Mainnet ABIs
import BridgeV1 from "../config/ABIs/mainnet/BridgeV1.json";
import WBTC from "../config/ABIs/mainnet/WBTC.json";
import USDT from "../config/ABIs/mainnet/USDT.json";
import USDC from "../config/ABIs/mainnet/USDC.json";

// Testnet ABIs
import BridgeV1Testnet from "../config/ABIs/mainnet/BridgeV1.json";
import MWBTC from "../config/ABIs/testnet/MWBTC.json";
import MUSDT from "../config/ABIs/testnet/MUSDT.json";
import MUSDC from "../config/ABIs/testnet/MUSDC.json";

export interface AbiMappingI {
  BridgeContract: any;
  Erc20Tokens: Record<any, any>;
}

export const MAINNET_ABI: AbiMappingI = {
  BridgeContract: BridgeV1, // TODO: Replace ABI from mainnet once deployed
  Erc20Tokens: {
    wBTC: WBTC,
    USDT,
    USDC,
    ETH: "",
  },
};

// Goerli testnet
export const TESTNET_ABI: AbiMappingI = {
  BridgeContract: BridgeV1Testnet,
  Erc20Tokens: {
    wBTC: MWBTC,
    USDT: MUSDT,
    USDC: MUSDC,
    ETH: "",
  },
};
