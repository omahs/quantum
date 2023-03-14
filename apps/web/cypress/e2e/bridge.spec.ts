// TODO: Mock wallet data

beforeEach(() => {
  cy.visit("http://localhost:3000/?network=TestNet", {
    onBeforeLoad: (win) => {
      let nextData: any;
      Object.defineProperty(win, "__NEXT_DATA__", {
        set(o) {
          console.log("setting __NEXT_DATA__", o.props.pageProps);
          // here is our change to modify the injected parsed data
          o.props.pageProps.isBridgeUp = true;
          nextData = o;
        },
        get() {
          return nextData;
        },
      });
    },
  });
});

describe("Bridge from Ethereum to DeFiChain", () => {
  before(() => {
    // either import or change to Local hardhat network
    // cy.addMetamaskNetwork({
    //   networkName: "Localhost 8545",
    //   chainId: "1337",
    //   rpcUrl: "https://localhost:8545",
    //   symbol: "ETH",
    //   isTestnet: true,
    // });
    cy.changeMetamaskNetwork("Localhost 8545");
    // either import or switch to admin acc, get the acc and private key from docker, it's publicly known
    // cy.importMetamaskAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    // cy.switchMetamaskAccount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  });

  it("should be able to connect to metamask wallet", () => {
    cy.findByTestId("connect-button").should("be.visible");
    cy.connectMetaMaskWallet();
    cy.findByTestId("wallet-button").should("be.visible");
  });

  it("should be able to bridge funds from Ethereum to DeFiChain", () => {
    cy.connectMetaMaskWallet();
    cy.findByTestId("amount").type("0.01").blur();
    // Temp remove for Testnet testing
    // cy.findByTestId("network-env-switch").click().contains("Playground"); // TODO: Replace `Playground` with `TestNet` once MainNet is ready
    cy.findByTestId("receiver-address").should("exist");
    cy.findByTestId("transfer-btn").should("exist");
    // TODO: Check confirm form fields
  });

  it("should be able to disconnect from metamask wallet", () => {
    cy.connectMetaMaskWallet();
    cy.findByTestId("wallet-button").should("be.visible");
    cy.disconnectMetaMaskWallet();
    cy.findByTestId("connect-button").should("be.visible");
  });
});
