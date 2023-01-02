// import { time } from '@nomicfoundation/hardhat-network-helpers';
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import { expect } from 'chai';
// import { BigNumber } from 'ethers';
// import { ethers } from 'hardhat';

// import { BridgeV1, BridgeV1__factory, TestToken } from '../generated';

// function calculateFee(amount: BigNumber, transactionFee: BigNumber): BigNumber {
//   const feeAmount = amount.mul(transactionFee).div(10000);
//   const netAmountAfterFee = amount.sub(feeAmount);
//   return netAmountAfterFee;
// }

// function toWei(amount: string): BigNumber {
//   return ethers.utils.parseEther(amount);
// }

// describe('Test Proxy', () => {
//   let accounts: string[];
//   let proxiedBridge: BridgeV1;
//   let randomToken: TestToken;
//   let randomToken2: TestToken;
//   let defaultAdminSigner: SignerWithAddress;
//   let operationalAdminSigner: SignerWithAddress;
//   let arbitrarySigner: SignerWithAddress;
//   beforeEach(async () => {
//     accounts = await ethers.provider.listAccounts();
//     defaultAdminSigner = await ethers.getSigner(accounts[0]);
//     operationalAdminSigner = await ethers.getSigner(accounts[1]);
//     arbitrarySigner = await ethers.getSigner(accounts[2]);
//     const BridgeUpgradeable = await ethers.getContractFactory('BridgeV1');
//     const bridgeUpgradeable = await BridgeUpgradeable.deploy();
//     await bridgeUpgradeable.deployed();
//     const BridgeProxy = await ethers.getContractFactory('BridgeProxy');
//     const ABI = BridgeV1__factory.abi;
//     const iface = new ethers.utils.Interface(ABI);
//     const encodedData = iface.encodeFunctionData('initialize', [
//       'CAKE_BRIDGE',
//       '0.1',
//       accounts[0],
//       accounts[1],
//       accounts[0],
//       30,
//     ]);
//     const bridgeProxy = await BridgeProxy.deploy(bridgeUpgradeable.address, encodedData);
//     await bridgeProxy.deployed();
//     proxiedBridge = BridgeUpgradeable.attach(bridgeProxy.address);
//     // Deploying ERC20 tokens
//     const ERC20 = await ethers.getContractFactory('TestToken');
//     randomToken = await ERC20.deploy('Rand', 'R');
//     randomToken2 = await ERC20.deploy('Rand2', 'R2');
//   });

//   describe('Contract deployment', () => {
//     it('Be able to deploy proxy', async () => {
//       // Check if the accounts[0] has the admin role.
//       const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
//       expect(await proxiedBridge.hasRole(DEFAULT_ADMIN_ROLE, accounts[0])).to.equal(true);
//       // Check if the relayer address is same as accounts[0]
//       expect(accounts[0]).to.be.equal(await proxiedBridge.relayerAddress());
//       // Check if the accounts[1] has the OPERATIONAL_ROLE.
//       const OPERATIONAL_ROLE = ethers.utils.solidityKeccak256(['string'], ['OPERATIONAL_ROLE']);
//       expect(await proxiedBridge.hasRole(OPERATIONAL_ROLE, accounts[1])).to.equal(true);
//     });
//   });

//   describe('DeFiChain --> EVM', () => {
//     let domainData: any;
//     const eip712Types = {
//       CLAIM: [
//         { name: 'to', type: 'address' },
//         { name: 'amount', type: 'uint256' },
//         { name: 'nonce', type: 'uint256' },
//         { name: 'deadline', type: 'uint256' },
//         { name: 'tokenAddress', type: 'address' },
//       ],
//     };

//     beforeEach(async () => {
//       const ERC20 = await ethers.getContractFactory('TestToken');
//       randomToken = await ERC20.deploy('Rand', 'R');
//       let tx = await randomToken.mint(proxiedBridge.address, toWei('100'));
//       await tx.wait();
//       tx = await proxiedBridge.addSupportedTokens(randomToken.address, toWei('15'));
//       await tx.wait();

//       domainData = {
//         name: 'CAKE_BRIDGE',
//         version: '0.1',
//         chainId: 1337,
//         verifyingContract: proxiedBridge.address,
//       };
//     });

//     it('Valid signature', async () => {
//       const eip712Data = {
//         to: accounts[0],
//         amount: toWei('10'),
//         nonce: 0,
//         deadline: ethers.constants.MaxUint256,
//         tokenAddress: randomToken.address,
//       };

//       const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
//       // Checking Balance before claiming fund, should be 0
//       expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
//       const tx = await proxiedBridge.claimFund(
//         accounts[0],
//         toWei('10'),
//         0,
//         ethers.constants.MaxUint256,
//         randomToken.address,
//         signature,
//       );
//       await tx.wait();
//       // Checking Balance after claiming fund, should be 10
//       expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(toWei('10'));
//     });

