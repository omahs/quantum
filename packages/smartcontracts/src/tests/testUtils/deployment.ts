import { ethers } from 'hardhat';

import { BridgeV1__factory } from '../../generated';

export async function deployContracts() {
  const accounts = await ethers.provider.listAccounts();
  const defaultAdminSigner = await ethers.getSigner(accounts[0]);
  const operationalAdminSigner = await ethers.getSigner(accounts[1]);
  const arbitrarySigner = await ethers.getSigner(accounts[2]);
  const BridgeUpgradeable = await ethers.getContractFactory('BridgeV1');
  const bridgeUpgradeable = await BridgeUpgradeable.deploy();
  await bridgeUpgradeable.deployed();
  const BridgeProxy = await ethers.getContractFactory('BridgeProxy');
  const ABI = BridgeV1__factory.abi;
  const iface = new ethers.utils.Interface(ABI);
  const encodedData = iface.encodeFunctionData('initialize', [
    'CAKE_BRIDGE',
    '0.1',
    accounts[0],
    accounts[1],
    accounts[0],
    30,
  ]);
  const bridgeProxy = await BridgeProxy.deploy(bridgeUpgradeable.address, encodedData);
  await bridgeProxy.deployed();
  const proxyBridge = BridgeUpgradeable.attach(bridgeProxy.address);
  // Deploying ERC20 tokens
  const ERC20 = await ethers.getContractFactory('TestToken');
  const testToken = await ERC20.deploy('Test', 'T');
  const testToken2 = await ERC20.deploy('Test2', 'T2');

  return {
    proxyBridge,
    testToken,
    testToken2,
    defaultAdminSigner,
    operationalAdminSigner,
    arbitrarySigner,
  };
}
