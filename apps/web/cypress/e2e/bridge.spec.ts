// TODO: Mock wallet data

beforeEach(() => {
  cy.visit("http://localhost:3000/?network=Local", {
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