//     it('Invalid Signature', async () => {
//       const eip712Data = {
//         to: accounts[1],
//         amount: toWei('10'),
//         nonce: 0,
//         deadline: ethers.constants.MaxUint256,
//         tokenAddress: randomToken.address,
//       };

//       const signature = await operationalAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
//       await expect(
//         proxiedBridge.claimFund(
//           accounts[1],
//           toWei('10'),
//           0,
//           ethers.constants.MaxUint256,
//           randomToken.address,
//           signature,
//         ),
//       ).to.revertedWith('BC003');
//       // Checking Balance after Unsuccessfully claiming fund, should be 0
//       expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
//     });

//     it('Incorrect nonce', async () => {
//       // Correct nonce should be Zero
//       await expect(
//         proxiedBridge.claimFund(accounts[1], toWei('10'), 1, ethers.constants.MaxUint256, randomToken.address, '0x00'),
//       ).to.revertedWith('BC001');
//       // Checking Balance after Unsuccessfully claiming fund, should be 0
//       expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
//     });

//     it('Unsupported token', async () => {
//       await expect(
//         proxiedBridge.claimFund(accounts[1], toWei('10'), 0, ethers.constants.MaxUint256, randomToken2.address, '0x00'),
//       ).to.revertedWith('BC002');
//       // Checking Balance after Unsuccessfully claiming fund, should be 0
//       expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(0);
//     });

//     it('Successfully emitted event when claiming fund', async () => {
//       const eip712Data = {
//         to: accounts[0],
//         amount: toWei('10'),
//         nonce: 0,
//         deadline: ethers.constants.MaxUint256,
//         tokenAddress: randomToken.address,
//       };

//       const signature = await defaultAdminSigner._signTypedData(domainData, eip712Types, eip712Data);
//       // Event called CLAIM_FUND should be emitted when Successfully claim fund
//       await expect(
//         proxiedBridge.claimFund(
//           accounts[0],
//           toWei('10'),
//           0,
//           ethers.constants.MaxUint256,
//           randomToken.address,
//           signature,
//         ),
//       )
//         .to.emit(proxiedBridge, 'CLAIM_FUND')
//         .withArgs(randomToken.address, accounts[0], toWei('10'));
//     });
//   });

//   describe('EVM --> DeFiChain', () => {
//     describe('Fail with unsupported token', () => {
//       it('Bridge request before adding support for the token', async () => {
//         // Will need to figure why DFI address On it's own failing Even when adding 0x and 0x00
//         // @dev will look into later
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(
//             ethers.utils.toUtf8Bytes('8defichainBurnAddressXXXXXXXdRQkSm'),
//             randomToken.address,
//             toWei('10'),
//           ),
//         ).to.be.revertedWith('BC002');
//       });
//     });

//     describe('Test with one token', () => {
//       beforeEach(async () => {
//         let tx = await randomToken.mint(accounts[0], ethers.utils.parseEther('100'));
//         await tx.wait();
//         tx = await randomToken.approve(proxiedBridge.address, ethers.constants.MaxInt256);
//         await tx.wait();
//         tx = await proxiedBridge.addSupportedTokens(randomToken.address, ethers.utils.parseEther('15'));
//         await tx.wait();
//       });

//       it('Successfully revert if the amount exceeding', async () => {
//         // Testing with randomToken (already added in supported token)
//         // Daily allowance is 15. Should revert with the error if exceeding daily allowance
//         // Current daily usage should be zero
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(0);
//         // Bridging 15 token to defiChain. After this txn only able to bridge dailyAllowance(15) - 15 = 0 tokens
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('15'));
//         // Initial balance is 100, should be 85.
//         expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(toWei('85'));
//         // Current daily usage should be 15
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('15'));
//         // This txn should revert if the exceeding daily balance of 15
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('20')),
//         ).to.revertedWith('BC004');
//         // Current daily usage should be 15. Above txn didn't succeed
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('15'));
//       });

//       it('Resetting daily allowance', async () => {
//         // Testing with randomToken (already added in supported token)
//         // Daily allowance is 15. Should revert with the error if exceeding daily allowance
//         // Current daily usage should be zero
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(0);
//         // Bridging 15 token to defiChain. After this txn only able to bridge dailyAllowance(15) - 15 = 0 tokens
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('15'));
//         // Initial balance is 100, should be 85.
//         expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(toWei('85'));
//         // Current daily usage should be 15
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('15'));
//         // This txn should revert if the exceeding daily balance of 15
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('20')),
//         ).to.revertedWith('BC004');
//         // Current daily usage should be 15. Above txn didn't succeed
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('15'));
//         // Waiting for a day to reset the allowance.
//         await time.increase(60 * 60 * 25);
//         // After a day. Bridging 12 token. Txn should not revert.
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('12'));
//         // This txn should revert if the exceeding daily balance of 15
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('4')),
//         ).to.revertedWith('BC004');
//         // Current daily usage should be 12
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('12'));
//         // Bridging 3 token again. Txn should not revert.
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('3'));
//         // Current daily usage should be 15
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).currentDailyUsage).to.equal(toWei('15'));
//       });

