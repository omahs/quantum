import { ethers, network } from 'hardhat';

import { BridgeV1__factory, TestBridge__factory } from '../generated';

// npx hardhat run --network goerli ./scripts/deployTestBridgeImplementation.ts
export async function testBridgeImplementation() {
  const bridgeAddress = '0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C';
  const { chainId } = network.config;
  const BridgeV2Contract = await ethers.getContractFactory('TestBridge');
  const testBridge = await BridgeV2Contract.deploy();
  await testBridge.deployed();
  console.log('Test Bridge address is ', testBridge.address);
  if (chainId !== 1337) {
    console.log(
      `Verify on Etherscan: npx hardhat verify --network goerli --contract contracts/BridgeV1.sol:BridgeV1 ${testBridge.address}`,
    );
  }
  const newBridge = '0x89323b884cA9443670e74f897670ddC596728740';
  const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const bridge = new ethers.Contract(bridgeAddress, BridgeV1__factory.createInterface(), wallet);
  // This address will be used for relayerAddress, communityWallet and flushReceiveAddress
  const generalAddress = '0xE98920Ef9b37a98b30B05BA8F5e9528F07B7a33A';
  const encodedData = TestBridge__factory.createInterface().encodeFunctionData('initialize', [
    // admin address
    wallet.address,
    // operational address: GN safe
    '0xdD42792d3F18bb693A669e5096f866cb96AEdA13',
    // relayer address
    generalAddress,
    // community wallet address
    generalAddress,
    30,
    generalAddress,
    2,
  ]);
  // console.log(encodedData);
  await bridge.upgradeToAndCall(newBridge, encodedData);
  // return testBridge;
}

testBridgeImplementation().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
