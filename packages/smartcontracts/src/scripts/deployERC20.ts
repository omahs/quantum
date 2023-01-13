import { ethers } from 'hardhat';

// npx hardhat run --network goerli ./scripts/deployERC20.ts
const TOKEN_ADMIN_ADDRESS = '';
async function main() {
  const ERC20 = await ethers.getContractFactory('GoerliTestToken');
  const testToken = await ERC20.deploy('Test', 'T', TOKEN_ADMIN_ADDRESS);
  await testToken.deployed();
  console.log('Test token is deployed to ', testToken.address);
  console.log(
    `To verify on Etherscan: npx hardhat verify --network goerli --contract contracts/GoerliTestToken.sol:GoerliTestToken ${testToken.address} Test T ${TOKEN_ADMIN_ADDRESS}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