//       it('After many Days', async () => {
//         const prevAllowance = await proxiedBridge.tokenAllowances(randomToken.address);
//         let tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('10'));
//         await tx.wait();
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('2'));
//         await tx.wait();
//         // Increasing time by 2 days and an hr (In seconds)
//         await time.increase(60 * 60 * 49);
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('9'));
//         await tx.wait();
//         // Increasing time by 1 day (In seconds)
//         await time.increase(60 * 60 * 24);
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('14'));
//         const allowance = await proxiedBridge.tokenAllowances(randomToken.address);

//         // Checking previous epoch
//         expect(allowance[0]).to.equal(prevAllowance[0].add(60 * 60 * 72));
//         // Checking daily allowance
//         expect(allowance[1]).to.equal(toWei('15'));
//         // Checking current daily usage
//         expect(allowance[2]).to.equal(toWei('14'));
//         // Checking the change allowance period
//         expect(allowance[3]).to.equal(false);
//       });

//       it('Change daily allowance', async () => {
//         let tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('10'));
//         await tx.wait();
//         tx = await proxiedBridge.changeDailyAllowance(randomToken.address, toWei('5'));
//         await tx.wait();
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('10')),
//         ).to.be.revertedWith('BC000');
//         await expect(proxiedBridge.changeDailyAllowance(randomToken.address, toWei('5'))).to.be.revertedWith('BC000');
//         let allowance = await proxiedBridge.tokenAllowances(randomToken.address);
//         expect(allowance[3]).to.equal(true);
//         // Increasing time by 1 day (In seconds)
//         await time.increase(60 * 60 * 24);
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('2'));
//         await tx.wait();
//         allowance = await proxiedBridge.tokenAllowances(randomToken.address);
//         expect(allowance[2]).to.equal(toWei('2'));
//         expect(allowance[1]).to.equal(toWei('5'));
//         expect(allowance[3]).to.equal(false);
//       });

//       describe('Daily Allowance change by different accounts', async () => {
//         it('DEFAULT_ADMIN_ROLE', async () => {
//           // Admin changing the allowance of randomToken
//           expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance).to.equal(toWei('15'));
//           await proxiedBridge.connect(defaultAdminSigner).changeDailyAllowance(randomToken.address, toWei('10'));
//           expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance).to.equal(toWei('10'));
//         });

//         it('OPERATIONAL_ROLE', async () => {
//           // Operation changing the allowance of randomToken
//           await proxiedBridge.connect(operationalAdminSigner).changeDailyAllowance(randomToken.address, toWei('20'));
//           // This where we are exposed to token daily allowance
//           expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance).to.equal(toWei('20'));
//         });

//         it('ARBITRARY_EOA', async () => {
//           // Revert txn if not by Admin or Operation wallet
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).changeDailyAllowance(randomToken.address, toWei('20')),
//           ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//           expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance).to.equal(toWei('15'));
//         });
//       });

//       it('No deposit to DefiChain if in change allowance period', async () => {
//         // Checking if the inChangeAllowancePeriod is false
//         expect((await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).inChangeAllowancePeriod).to.equal(
//           false,
//         );
//         // Changing allowance from 15 to 20 for randomToken
//         await proxiedBridge.changeDailyAllowance(randomToken.address, 20);
//         // Check if the allowance has been changed to 20
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance).to.equal(20);
//         // Confirming inChangeAllowancePeriod is true
//         expect((await proxiedBridge.tokenAllowances(randomToken.address)).inChangeAllowancePeriod).to.equal(true);
//         // This txn should be revert with the error "B000"
//         // Sending 11 Ether to the bridge
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, 11),
//         ).to.revertedWith('BC000');
//       });

