import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { deployContracts } from './testUtils/deployment';

describe('Test Upgrading functionality', () => {
  it('The smart contract retains the values of state variables after upgrading', async () => {
    const { testToken, proxyBridge, defaultAdminSigner } = await loadFixture(deployContracts);
    const accounts = await ethers.provider.listAccounts();

    const NewImplementation = await ethers.getContractFactory('NewImplementation');
    const newImplementation = await NewImplementation.deploy();
    await newImplementation.deployed();

    let tx = await testToken.mint(proxyBridge.address, 100);
    await tx.wait();
    tx = await proxyBridge.addSupportedTokens(testToken.address, 15);
    await tx.wait();
    const eip712Types = {
      CLAIM: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'tokenAddress', type: 'address' },
      ],
    };
    const domainData = {
      name: 'CAKE_BRIDGE',
      version: '0.1',
      chainId: 1337,
      verifyingContract: proxyBridge.address,
    };
    const eip712Data = {
      to: accounts[2],
      amount: 10,
      nonce: 0,
      deadline: ethers.constants.MaxUint256,
      tokenAddress: testToken.address,
    };

    const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
    tx = await proxyBridge.claimFund(accounts[2], 10, 0, ethers.constants.MaxUint256, testToken.address, signature);
    await tx.wait();

    // upgrade to the new contract
    tx = await proxyBridge.upgradeTo(newImplementation.address);
    await tx.wait();
    // check the implementation slot
    expect(
      `0x${(
        await ethers.provider.getStorageAt(
          proxyBridge.address,
          '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        )
      ).substring(26)}`,
    ).to.equal(newImplementation.address.toLowerCase());
    // check admin role and other storage slots
    expect(
      await proxyBridge.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', accounts[0]),
    ).to.equal(true);
    expect(await proxyBridge.eoaAddressToNonce(accounts[2])).to.equal(1);
    expect(await proxyBridge.supportedTokens(testToken.address)).to.equal(true);
    expect(await proxyBridge.relayerAddress()).to.equal(accounts[0]);
    expect((await proxyBridge.tokenAllowances(testToken.address)).dailyAllowance).to.equal(15);
    expect(await proxyBridge.transactionFee()).to.equal(30);
  });
});
