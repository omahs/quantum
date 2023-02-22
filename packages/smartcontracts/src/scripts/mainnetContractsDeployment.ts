import { BridgeV2__factory } from '../generated';
import { bridgeImplementation } from './deployBridgeImplementation';
// import { deployBridgeProxy } from './deployBridgeProxy';

require('dotenv').config({
  path: './.env',
});

// When deploying to MAINNET to `ADMIN_ADDRESS` needed
const ADMIN_ADDRESS = '0x5aB853A40b3b9A16891e8bc8e58730AE3Ec102b2';
// When deploying to MAINNET to `OPERATIONAL_ADDRESS` needed
const OPERATIONAL_ADDRESS = '0xA0D0927C9F89CD696bCF30F4BB0E3A1Fa463265d';
// When deploying to MAINNET to `RELAYER_ADDRESS` needed
const RELAYER_ADDRESS = '0xE98920Ef9b37a98b30B05BA8F5e9528F07B7a33A';

// Run this script to deploy all contracts on mainnet.
// npx hardhat run --network mainnet ./scripts/mainnetContractsDeployment.ts

async function main() {
  const bridgeV1 = await bridgeImplementation();
  console.log(bridgeV1.address);
  const encodedData = BridgeV2__factory.createInterface().encodeFunctionData('initialize', [
    // admin address
    ADMIN_ADDRESS,
    // operational address
    OPERATIONAL_ADDRESS,
    // relayer address
    RELAYER_ADDRESS,
    // community wallet address
    ADMIN_ADDRESS,
    10,
    ADMIN_ADDRESS,
    3,
  ]);
  console.log(encodedData);
  // await deployBridgeProxy({
  //   adminAddress: ADMIN_ADDRESS,
  //   operationalAddress: OPERATIONAL_ADDRESS,
  //   relayerAddress: RELAYER_ADDRESS,
  //   bridgeV1Address: bridgeV1.address,
  //   txFeeAddress: ADMIN_ADDRESS,
  //   flushReceiveAddress: ADMIN_ADDRESS,
  // });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