//       it('Successfully emitted event when bridging to defiChain', async () => {
//         // Event called BRIDGE_TO_DEFI_CHAIN should be emitted when Successfully bridged token to DefiChain
//         // Getting timestamp
//         const blockNumBefore = await ethers.provider.getBlockNumber();
//         const blockBefore = await ethers.provider.getBlock(blockNumBefore);
//         // Need to add to the timestamp of the previous block to match the next block the tx is mined in
//         const expectedTimestamp = blockBefore.timestamp + 1;
//         // Getting decimal power from random token and tx fee from the bridged contract.
//         const txFee = await proxiedBridge.transactionFee();
//         // Calculating amount after tx fees
//         const netAmountAfterFee = calculateFee(toWei('10'), txFee);
//         // Sending 15 Eth as well. Users must not send ERC20 token and ETH together. Depending on token address - only the respected token will be added.
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, randomToken.address, toWei('10'), {
//             value: toWei('15'),
//           }),
//         )
//           .to.emit(proxiedBridge, 'BRIDGE_TO_DEFI_CHAIN')
//           .withArgs(ethers.constants.AddressZero, randomToken.address, netAmountAfterFee, expectedTimestamp);
//       });

//       it('Successfully emitted event when changing allowances', async () => {
//         // Event called CHANGE_DAILY_ALLOWANCE should be emitted when changes token's allowances
//         await expect(proxiedBridge.changeDailyAllowance(randomToken.address, toWei('10')))
//           .to.emit(proxiedBridge, 'CHANGE_DAILY_ALLOWANCE')
//           .withArgs(randomToken.address, toWei('10'));
//       });
//     });

//     describe('Test with two tokens', () => {
//       it('Function normal for two tokens', async () => {
//         const ERC20 = await ethers.getContractFactory('TestToken');
//         const token1 = await ERC20.deploy('Rand', 'R');
//         const token2 = await ERC20.deploy('Rand2', 'R2');
//         let tx = await token1.mint(accounts[0], 100);
//         await tx.wait();
//         tx = await token1.approve(proxiedBridge.address, ethers.constants.MaxInt256);
//         await tx.wait();
//         tx = await token2.mint(accounts[0], 100);
//         await tx.wait();
//         tx = await token2.approve(proxiedBridge.address, ethers.constants.MaxInt256);
//         await tx.wait();
//         tx = await proxiedBridge.addSupportedTokens(token1.address, 15);
//         await tx.wait();
//         tx = await proxiedBridge.addSupportedTokens(token2.address, 15);
//         await tx.wait();
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, token1.address, 10);
//         await tx.wait();
//         tx = await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, token2.address, 12);
//         await tx.wait();
//         const allowance1 = await proxiedBridge.tokenAllowances(token1.address);
//         expect(allowance1[2]).to.equal(10);
//         expect(allowance1[1]).to.equal(15);
//         expect(allowance1[3]).to.equal(false);
//         const allowance2 = await proxiedBridge.tokenAllowances(token2.address);
//         expect(allowance2[2]).to.equal(12);
//         expect(allowance2[1]).to.equal(15);
//         expect(allowance2[3]).to.equal(false);
//       });
//     });

//     describe('Allowance Support for ETH token', () => {
//       describe('Only Admins can set or change allowance ', () => {
//         it('DEFAULT_ADMIN_ROLE', async () => {
//           // Set Allowance to 10 ether by admin address
//           await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(ethers.constants.AddressZero, toWei('10'));
//           expect(await (await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).dailyAllowance).to.equal(
//             toWei('10'),
//           );
//         });

//         it('OPERATIONAL_ROLE', async () => {
//           // Set Allowance to 10 ether by operational address
//           await proxiedBridge
//             .connect(operationalAdminSigner)
//             .addSupportedTokens(ethers.constants.AddressZero, toWei('10'));
//           expect(await (await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).dailyAllowance).to.equal(
//             toWei('10'),
//           );
//         });

//         it('ARBITRARY_EOA', async () => {
//           // Set Allowance to 10 ether by EOA address
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).addSupportedTokens(ethers.constants.AddressZero, toWei('10')),
//           ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         });
//       });

//       it('Not able to change daily allowance if un-supported token', async () => {
//         // This should revert with the error "ONLY_SUPPORTED_TOKENS"
//         await expect(
//           proxiedBridge.changeDailyAllowance(ethers.constants.AddressZero, toWei('12')),
//         ).to.revertedWithCustomError(proxiedBridge, 'ONLY_SUPPORTED_TOKENS');
//       });

//       it('Unable to bridge if no allowance added', async () => {
//         // This txn should be revert if no allowance added
//         // Sending 1 Ether
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, toWei('1')),
//         ).to.revertedWith('BC002');
//       });

//       it('No deposit to DefiChain if in change allowance period', async () => {
//         // Checking if the inChangeAllowancePeriod is false
//         expect(
//           await (
//             await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)
//           ).inChangeAllowancePeriod,
//         ).to.equal(false);
//         // Set Allowance to 10 ether by admin address
//         await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(ethers.constants.AddressZero, 10);
//         // Changing allowance to set the notInChangeAllowancePeriod to 'True'
//         await proxiedBridge.connect(defaultAdminSigner).changeDailyAllowance(ethers.constants.AddressZero, 15);
//         // Check if the allowance has been changed to 15
//         expect(await (await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).dailyAllowance).to.equal(15);
//         expect(
//           await (
//             await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)
//           ).inChangeAllowancePeriod,
//         ).to.equal(true);
//         // This txn should be revert with the error "B000"
//         // Sending 11 Ether to the bridge
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, toWei('11')),
//         ).to.revertedWith('BC000');
//       });

