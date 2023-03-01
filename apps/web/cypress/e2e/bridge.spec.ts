// TODO: Mock wallet data

describe("Bridge from Ethereum to DeFiChain", () => {
  beforeEach(async () => {
    cy.visit("http://localhost:3000");
    cy.connectMetaMaskWallet();
  });

  it("should be able to bridge funds from Ethereum to DeFiChain", () => {
    cy.findByTestId("amount").type("0.01").blur();
    // Temp remove for Testnet testing
    // cy.findByTestId("network-env-switch").click().contains("Playground"); // TODO: Replace `Playground` with `TestNet` once MainNet is ready
    cy.findByTestId("receiver-address").should("exist");
    cy.findByTestId("transfer-btn").should("exist");
    // TODO: Check confirm form fields
  });
});
