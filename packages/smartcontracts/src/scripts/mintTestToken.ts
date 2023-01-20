import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { TestToken__factory } from '../generated';

require('dotenv').config({
  path: './.env',
});

// This script will mint and approve the Bridge address to spend tokens on behalf on the user, given user has provided their PRIVATE_KEY in .env. See .env.example for the reference.
// This is purely a convenience function so that users will not need to create a separate approval tx
// 100,000 tokens will be minted. `amount` can be changed. To run this script, run the below command in smartContract directory.
// npx hardhat run --network goerli ./scripts/mintTestToken.ts
async function main() {
  const usdcAddress = '0xB200af2b733B831Fbb3d98b13076BC33F605aD58';
  const usdtAddress = '0xA218A0EA9a888e3f6E2dfFdf4066885f596F07bF';
  // Minting 100,000 tokens.
  const amount = ethers.utils.parseEther('1');
  // Minting M-USDT
  await mintAndApproveTestTokens(usdtAddress, amount);
  // Minting M-USDC
  await mintAndApproveTestTokens(usdcAddress, amount);
}

async function mintAndApproveTestTokens(tokenAddress: string, amount: BigNumber) {
  const bridgeAddress = '0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C';
  const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const tokenContract = new ethers.Contract(tokenAddress, TestToken__factory.createInterface(), wallet);
  const mintTx = await tokenContract.mint(wallet.address, amount);
  await mintTx.wait();
  console.log('Mint tx hash: ', mintTx.hash);
  const remainingAllowance = await tokenContract.allowance(wallet.address, bridgeAddress);
  if (remainingAllowance === 0) {
    const approveTx = await tokenContract.approve(bridgeAddress, ethers.constants.MaxUint256);
    await approveTx.wait();
    console.log('Approve tx hash: ', approveTx.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