//       it('Unable to bridge if amount exceeds allowance limit', async () => {
//         // Set Allowance to 10 ether
//         await proxiedBridge.addSupportedTokens(ethers.constants.AddressZero, 10);
//         // This txn should be revert with "BC004"
//         // Sending 11 Ether to the bridge
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, 0, {
//             value: toWei('11'),
//           }),
//         ).to.revertedWith('BC004');
//       });

//       it('Bridging to DefiChain', async () => {
//         // set allowance to 10 Ether
//         await proxiedBridge.addSupportedTokens(ethers.constants.AddressZero, toWei('10'));
//         // Checking ETHER balance before bridging. Must be 0
//         expect(await ethers.provider.getBalance(proxiedBridge.address)).to.equal(0);
//         // Bridging 5 ether
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, 0, {
//           value: toWei('5'),
//         });
//         // Proxied bridge contract must have the 5 ether now
//         expect(await ethers.provider.getBalance(proxiedBridge.address)).to.equal(toWei('5'));
//       });

//       it('Successfully emitting events upon bridging', async () => {
//         // set allowance to 10 Ether
//         await proxiedBridge.addSupportedTokens(ethers.constants.AddressZero, toWei('10'));
//         // Getting timestamp
//         const blockNumBefore = await ethers.provider.getBlockNumber();
//         const blockBefore = await ethers.provider.getBlock(blockNumBefore);
//         // This is the pervious block, need to add the other block to match the coming tx's block
//         const timestampBefore = blockBefore.timestamp + 1;
//         // Tx fee
//         const txFee = await proxiedBridge.transactionFee();
//         // Calculating amount after tx fees
//         const netAmountAfterFee = calculateFee(toWei('3'), txFee);
//         // Emitting an event "BRIDGE_TO_DEFI_CHAIN"
//         // Users sending ETH can put any "_amount". Only "value" amount will be counted
//         await expect(
//           proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, toWei('5'), {
//             value: toWei('3'),
//           }),
//         )
//           .to.emit(proxiedBridge, 'BRIDGE_TO_DEFI_CHAIN')
//           .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, netAmountAfterFee, timestampBefore);
//       });
//     });
//   });

//   describe('Add and Removed Supported ETH and ERC20 tokens', () => {
//     beforeEach(async () => {
//       await proxiedBridge.addSupportedTokens(randomToken.address, 15);
//     });

//     describe('ERC20: adding and removing from the supported list', () => {
//       describe('DEFAULT_ADMIN_ROLE', () => {
//         it('Successfully add token to supported list & allowance by Admin role address', async () => {
//           // Adding the randomToken2 as the supported token by Admin role only.
//           expect(await proxiedBridge.supportedTokens(randomToken2.address)).to.equal(false);
//           await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(randomToken2.address, 15);
//           // Checking RandomToken and it's allowance
//           expect(await proxiedBridge.supportedTokens(randomToken.address)).to.equal(true);
//           expect((await proxiedBridge.tokenAllowances(randomToken.address)).dailyAllowance.toString()).to.equal('15');
//           // Checking RandomToken2 and it's allowance
//           expect(await proxiedBridge.supportedTokens(randomToken2.address)).to.equal(true);
//           expect((await proxiedBridge.tokenAllowances(randomToken2.address)).dailyAllowance.toString()).to.equal('15');
//         });

//         it('Unable to add existing token to supported list', async () => {
//           // This test should fail if adding already supported token
//           await expect(
//             proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(randomToken.address, 15),
//           ).to.revertedWith('BC005');
//           expect(await proxiedBridge.supportedTokens(randomToken.address)).to.equal(true);
//         });

//         it('Successfully remove existing token by Admin address', async () => {
//           await proxiedBridge.removeSupportedTokens(randomToken.address);
//           expect(await proxiedBridge.connect(defaultAdminSigner).supportedTokens(randomToken.address)).to.equal(false);
//         });

//         it('Unable to remove non-existing token from supported list', async () => {
//           await expect(
//             proxiedBridge.connect(defaultAdminSigner).removeSupportedTokens(randomToken2.address),
//           ).to.revertedWith('BC002');
//         });
//       });

//       describe('OPERATIONAL_ROLE', () => {
//         it('OPERATIONAL_ROLE address able to add token', async () => {
//           // Adding the supported toke by OPERATIONAL_ROLE address
//           await proxiedBridge.connect(operationalAdminSigner).addSupportedTokens(randomToken2.address, 15);
//           // Checking RandomToken2 and it's allowance
//           expect(await proxiedBridge.supportedTokens(randomToken2.address)).to.equal(true);
//           expect((await proxiedBridge.tokenAllowances(randomToken2.address)).dailyAllowance.toString()).to.equal('15');
//         });

//         it('Unable to add existing token to supported list', async () => {
//           // This test should fail if adding already supported token
//           await expect(
//             proxiedBridge.connect(operationalAdminSigner).addSupportedTokens(randomToken.address, 15),
//           ).to.revertedWith('BC005');
//           expect(await proxiedBridge.supportedTokens(randomToken.address)).to.equal(true);
//         });

//         it('Successfully remove existing token by OPERATIONAL_ROLE address', async () => {
//           await proxiedBridge.removeSupportedTokens(randomToken.address);
//           expect(await proxiedBridge.connect(operationalAdminSigner).supportedTokens(randomToken.address)).to.equal(
//             false,
//           );
//         });

//         it('Unable to remove non-existing token from supported list', async () => {
//           await expect(
//             proxiedBridge.connect(defaultAdminSigner).removeSupportedTokens(randomToken2.address),
//           ).to.revertedWith('BC002');
//         });
//       });

//       describe('ARBITRARY_EOA', () => {
//         it('NON-ADMIN_ROLES address unable to add token', async () => {
//           // This test should fail if adding token by non-ADMIN_ROLE
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).addSupportedTokens(randomToken2.address, 15),
//           ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         });

//         it('NON-ADMIN_ROLES address unable to remove token', async () => {
//           // Error handling for the custom error
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).removeSupportedTokens(randomToken.address),
//           ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         });
//       });

