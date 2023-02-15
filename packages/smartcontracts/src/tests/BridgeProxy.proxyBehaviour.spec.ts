import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import {
  TestBridgeInitializer__factory,
  TestBridgeReinitializer__factory,
  TestBridgeReinitializerTwo__factory,
} from '../generated';
import { deployContracts } from './testUtils/deployment';
import { toWei } from './testUtils/mathUtils';

describe('Test Behaviour related to proxy', () => {
  it('The smart contract retains the values of state variables after upgrading', async () => {
    // This one from Cuong's proxyBehaviour PR
    const { testToken, proxyBridge, defaultAdminSigner } = await loadFixture(deployContracts);
    const accounts = await ethers.provider.listAccounts();

    const NewImplementationFactory = await ethers.getContractFactory('TestBridgeInitializerTwo');
    const newImplementation = await NewImplementationFactory.deploy();
    await newImplementation.deployed();

    await testToken.mint(proxyBridge.address, toWei('100'));
    await proxyBridge.addSupportedTokens(testToken.address, toWei('15'), (await time.latest()) + 10);
    await time.increase(20);

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
      name: 'QUANTUM_BRIDGE',
      version: '1.0',
      chainId: 1337,
      verifyingContract: proxyBridge.address,
    };
    const eip712Data = {
      to: accounts[2],
      amount: toWei('10'),
      nonce: 0,
      deadline: ethers.constants.MaxUint256,
      tokenAddress: testToken.address,
    };

    const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
    await proxyBridge.claimFund(accounts[2], toWei('10'), 0, ethers.constants.MaxUint256, testToken.address, signature);

    // upgrade to the new contract
    await proxyBridge.upgradeTo(newImplementation.address);
    // check the implementation slot according to EIP1967, for reference:
    // https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/65420cb9c943c32eb7e8c9da60183a413d90067a/contracts/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol#L34
    expect(
      `0x${(
        await ethers.provider.getStorageAt(
          proxyBridge.address,
          '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
        )
      ).substring(26)}`,
    ).to.equal(newImplementation.address.toLowerCase());
    // check admin role and other storage slots
    const upgradedProxyBridge = NewImplementationFactory.attach(proxyBridge.address);
    expect(
      await upgradedProxyBridge.hasRole(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        defaultAdminSigner.address,
      ),
    ).to.equal(true);
    expect(await upgradedProxyBridge.eoaAddressToNonce(accounts[2])).to.equal(1);
    expect(await upgradedProxyBridge.isSupported(testToken.address)).to.equal(true);
    expect(await upgradedProxyBridge.relayerAddress()).to.equal(defaultAdminSigner.address);
    expect((await upgradedProxyBridge.tokenAllowances(testToken.address)).dailyAllowance).to.equal(toWei('15'));
    expect(await upgradedProxyBridge.transactionFee()).to.equal(30);
  });

  it('Initialize the Bridge contract with `initializer` modifier', async () => {
    const { proxyBridge, defaultAdminSigner, operationalAdminSigner, communityAddress } = await loadFixture(
      deployContracts,
    );
    const TestBridgeFactory = await ethers.getContractFactory('TestBridgeInitializer');
    const TestContract = await TestBridgeFactory.deploy();
    await TestContract.deployed();
    const encodedData = TestBridgeInitializer__factory.createInterface().encodeFunctionData('initialize', [
      // admin address
      defaultAdminSigner.address,
      // operational address: GN safe
      operationalAdminSigner.address,
      // relayer address
      operationalAdminSigner.address,
      // community wallet address
      communityAddress,
      30,
      communityAddress,
      2,
    ]);

    // upgrade to the new contract
    await expect(proxyBridge.upgradeToAndCall(TestContract.address, encodedData)).to.be.rejectedWith(
      'Initializable: contract is already initialized',
    );
  });

  it('Initialize the Bridge contract with `reinitializer` modifier', async () => {
    const { defaultAdminSigner, operationalAdminSigner, communityAddress } = await loadFixture(deployContracts);
    const TestBridgeFactory = await ethers.getContractFactory('TestBridgeReinitializer');
    const TestContract = await TestBridgeFactory.deploy();
    await TestContract.deployed();
    const BridgeProxy = await ethers.getContractFactory('BridgeProxy');
    let encodedData = TestBridgeReinitializer__factory.createInterface().encodeFunctionData('initialize', [
      // admin address
      defaultAdminSigner.address,
      // operational address: GN safe
      operationalAdminSigner.address,
      // relayer address
      operationalAdminSigner.address,
      // community wallet address
      communityAddress,
      30,
      communityAddress,
      2,
      // added version number
      1,
    ]);

    const bridgeProxy = await BridgeProxy.deploy(TestContract.address, encodedData);
    await bridgeProxy.deployed();
    const proxyBridge = TestBridgeFactory.attach(bridgeProxy.address);
    // Version number should be equal to 1
    expect(await proxyBridge.version()).to.be.equal(1);

    const BridgeV1Factory = await ethers.getContractFactory('TestBridgeReinitializerTwo');
    const bridgeV1Contract = await BridgeV1Factory.deploy();
    await bridgeV1Contract.deployed();

    encodedData = TestBridgeReinitializerTwo__factory.createInterface().encodeFunctionData('initialize', [
      // admin address
      defaultAdminSigner.address,
      // operational address: GN safe
      operationalAdminSigner.address,
      // relayer address
      operationalAdminSigner.address,
      // community wallet address
      communityAddress,
      30,
      communityAddress,
      2,
      // Changing version number to 2
      2,
    ]);

    // upgrade to the new contract
    await proxyBridge.upgradeToAndCall(bridgeV1Contract.address, encodedData);
    // Version number should be equal to 2
    expect(await proxyBridge.version()).to.be.equal(2);
  });
});
