import { time } from "@nomicFoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  BridgeUpgradeable as Bridge,
  BridgeUpgradeable__factory,
  TestToken,
} from "../generated";

describe("Test Proxy", () => {
  let accounts: string[];
  let proxiedBridge: Bridge;
  let randomToken: TestToken;
  let randomToken2: TestToken;
  let defaultAdminSigner: SignerWithAddress;
  let operationalAdminSigner: SignerWithAddress;
  let arbitrarySigner: SignerWithAddress;
  beforeEach(async () => {
    accounts = await ethers.provider.listAccounts();
    defaultAdminSigner = await ethers.getSigner(accounts[0]);
    operationalAdminSigner = await ethers.getSigner(accounts[1]);
    arbitrarySigner = await ethers.getSigner(accounts[2]);
    const BridgeUpgradeable = await ethers.getContractFactory(
      "BridgeUpgradeable"
    );
    const bridgeUpgradeable = await BridgeUpgradeable.deploy();
    await bridgeUpgradeable.deployed();
    const BridgeProxy = await ethers.getContractFactory("BridgeProxy");
    const ABI = BridgeUpgradeable__factory.abi;
    const iface = new ethers.utils.Interface(ABI);
    const encodedData = iface.encodeFunctionData("initialize", [
      "CAKE_BRIDGE",
      "0.1",
      accounts[0],
      accounts[1],
      accounts[0],
    ]);
    const bridgeProxy = await BridgeProxy.deploy(
      bridgeUpgradeable.address,
      encodedData
    );
    await bridgeProxy.deployed();
    proxiedBridge = BridgeUpgradeable.attach(bridgeProxy.address);

    const ERC20 = await ethers.getContractFactory("TestToken");
    randomToken = await ERC20.deploy("Rand", "R");
    randomToken2 = await ERC20.deploy("Rand2", "R2");
  });
  describe("Contract deployment", () => {
    it("Be able to deploy proxy", async () => {
      // Check if the accounts[0] has the admin role.
      const DEFAULT_ADMIN_ROLE =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      expect(
        await proxiedBridge.hasRole(DEFAULT_ADMIN_ROLE, accounts[0])
      ).to.equal(true);
      // Check if the relayer address is same as accounts[0]
      expect(accounts[0]).to.be.equal(await proxiedBridge.relayerAddress());
      // Check if the accounts[1] has the OPERATIONAL_ROLE.
      const OPERATIONAL_ROLE = ethers.utils.solidityKeccak256(
        ["string"],
        ["OPERATIONAL_ROLE"]
      );
      expect(
        await proxiedBridge.hasRole(OPERATIONAL_ROLE, accounts[1])
      ).to.equal(true);
    });
  });

  describe("DeFiChain --> EVM", () => {
    let domainData: any;
    const eip712Types = {
      CLAIM: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "tokenAddress", type: "address" },
      ],
    };

    beforeEach(async () => {
      const ERC20 = await ethers.getContractFactory("TestToken");
      randomToken = await ERC20.deploy("Rand", "R");
      let tx = await randomToken.mint(proxiedBridge.address, 100);
      await tx.wait();
      tx = await proxiedBridge.addSupportedTokens(randomToken.address, 15);
      await tx.wait();

      domainData = {
        name: "CAKE_BRIDGE",
        version: "0.1",
        chainId: 1337,
        verifyingContract: proxiedBridge.address,
      };
    });

    it("Valid signature", async () => {
      const eip712Data = {
        to: accounts[0],
        amount: 10,
        nonce: 0,
        deadline: ethers.constants.MaxUint256,
        tokenAddress: randomToken.address,
      };

      const signature = await defaultAdminSigner._signTypedData(
        domainData,
        eip712Types,
        eip712Data
      );
      // Checking Balance before claiming fund, should be 0
      expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(
        0
      );
      const tx = await proxiedBridge.claimFund(
        accounts[0],
        10,
        0,
        ethers.constants.MaxUint256,
        randomToken.address,
        signature
      );
      await tx.wait();
      // Checking Balance after claiming fund, should be 10
      expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(
        10
      );
    });

    it("Invalid Signature", async () => {
      const eip712Data = {
        to: accounts[1],
        amount: 10,
        nonce: 0,
        deadline: ethers.constants.MaxUint256,
        tokenAddress: randomToken.address,
      };

      const signature = await operationalAdminSigner._signTypedData(
        domainData,
        eip712Types,
        eip712Data
      );
      await expect(
        proxiedBridge.claimFund(
          accounts[1],
          10,
          0,
          ethers.constants.MaxUint256,
          randomToken.address,
          signature
        )
      ).to.revertedWith("BC003");
      // Checking Balance after Unsuccessfully claiming fund, should be 0
      expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(
        0
      );
    });

    it("Incorrect nonce", async () => {
      // Correct nonce should be Zero
      await expect(
        proxiedBridge.claimFund(
          accounts[1],
          10,
          1,
          ethers.constants.MaxUint256,
          randomToken.address,
          "0x00"
        )
      ).to.revertedWith("BC001");
      // Checking Balance after Unsuccessfully claiming fund, should be 0
      expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(
        0
      );
    });

    it("Unsupported token", async () => {
      await expect(
        proxiedBridge.claimFund(
          accounts[1],
          10,
          0,
          ethers.constants.MaxUint256,
          randomToken2.address,
          "0x00"
        )
      ).to.revertedWith("BC002");
      // Checking Balance after Unsuccessfully claiming fund, should be 0
      expect(await randomToken.balanceOf(defaultAdminSigner.address)).to.equal(
        0
      );
    });
  });

  describe("EVM --> DeFiChain", () => {
    describe("Fail with unsupported token", () => {
      it("Bridge request before adding support for the token", async () => {
        // Will need to figure why DFI address On it's own failing Even when adding 0x and 0x00
        // @dev will look into later
        await expect(
          proxiedBridge.bridgeToDeFiChain(
            ethers.utils.toUtf8Bytes("8UxfcXBjxZDe45678uyghfcvnmbvbf9Tzn"),
            randomToken.address,
            10
          )
        ).to.be.revertedWith("BC002");
      });
    });

    describe("Test with one token", () => {
      beforeEach(async () => {
        let tx = await randomToken.mint(accounts[0], 100);
        await tx.wait();
        tx = await randomToken.approve(
          proxiedBridge.address,
          ethers.constants.MaxInt256
        );
        await tx.wait();
        tx = await proxiedBridge.addSupportedTokens(randomToken.address, 15);
        await tx.wait();
      });

      it("After 1 Day", async () => {
        const prevAllowance = await proxiedBridge.tokenAllowances(
          randomToken.address
        );
        let tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          10
        );
        await tx.wait();
        await expect(
          proxiedBridge.bridgeToDeFiChain(
            ethers.constants.AddressZero,
            randomToken.address,
            10
          )
        ).to.be.revertedWith("BC004");
        // Increasing time by 1 day and 1 hr (In seconds)
        await time.increase(60 * 60 * 25);
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          10
        );
        await tx.wait();
        const allowance = await proxiedBridge.tokenAllowances(
          randomToken.address
        );

        // Checking previous epoch
        expect(allowance[0]).to.equal(prevAllowance[0].add(60 * 60 * 24));
        // Checking daily allowance
        expect(allowance[1]).to.equal(15);
        // Checking current daily usage
        expect(allowance[2]).to.equal(10);
        // Checking the change allowance period
        expect(allowance[3]).to.equal(false);
      });

      it("After many Days", async () => {
        const prevAllowance = await proxiedBridge.tokenAllowances(
          randomToken.address
        );
        let tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          10
        );
        await tx.wait();
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          2
        );
        await tx.wait();
        // Increasing time by 2 days and an hr (In seconds)
        await time.increase(60 * 60 * 49);
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          9
        );
        await tx.wait();
        // Increasing time by 1 day (In seconds)
        await time.increase(60 * 60 * 24);
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          14
        );
        const allowance = await proxiedBridge.tokenAllowances(
          randomToken.address
        );

        // Checking previous epoch
        expect(allowance[0]).to.equal(prevAllowance[0].add(60 * 60 * 72));
        // Checking daily allowance
        expect(allowance[1]).to.equal(15);
        // Checking current daily usage
        expect(allowance[2]).to.equal(14);
        // Checking the change allowance period
        expect(allowance[3]).to.equal(false);
      });

      it("Change daily allowance", async () => {
        let tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          10
        );
        await tx.wait();
        tx = await proxiedBridge.changeDailyAllowance(randomToken.address, 5);
        await tx.wait();
        await expect(
          proxiedBridge.bridgeToDeFiChain(
            ethers.constants.AddressZero,
            randomToken.address,
            10
          )
        ).to.be.revertedWith("BC000");
        await expect(
          proxiedBridge.changeDailyAllowance(randomToken.address, 5)
        ).to.be.revertedWith("BC000");
        let allowance = await proxiedBridge.tokenAllowances(
          randomToken.address
        );
        expect(allowance[3]).to.equal(true);
        // Increasing time by 1 day (In seconds)
        await time.increase(60 * 60 * 24);
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          randomToken.address,
          2
        );
        await tx.wait();
        allowance = await proxiedBridge.tokenAllowances(randomToken.address);
        expect(allowance[2]).to.equal(2);
        expect(allowance[1]).to.equal(5);
        expect(allowance[3]).to.equal(false);
      });

      it("Only Admin & Operational roles able to change the daily allowance", async () => {
        // Admin changing the allowance of randomToken
        expect(
          (await proxiedBridge.tokenAllowances(randomToken.address))
            .daily_allowance
        ).to.equal(15);
        await proxiedBridge.changeDailyAllowance(randomToken.address, 10);
        expect(
          (await proxiedBridge.tokenAllowances(randomToken.address))
            .daily_allowance
        ).to.equal(10);

        // Increasing time by 1 day (In seconds)
        await time.increase(60 * 60 * 24);

        // Operation changing the allowance of randomToken2
        expect(
          (await proxiedBridge.tokenAllowances(randomToken.address))
            .daily_allowance
        ).to.equal(10);
        await proxiedBridge
          .connect(operationalAdminSigner)
          .changeDailyAllowance(randomToken.address, 20);
        expect(
          (await proxiedBridge.tokenAllowances(randomToken.address))
            .daily_allowance
        ).to.equal(20);

        // Revert txn if not by Admin or Operation wallet
        await expect(
          proxiedBridge
            .connect(arbitrarySigner)
            .changeDailyAllowance(randomToken.address, 20)
        ).to.be.revertedWithCustomError(
          proxiedBridge,
          "NON_AUTHORIZED_ADDRESS"
        );
        expect(
          (await proxiedBridge.tokenAllowances(randomToken.address))
            .daily_allowance
        ).to.equal(20);
      });
    });

    describe("Test with two tokens", () => {
      it("Function normal for two tokens", async () => {
        const ERC20 = await ethers.getContractFactory("TestToken");
        const token1 = await ERC20.deploy("Rand", "R");
        const token2 = await ERC20.deploy("Rand2", "R2");
        let tx = await token1.mint(accounts[0], 100);
        await tx.wait();
        tx = await token1.approve(
          proxiedBridge.address,
          ethers.constants.MaxInt256
        );
        await tx.wait();
        tx = await token2.mint(accounts[0], 100);
        await tx.wait();
        tx = await token2.approve(
          proxiedBridge.address,
          ethers.constants.MaxInt256
        );
        await tx.wait();
        tx = await proxiedBridge.addSupportedTokens(token1.address, 15);
        await tx.wait();
        tx = await proxiedBridge.addSupportedTokens(token2.address, 15);
        await tx.wait();
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          token1.address,
          10
        );
        await tx.wait();
        tx = await proxiedBridge.bridgeToDeFiChain(
          ethers.constants.AddressZero,
          token2.address,
          12
        );
        await tx.wait();
        const allowance1 = await proxiedBridge.tokenAllowances(token1.address);
        expect(allowance1[2]).to.equal(10);
        expect(allowance1[1]).to.equal(15);
        expect(allowance1[3]).to.equal(false);
        const allowance2 = await proxiedBridge.tokenAllowances(token2.address);
        expect(allowance2[2]).to.equal(12);
        expect(allowance2[1]).to.equal(15);
        expect(allowance2[3]).to.equal(false);
      });
    });
  });

  describe("Add and Removed Supported tokens", () => {
    beforeEach(async () => {
      await proxiedBridge.addSupportedTokens(randomToken.address, 15);
    });

    describe("DEFAULT_ADMIN_ROLE", () => {
      it("Successfully add token to supported list & allowance by Admin role address", async () => {
        // Adding the randomToken2 as the supported token by Admin role only.
        expect(
          await proxiedBridge.supportedTokens(randomToken2.address)
        ).to.equal(false);
        await proxiedBridge
          .connect(defaultAdminSigner)
          .addSupportedTokens(randomToken2.address, 15);
        // Checking RandomToken and it's allowance
        expect(
          await proxiedBridge.supportedTokens(randomToken.address)
        ).to.equal(true);
        expect(
          (
            await proxiedBridge.tokenAllowances(randomToken.address)
          ).daily_allowance.toString()
        ).to.equal("15");
        // Checking RandomToken2 and it's allowance
        expect(
          await proxiedBridge.supportedTokens(randomToken2.address)
        ).to.equal(true);
        expect(
          (
            await proxiedBridge.tokenAllowances(randomToken2.address)
          ).daily_allowance.toString()
        ).to.equal("15");
      });

      it("Unable to add existing token to supported list", async () => {
        // This test should fail if adding already supported token
        await expect(
          proxiedBridge
            .connect(defaultAdminSigner)
            .addSupportedTokens(randomToken.address, 15)
        ).to.revertedWith("BC005");
        expect(
          await proxiedBridge.supportedTokens(randomToken.address)
        ).to.equal(true);
      });

      it("Successfully remove existing token by Admin address", async () => {
        await proxiedBridge.removeSupportedTokens(randomToken.address);
        expect(
          await proxiedBridge
            .connect(defaultAdminSigner)
            .supportedTokens(randomToken.address)
        ).to.equal(false);
      });

      it("Unable to remove non-existing token from supported list", async () => {
        await expect(
          proxiedBridge
            .connect(defaultAdminSigner)
            .removeSupportedTokens(randomToken2.address)
        ).to.revertedWith("BC002");
      });
    });

    describe("OPERATIONAL_ROLE", () => {
      it("OPERATIONAL_ROLE address able to add token", async () => {
        // Adding the supported toke by OPERATIONAL_ROLE address
        await proxiedBridge
          .connect(operationalAdminSigner)
          .addSupportedTokens(randomToken2.address, 15);
        // Checking RandomToken2 and it's allowance
        expect(
          await proxiedBridge.supportedTokens(randomToken2.address)
        ).to.equal(true);
        expect(
          (
            await proxiedBridge.tokenAllowances(randomToken2.address)
          ).daily_allowance.toString()
        ).to.equal("15");
      });

      it("Unable to add existing token to supported list", async () => {
        // This test should fail if adding already supported token
        await expect(
          proxiedBridge
            .connect(operationalAdminSigner)
            .addSupportedTokens(randomToken.address, 15)
        ).to.revertedWith("BC005");
        expect(
          await proxiedBridge.supportedTokens(randomToken.address)
        ).to.equal(true);
      });

      it("Successfully remove existing token by OPERATIONAL_ROLE address", async () => {
        await proxiedBridge.removeSupportedTokens(randomToken.address);
        expect(
          await proxiedBridge
            .connect(operationalAdminSigner)
            .supportedTokens(randomToken.address)
        ).to.equal(false);
      });

      it("Unable to remove non-existing token from supported list", async () => {
        await expect(
          proxiedBridge
            .connect(defaultAdminSigner)
            .removeSupportedTokens(randomToken2.address)
        ).to.revertedWith("BC002");
      });
    });

    describe("ARBITRARY_EOA", () => {
      it("NON-ADMIN_ROLES address unable to add token", async () => {
        // This test should fail if adding token by non-ADMIN_ROLE
        await expect(
          proxiedBridge
            .connect(arbitrarySigner)
            .addSupportedTokens(randomToken2.address, 15)
        ).to.be.revertedWithCustomError(
          proxiedBridge,
          "NON_AUTHORIZED_ADDRESS"
        );
      });

      it("NON-ADMIN_ROLES address unable to remove token", async () => {
        // Error handling for the custom error
        await expect(
          proxiedBridge
            .connect(arbitrarySigner)
            .removeSupportedTokens(randomToken.address)
        ).to.be.revertedWithCustomError(
          proxiedBridge,
          "NON_AUTHORIZED_ADDRESS"
        );
      });
    });
  });

  describe("Withdrawal tests", () => {
    const tokens = 100;
    beforeEach(async () => {
      // Minting 100 tokens to Bridge
      let tx = await randomToken.mint(proxiedBridge.address, tokens);
      await tx.wait();
      tx = await randomToken2.mint(proxiedBridge.address, tokens);
      await tx.wait();
    });

    describe("DEFAULT_ADMIN_ROLE", () => {
      it("Successful Withdrawal by Admin only", async () => {
        // Checking the current balance
        expect(await randomToken.balanceOf(proxiedBridge.address)).to.equal(
          tokens
        );
        expect(await randomToken2.balanceOf(proxiedBridge.address)).to.equal(
          tokens
        );

        // Withdrawal by Admin
        let tx = await proxiedBridge
          .connect(defaultAdminSigner)
          .withdraw(randomToken.address, 20);
        await tx.wait();
        tx = await proxiedBridge
          .connect(defaultAdminSigner)
          .withdraw(randomToken2.address, 30);
        await tx.wait();
        // Sanity check for account balances
        expect(await randomToken.balanceOf(proxiedBridge.address)).to.equal(80);
        expect(await randomToken2.balanceOf(proxiedBridge.address)).to.equal(
          70
        );
        expect(
          await randomToken.balanceOf(defaultAdminSigner.address)
        ).to.equal(20);
        expect(
          await randomToken2.balanceOf(defaultAdminSigner.address)
        ).to.equal(30);
      });

      it("Unable to withdraw more than the balance of the Bridge", async () => {
        // Test should be revert with a mention string if Admin requesting amount bigger than actual balance of the Bridge.
        await expect(
          proxiedBridge
            .connect(defaultAdminSigner)
            .withdraw(randomToken.address, 110)
        ).to.revertedWith("ERC20: transfer amount exceeds balance");
      });
    });
    describe("OPERATIONAL_ROLE", () => {
      it("Unsuccessful withdrawal by Operational Admin", async () => {
        // Withdrawal by Operation Admin should be rejected
        await expect(
          proxiedBridge
            .connect(operationalAdminSigner)
            .withdraw(randomToken.address, 20)
        ).to.revertedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      });
    });
    describe("ARBITRARY_EOA", () => {
      it("Unsuccessful withdrawal by other EOA", async () => {
        // Withdrawal by another Admin should be rejected
        await expect(
          proxiedBridge
            .connect(arbitrarySigner)
            .withdraw(randomToken2.address, 20)
        ).to.revertedWith(
          "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
      });
    });
  });

  describe("Relayer address change", () => {
    describe("DEFAULT_ADMIN_ROLE", () => {
      it("Successfully change the relayer address By Admin account", async () => {
        // Change relayer address by Admin
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
        await proxiedBridge
          .connect(defaultAdminSigner)
          .changeRelayerAddress(accounts[1]);
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[1]);
      });

      it("Unable to change if new address is 0x0", async () => {
        // Test will fail with the error if input address is a dead address "0x0"
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
        await expect(
          proxiedBridge
            .connect(defaultAdminSigner)
            .changeRelayerAddress("0x0000000000000000000000000000000000000000")
        ).to.revertedWith("BC006");
      });
    });

    describe("OPERATIONAL_ROLE", () => {
      it("Successfully change the relayer address by Operational address", async () => {
        // Change relayer address by Operations
        await proxiedBridge
          .connect(operationalAdminSigner)
          .changeRelayerAddress(accounts[3]);
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[3]);
      });

      it("Unable to change if new address is 0x0", async () => {
        // Test will fail with the error if input address is a dead address "0x0"
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
        await expect(
          proxiedBridge
            .connect(operationalAdminSigner)
            .changeRelayerAddress("0x0000000000000000000000000000000000000000")
        ).to.revertedWith("BC006");
      });
    });

    describe("ARBITRARY_EOA", () => {
      it("Unable to change relayer address if not Admin or Operations", async () => {
        // Test will fail if the signer is neither admin or operational admin
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
        await expect(
          proxiedBridge
            .connect(arbitrarySigner)
            .changeRelayerAddress(accounts[1])
        ).to.be.revertedWithCustomError(
          proxiedBridge,
          "NON_AUTHORIZED_ADDRESS"
        );
        expect(await proxiedBridge.relayerAddress()).to.equal(accounts[0]);
      });
    });
  });
});