//       it('Successfully emitted the event when the supported token added by Admin Address', async () => {
//         // Event called ADD_SUPPORTED_TOKEN should be emitted when Successfully added a token in supported list. Only admins are able to call the tokens
//         await expect(proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(randomToken2.address, 10))
//           .to.emit(proxiedBridge, 'ADD_SUPPORTED_TOKEN')
//           .withArgs(randomToken2.address, 10);
//       });

//       it('Successfully emitted the event when the supported token removed by Admin Address', async () => {
//         // Event called REMOVE_SUPPORTED_TOKEN should be emitted when Successfully removed a token from supported list. Only admins are able to call the tokens
//         await expect(proxiedBridge.connect(defaultAdminSigner).removeSupportedTokens(randomToken.address))
//           .to.emit(proxiedBridge, 'REMOVE_SUPPORTED_TOKEN')
//           .withArgs(randomToken.address);
//       });
//     });

//     describe('ETH: adding and removing from the supported list', () => {
//       describe('DEFAULT_ADMIN_ROLE ', () => {
//         it('Admin adding the Ether as a supported token', async () => {
//           // By default ether is supported by all smart contracts on mainnet. When calling 'addSupportedTokens', it sets the ether allowance to '_dailyAllowance'
//           // User will not be able to withdraw more than '_dailyAllowance' set.
//           // Set Allowance to 10 ether by admin address
//           await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(ethers.constants.AddressZero, 10);
//           expect(await (await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).dailyAllowance).to.equal(10);
//         });

//         it('Admin removes Ether as a supported token', async () => {
//           // Set Allowance to 10 ether by admin address
//           await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(ethers.constants.AddressZero, 10);
//           // When removing ether from the supported list, we can set the '_dailyAllowance' to 0.
//           // This will freeze of ether to DefiChain.
//           // Set Allowance to 0 ether by admin address
//           await proxiedBridge.connect(defaultAdminSigner).removeSupportedTokens(ethers.constants.AddressZero);
//           expect(await proxiedBridge.supportedTokens(ethers.constants.AddressZero)).to.equal(false);
//         });
//       });

//       describe('OPERATIONAL_ROLE', () => {
//         it('Operational adding the Ether as a supported token', async () => {
//           // Set Allowance to 10 ether by operational address
//           await proxiedBridge.connect(operationalAdminSigner).addSupportedTokens(ethers.constants.AddressZero, 10);
//           expect(await (await proxiedBridge.tokenAllowances(ethers.constants.AddressZero)).dailyAllowance).to.equal(10);
//         });

//         it('Operational removes Ether as a supported token', async () => {
//           // Set Allowance to 10 ether by Operational address
//           await proxiedBridge.connect(operationalAdminSigner).addSupportedTokens(ethers.constants.AddressZero, 10);
//           // Set Allowance to 0 ether by Operational address
//           await proxiedBridge.connect(operationalAdminSigner).removeSupportedTokens(ethers.constants.AddressZero);
//           expect(await proxiedBridge.supportedTokens(ethers.constants.AddressZero)).to.equal(false);
//         });
//       });

//       describe('ARBITRARY_EOA', () => {
//         it('Only admin and Operational address can add supported token', async () => {
//           // Set Allowance to 10 ether by EOA address
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).addSupportedTokens(ethers.constants.AddressZero, 10),
//           ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         });

//         it('Only admin and Operational address can remove supported token', async () => {
//           // Set Allowance to 0 ether by EOA address
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).removeSupportedTokens(ethers.constants.AddressZero),
//           ).to.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         });
//       });
//     });
//   });

//   describe('Withdrawal tests', () => {
//     describe('Withdraw ERC20 token', () => {
//       const tokens = toWei('100');
//       beforeEach(async () => {
//         // Minting 100 tokens to Bridge
//         let tx = await randomToken.mint(proxiedBridge.address, toWei('100'));
//         await tx.wait();
//         tx = await randomToken2.mint(proxiedBridge.address, toWei('100'));
//         await tx.wait();
//       });

