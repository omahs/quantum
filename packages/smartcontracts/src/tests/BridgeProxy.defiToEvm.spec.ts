import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { BridgeV1, TestToken } from '../generated';
import { deployContracts, toWei } from './testHelper';

describe('DeFiChain --> EVM', () => {
  let proxyBridge: BridgeV1;
  let testToken: TestToken;
  let testToken2: TestToken;
  let defaultAdminSigner: SignerWithAddress;
  let operationalAdminSigner: SignerWithAddress;
  let domainData: any;
  const eip712Types = {
    CLAIM: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'tokenAddress', type: 'address' },
    ],
  };

  beforeEach(async () => {
    ({ proxyBridge, testToken, testToken2, defaultAdminSigner, operationalAdminSigner } = await loadFixture(
      deployContracts,
    ));
    domainData = {
      name: 'CAKE_BRIDGE',
      version: '0.1',
      chainId: 1337,
      verifyingContract: proxyBridge.address,
    };
    // Minting 100 testToken to ProxyContract
    await testToken.mint(proxyBridge.address, toWei('100'));
    // Adding testToken in supported token with daily allowance of 15 tokens
    await proxyBridge.addSupportedTokens(testToken.address, toWei('15'));
  });

  it('Valid Signature', async () => {
    const eip712Data = {
      to: defaultAdminSigner.address,
      amount: toWei('10'),
      nonce: 0,
      deadline: ethers.constants.MaxUint256,
      tokenAddress: testToken.address,
    };

    const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
    // Checking Balance before claiming fund, should be 0
    expect(await testToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
    await proxyBridge.claimFund(
      defaultAdminSigner.address,
      toWei('10'),
      0,
      ethers.constants.MaxUint256,
      testToken.address,
      signature,
    );
    // Checking Balance after claiming fund, should be 10
    expect(await testToken.balanceOf(defaultAdminSigner.address)).to.equal(toWei('10'));
  });

  it('Invalid Signature', async () => {
    const eip712Data = {
      to: operationalAdminSigner.address,
      amount: toWei('10'),
      nonce: 0,
      deadline: ethers.constants.MaxUint256,
      tokenAddress: testToken.address,
    };
    // Relayer address is defaultAdminSigner, if not signed by relayer address, txn should fail.
    const signature = await operationalAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
    await expect(
      proxyBridge.claimFund(
        operationalAdminSigner.address,
        toWei('10'),
        0,
        ethers.constants.MaxUint256,
        testToken.address,
        signature,
      ),
    ).to.revertedWithCustomError(proxyBridge, 'FAKE_SIGNATURE');
    // Checking Balance after Unsuccessfully claiming fund, should be 0
    expect(await testToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
  });

  it('Incorrect nonce', async () => {
    // Correct nonce should be Zero
    await expect(
      proxyBridge.claimFund(
        operationalAdminSigner.address,
        toWei('10'),
        1,
        ethers.constants.MaxUint256,
        testToken.address,
        '0x00',
      ),
    ).to.be.revertedWithCustomError(proxyBridge, 'INCORRECT_NONCE');
    // Checking Balance after Unsuccessfully claiming fund, should be 0
    expect(await testToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
  });

  it('Unsupported token', async () => {
    await expect(
      proxyBridge.claimFund(
        operationalAdminSigner.address,
        toWei('10'),
        0,
        ethers.constants.MaxUint256,
        testToken2.address,
        '0x00',
      ),
    ).to.be.revertedWithCustomError(proxyBridge, 'TOKEN_NOT_SUPPORTED');
    // Checking Balance after Unsuccessfully claiming fund, should be 0
    expect(await testToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
  });

  it('Successfully emitted event when claiming fund', async () => {
    const eip712Data = {
      to: defaultAdminSigner.address,
      amount: toWei('10'),
      nonce: 0,
      deadline: ethers.constants.MaxUint256,
      tokenAddress: testToken.address,
    };

    const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
    // Event called CLAIM_FUND should be emitted when Successfully claim fund
    await expect(
      proxyBridge.claimFund(
        defaultAdminSigner.address,
        toWei('10'),
        0,
        ethers.constants.MaxUint256,
        testToken.address,
        signature,
      ),
    )
      .to.emit(proxyBridge, 'CLAIM_FUND')
      .withArgs(testToken.address, defaultAdminSigner.address, toWei('10'));
  });
});
