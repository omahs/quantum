import { AbiCoder } from '@ethersproject/abi';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { NewImplementation } from '../generated';
import { deployContracts } from './testUtils/deployment';
import { toWei } from './testUtils/mathUtils';

describe('Test Behaviour related to proxy', () => {
  describe('Test Proxy Upgradeability', () => {
    it('The smart contract retains the values of state variables after upgrading', async () => {
      const { testToken, proxyBridge, defaultAdminSigner } = await loadFixture(deployContracts);
      const accounts = await ethers.provider.listAccounts();

      const NewImplementationFactory = await ethers.getContractFactory('NewImplementation');
      const newImplementation = await NewImplementationFactory.deploy();
      await newImplementation.deployed();

      await testToken.mint(proxyBridge.address, toWei('100'));
      await proxyBridge.addSupportedTokens(testToken.address, toWei('15'), 0);

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
        amount: toWei('10'),
        nonce: 0,
        deadline: ethers.constants.MaxUint256,
        tokenAddress: testToken.address,
      };

      const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
      proxyBridge.claimFund(accounts[2], toWei('10'), 0, ethers.constants.MaxUint256, testToken.address, signature);

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
      expect(await upgradedProxyBridge.supportedTokens(testToken.address)).to.equal(true);
      expect(await upgradedProxyBridge.relayerAddress()).to.equal(defaultAdminSigner.address);
      expect((await upgradedProxyBridge.tokenAllowances(testToken.address)).dailyAllowance).to.equal(toWei('15'));
      expect(await upgradedProxyBridge.transactionFee()).to.equal(30);
    });
  });

  describe('Test different situations of calling the proxy contract', () => {
    let abiCoder: AbiCoder;
    let proxyBridge: NewImplementation;
    let defaultAdminSigner: SignerWithAddress;

    beforeEach(async () => {
      const NewImplementationFactory = await ethers.getContractFactory('NewImplementation');
      const newImplementation = await NewImplementationFactory.deploy();
      await newImplementation.deployed();
      const BridgeProxy = await ethers.getContractFactory('BridgeProxy');
      const bridgeProxy = await BridgeProxy.deploy(newImplementation.address, '0x');
      // console.log('Bridge Proxy ', bridgeProxy);
      await bridgeProxy.deployed();
      proxyBridge = NewImplementationFactory.attach(bridgeProxy.address);
      abiCoder = new ethers.utils.AbiCoder();
      const accounts = await ethers.provider.listAccounts();
      defaultAdminSigner = await ethers.getSigner(accounts[0]);
    });

    //              yes --> proxy's receive is called --> implementation's receive is called
    //               /
    // msg.data == empty
    //               \
    //               no --> proxy's fallback is called, passes msg.data and msg.value to implementation
    //                  --> evm matches the function signature in msg.data and the ones in the implementation contract's abi
    //                          /         \
    //                       no match      \
    //                         |            \
    //                        fail           match
    //                                      /     \
    //                       function is payable   \
    //                                   /        function is not payable
    //                  succeeds if all goes well       /           \
    //                                                 /             \
    //                                          msg.value == 0      msg.value > 0
    //                                              |                 |
    //                            succeeds if all goes well         fail

    it('Sucessful when sending no data and send some ether to the smart contract', async () => {
      const prevETHBalance = await ethers.provider.getBalance(proxyBridge.address);
      const tx = await defaultAdminSigner.sendTransaction({
        to: proxyBridge.address,
        data: '0x',
        value: toWei('1'),
      });
      const receipt = await tx.wait();
      // check the event emitted
      expect(receipt.logs[0].address).to.equal(proxyBridge.address);
      expect(receipt.logs[0].topics[0]).to.equal(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ETH_RECEIVED(address,uint256)')),
      );
      expect(receipt.logs[0].topics[1]).to.equal(abiCoder.encode(['address'], [defaultAdminSigner.address]));
      expect(receipt.logs[0].topics[2]).to.equal(abiCoder.encode(['uint256'], [toWei('1')]));
      const afterETHBalance = await ethers.provider.getBalance(proxyBridge.address);
      expect(afterETHBalance.sub(prevETHBalance)).to.equal(toWei('1'));
    });

    it('Revert when calling a method that is not in the implementation interface', async () => {
      const RandomContract = await ethers.getContractFactory('RandomContract');
      const attachedToken = RandomContract.attach(proxyBridge.address);
      await expect(attachedToken.randomFunctionToTest()).to.be.reverted;
    });

    it('Successful when calling a method that is in the implementation interface that is not payable, without sending ether (if all goes well)', async () => {
      expect(await proxyBridge.notPayableFunctionCalled()).to.equal(false);
      await defaultAdminSigner.sendTransaction({
        to: proxyBridge.address,
        data: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('notPayableFunction()')).substring(0, 10),
      });
      expect(await proxyBridge.notPayableFunctionCalled()).to.equal(true);
    });

    it('Revert when calling a method that is in the implementation interface that is not payable, and send ether', async () => {
      expect(await proxyBridge.notPayableFunctionCalled()).to.equal(false);
      await expect(
        defaultAdminSigner.sendTransaction({
          to: proxyBridge.address,
          data: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('notPayableFunction()')).substring(0, 10),
          value: 100,
        }),
      ).to.be.reverted;
      expect(await proxyBridge.notPayableFunctionCalled()).to.equal(false);
    });

    it('Successful when calling a method that is in the implementation interface that is payable, and send ether (if all goes well)', async () => {
      // view function, ethers make eth_call behind the scene
      expect(await proxyBridge.payableFunctionCalled()).to.equal(false);
      // non-pure, non-view function, ethers makes eth_sendTransaction instead
      await proxyBridge.payableFunction({ value: toWei('10') });
      expect(await proxyBridge.payableFunctionCalled()).to.equal(true);
    });

    it('Successful when calling a method that is in the implementation interface that is payable, without sending any ether (if all goes well)', async () => {
      expect(await proxyBridge.payableFunctionCalled()).to.equal(false);
      await proxyBridge.payableFunction();
      expect(await proxyBridge.payableFunctionCalled()).to.equal(true);
    });
  });
});