//       describe('DEFAULT_ADMIN_ROLE', () => {
//         it('Successful Withdrawal by Admin only', async () => {
//           // Checking the current balance
//           expect(await randomToken.balanceOf(proxiedBridge.address)).to.equal(tokens);
//           expect(await randomToken2.balanceOf(proxiedBridge.address)).to.equal(tokens);

//           // Withdrawal by Admin
//           let tx = await proxiedBridge.connect(defaultAdminSigner).withdraw(randomToken.address, toWei('20'));
//           await tx.wait();
//           tx = await proxiedBridge.connect(defaultAdminSigner).withdraw(randomToken2.address, toWei('30'));
//           await tx.wait();
//           // Sanity check for account balances
//           expect(await randomToken.balanceOf(proxiedBridge.address)).to.equal(toWei('80'));
//           expect(await randomToken2.balanceOf(proxiedBridge.address)).to.equal(toWei('70'));
//           expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(toWei('20'));
//           expect(await randomToken2.balanceOf(defaultAdminSigner.address)).to.equal(toWei('30'));
//         });

//         it('Unable to withdraw more than the balance of the Bridge', async () => {
//           // Test should be revert with a mention string if Admin requesting amount bigger than actual balance of the Bridge.
//           await expect(
//             proxiedBridge.connect(defaultAdminSigner).withdraw(randomToken.address, toWei('110')),
//           ).to.revertedWith('ERC20: transfer amount exceeds balance');
//         });
//       });
//       describe('OPERATIONAL_ROLE', () => {
//         it('Unsuccessful withdrawal by Operational Admin', async () => {
//           // Withdrawal by Operation Admin should be rejected
//           await expect(
//             proxiedBridge.connect(operationalAdminSigner).withdraw(randomToken.address, toWei('20')),
//           ).to.revertedWith(
//             'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//           );
//         });
//       });
//       describe('ARBITRARY_EOA', () => {
//         it('Unsuccessful withdrawal by other EOA', async () => {
//           // Withdrawal by another Admin should be rejected
//           await expect(
//             proxiedBridge.connect(arbitrarySigner).withdraw(randomToken2.address, toWei('20')),
//           ).to.revertedWith(
//             'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//           );
//         });
//       });
//     });

//     describe('Withdraw ETHER', () => {
//       beforeEach(async () => {
//         // Adding init allowance for 10 ETHER
//         await proxiedBridge.connect(defaultAdminSigner).addSupportedTokens(ethers.constants.AddressZero, toWei('10'));
//         // Bridging 10 ETHER
//         await proxiedBridge.bridgeToDeFiChain(ethers.constants.AddressZero, ethers.constants.AddressZero, 0, {
//           value: toWei('10'),
//         });
//       });

//       describe('Only Admin can withdraw ETHER', () => {
//         it('DEFAULT_ADMIN_ROLE', async () => {
//           // Checking Proxy contract balance. Should be 10
//           expect(await ethers.provider.getBalance(proxiedBridge.address)).to.equal(toWei('10'));
//           // Checking balance admin balance before withdrawing 2 ethers
//           console.log(
//             'Admin ETH balance before withdrawing 2 ethers: ',
//             ethers.utils.formatEther(await ethers.provider.getBalance(defaultAdminSigner.address)),
//           );
//           // 2 ETHER withdrawal by the Admin
//           await proxiedBridge.connect(defaultAdminSigner).withdrawEth(toWei('2'));

//           // Checking balance admin balance after withdrawing 2 ethers
//           console.log(
//             'Admin ETH balance after withdrawing 2 ETH: ',
//             ethers.utils.formatEther(await ethers.provider.getBalance(defaultAdminSigner.address)),
//           );
//           // Checking Proxy contract balance. Should be 8
//           expect(await ethers.provider.getBalance(proxiedBridge.address)).to.equal(toWei('8'));
//         });

//         it('OPERATIONAL_ROLE', async () => {
//           // This txn should be reverted with the Access control error
//           await expect(proxiedBridge.connect(operationalAdminSigner).withdrawEth(toWei('2'))).to.revertedWith(
//             'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//           );
//         });

//         it('ARBITRARY_EOA', async () => {
//           // This txn should be reverted with the Access control error
//           await expect(proxiedBridge.connect(arbitrarySigner).withdrawEth(toWei('2'))).to.revertedWith(
//             'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//           );
//         });
//       });

//       it('Unable to withdraw specified amount', async () => {
//         // This txn should revert with error "NOT_ENOUGH_ETHEREUM". Contract has only 10ETH
//         await expect(proxiedBridge.connect(defaultAdminSigner).withdrawEth(toWei('15'))).to.revertedWithCustomError(
//           proxiedBridge,
//           'NOT_ENOUGH_ETHEREUM',
//         );
//       });

