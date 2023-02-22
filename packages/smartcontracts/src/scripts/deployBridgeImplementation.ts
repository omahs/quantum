import { ethers, network } from 'hardhat';

import { BridgeV2 } from '../generated';

// npx hardhat run --network goerli ./scripts/deployBridgeImplementation.ts
export async function bridgeImplementation(): Promise<BridgeV2> {
  const { chainId } = network.config;
  const BridgeV1Contract = await ethers.getContractFactory('BridgeV2');
  const bridgeV2 = await BridgeV1Contract.deploy();
  await bridgeV2.deployed();
  console.log('Bridge V2 address is ', bridgeV2.address);
  if (chainId !== 1337) {
    console.log(
      `Verify on Etherscan: npx hardhat verify --network goerli --contract contracts/BridgeV1.sol:BridgeV2 ${bridgeV2.address}`,
    );
  }
  return bridgeV2;
}
