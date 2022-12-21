import { ethers } from "ethers";

import {
  BridgeProxy,
  BridgeProxy__factory,
  BridgeUpgradeable,
  BridgeUpgradeable__factory,
  EvmContractManager,
  HardhatNetwork,
  HardhatNetworkContainer,
  StartedHardhatNetworkContainer,
} from "../src";
import { TestWalletData } from "../src/containers/HardhatNetwork";

describe("Bridge Contract", () => {
  const container = new HardhatNetworkContainer();
  let startedHardhatContainer: StartedHardhatNetworkContainer;
  let hardhatNetwork: HardhatNetwork;
  let evmContractManager: EvmContractManager;
  let defaultAdmin: TestWalletData;
  let operationalAdmin: TestWalletData;
  let bridgeUpgradeable: BridgeUpgradeable;
  let bridgeProxy: BridgeProxy;

  beforeAll(async () => {
    startedHardhatContainer = await container.start();
    hardhatNetwork = await startedHardhatContainer.ready();
    evmContractManager = hardhatNetwork.contracts;
    // Default and operational admin account
    defaultAdmin = await hardhatNetwork.createTestWallet();
    operationalAdmin = await hardhatNetwork.createTestWallet();
    // Deploying BridgeUpgradeable contract
    bridgeUpgradeable =
      await evmContractManager.deployContract<BridgeUpgradeable>({
        deploymentName: "BridgeUpgradeable",
        contractName: "BridgeUpgradeable",
        abi: BridgeUpgradeable__factory.abi,
      });
    await hardhatNetwork.generate(1);
    // deployment arguments for the Proxy contract
    const ABI = BridgeUpgradeable__factory.abi;
    const iface = new ethers.utils.Interface(ABI);
    const encodedData = iface.encodeFunctionData("initialize", [
      "CAKE_BRIDGE",
      "0.1",
      defaultAdmin.testWalletAddress,
      operationalAdmin.testWalletAddress,
      defaultAdmin.testWalletAddress,
    ]);
    // Deploying proxy contract
    bridgeProxy = await evmContractManager.deployContract<BridgeProxy>({
      deploymentName: "BridgeProxy",
      contractName: "BridgeProxy",
      deployArgs: [bridgeUpgradeable.address, encodedData],
      abi: BridgeProxy__factory.abi,
    });
    await hardhatNetwork.generate(1);
    bridgeUpgradeable = bridgeUpgradeable.attach(bridgeProxy.address);
    await hardhatNetwork.generate(1);
  });

  afterAll(async () => {
    await hardhatNetwork.stop();
  });

  describe("Proxy contract deployment", () => {
    it("Contract code should not be equal to '0x'", async () => {
      await expect(
        hardhatNetwork.ethersRpcProvider.getCode(bridgeUpgradeable.address)
      ).resolves.not.toStrictEqual("0x");
    });
    it("Admin address should be Default Admin address", async () => {
      const DEFAULT_ADMIN_ROLE =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      expect(
        await bridgeUpgradeable.hasRole(
          DEFAULT_ADMIN_ROLE,
          defaultAdmin.testWalletAddress
        )
      ).toBe(true);
    });
    it("Operational address should be Operational Admin address", async () => {
      const OPERATIONAL_ROLE = ethers.utils.solidityKeccak256(
        ["string"],
        ["OPERATIONAL_ROLE"]
      );
      expect(
        await bridgeUpgradeable.hasRole(
          OPERATIONAL_ROLE,
          operationalAdmin.testWalletAddress
        )
      ).toBe(true);
    });
    it("Relayer address should be Default Admin address", async () => {
      expect(await bridgeUpgradeable.relayerAddress()).toBe(
        defaultAdmin.testWalletAddress
      );
    });
  });
});
