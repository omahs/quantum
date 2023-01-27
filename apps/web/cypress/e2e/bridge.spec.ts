describe.only("Test User Login", () => {
  before(() => {
    cy.setupMetamask(
      "a4dfb6fa1fef7cc26c2e09aad15de9f90e0fdedba6c272be8515a7b20ff5ecb2",
      "goerli",
      "password"
    ); // TODO: Try to use localhost data
  });

  it("should connect to MetaMask wallet", () => {
    cy.visit("http://localhost:3000");
    // Find "Connect Wallet" button and click it
    cy.contains("Connect wallet").click();
    // Find and select Metamask wallet
    cy.contains("MetaMask").click();
    // Accept metamask connection
    cy.acceptMetamaskAccess(false).should("be.true");
    cy.wait(2000);
    // Check UI change
    cy.contains("Goerli").contains("...").should("exist");
  });

  it("should be able to bridge funds from Ethereum to DeFiChain", () => {
    cy.findByTestId("amount").type("0.01").blur();
    cy.findByTestId("network-env-switch").click().contains("TestNet");
    cy.findByTestId("receiver-address")
      .type("tf1qm5hf2lhrsyfzeu0mnnzl3zllznfveua5rprhr4")
      .blur();
    cy.findByTestId("transfer-btn").click();
    cy.wait(2000);
    // TODO: Check confirm form fields
    cy.findByTestId("confirm-transfer-btn").click();
    cy.confirmMetamaskPermissionToSpend().should("be.true");
  });
});