//       it('Successfully emitting events upon withdrawal owner', async () => {
//         // Withdrawing all 10 Ether
//         await expect(proxiedBridge.connect(defaultAdminSigner).withdrawEth(toWei('10')))
//           .to.emit(proxiedBridge, 'ETH_WITHDRAWAL_BY_OWNER')
//           .withArgs(defaultAdminSigner.address, toWei('10'));
//       });
//     });
//   });

//   describe('Relayer address change', () => {
//     describe('DEFAULT_ADMIN_ROLE', () => {
//       it('Successfully change the relayer address By Admin account', async () => {
//         // Change relayer address by Admin and Operational addresses
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
//         await proxiedBridge.connect(defaultAdminSigner).changeRelayerAddress(accounts[1]);
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[1]);
//       });

//       it('Unable to change if new address is 0x0', async () => {
//         // Test will fail with the error if input address is a dead address "0x0"
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
//         await expect(
//           proxiedBridge.connect(defaultAdminSigner).changeRelayerAddress('0x0000000000000000000000000000000000000000'),
//         ).to.revertedWith('BC006');
//       });

//       it('Successfully emitted the event on change of relayer address', async () => {
//         // Event called RELAYER_ADDRESS_CHANGED should be emitted on Successful withdrawal by the Admin and Operational addresses only
//         await expect(proxiedBridge.connect(defaultAdminSigner).changeRelayerAddress(accounts[4]))
//           .to.emit(proxiedBridge, 'RELAYER_ADDRESS_CHANGED')
//           .withArgs(accounts[0], accounts[4]);
//       });
//     });

//     describe('OPERATIONAL_ROLE', () => {
//       it('Successfully change the relayer address by Operational address', async () => {
//         // Change relayer address by Admin and Operational addresses
//         await proxiedBridge.connect(operationalAdminSigner).changeRelayerAddress(accounts[3]);
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[3]);
//       });

//       it('Unable to change if new address is 0x0', async () => {
//         // Test will fail with the error if input address is a dead address "0x0"
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
//         await expect(
//           proxiedBridge
//             .connect(operationalAdminSigner)
//             .changeRelayerAddress('0x0000000000000000000000000000000000000000'),
//         ).to.revertedWith('BC006');
//       });

//       it('Successfully emitted the event on change of relayer address', async () => {
//         // Event called RELAYER_ADDRESS_CHANGED should be emitted on Successful withdrawal by the Admin and Operational addresses only
//         await expect(proxiedBridge.connect(operationalAdminSigner).changeRelayerAddress(accounts[4]))
//           .to.emit(proxiedBridge, 'RELAYER_ADDRESS_CHANGED')
//           .withArgs(accounts[0], accounts[4]);
//       });
//     });

//     describe('ARBITRARY_EOA', () => {
//       it('Unable to change relayer address if not Admin or Operations', async () => {
//         // Test will fail if the signer is neither admin or operational admin
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
//         await expect(
//           proxiedBridge.connect(arbitrarySigner).changeRelayerAddress(accounts[1]),
//         ).to.be.revertedWithCustomError(proxiedBridge, 'NON_AUTHORIZED_ADDRESS');
//         expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
//       });
//     });
//   });

//   describe('Transaction fee tests', () => {
//     describe('DEFAULT_ADMIN_ROLE', () => {
//       it('Successfully implemented the 0.3% fee', async () => {
//         // Checking if the implemented fee is 0.3%
//         await expect(await proxiedBridge.transactionFee()).to.equal(30);
//       });

//       it('Successfully changes the fee by Admin account', async () => {
//         // Admin should successfully changes the tx fees to 0.05%
//         await proxiedBridge.connect(defaultAdminSigner).changeTxFee(5);
//         // New fee should be 0.05%
//         await expect(await proxiedBridge.transactionFee()).to.equal(5);
//       });

//       it('Successfully emitted the event on changes of txn fee', async () => {
//         // Event called TRANSACTION_FEE_CHANGED should be emitted on Successful withdrawal by the Admin only
//         await expect(proxiedBridge.connect(defaultAdminSigner).changeTxFee(50))
//           .to.emit(proxiedBridge, 'TRANSACTION_FEE_CHANGED')
//           .withArgs(30, 50);
//       });
//     });

//     describe('OPERATIONAL_ROLE', () => {
//       it('Unable to change the fee by Operational address', async () => {
//         // Txn should revert with the AccessControl error
//         await expect(proxiedBridge.connect(operationalAdminSigner).changeTxFee(50)).to.rejectedWith(
//           'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//         );
//       });
//     });

//     describe('ARBITRARY_EOA', () => {
//       it('Unable to change the fee by another address', async () => {
//         // Txn should revert with the AccessControl error
//         await expect(proxiedBridge.connect(arbitrarySigner).changeTxFee(50)).to.rejectedWith(
//           'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
//         );
//       });
//     });
//   });
// });
