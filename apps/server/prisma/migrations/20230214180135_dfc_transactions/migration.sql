-- CreateEnum
CREATE TYPE "TokenSymbol" AS ENUM ('DFI', 'BTC', 'ETH', 'USDT', 'USDC');

-- CreateTable
CREATE TABLE "DeFiChainTransactions" (
    "id" BIGSERIAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "symbol" "TokenSymbol" NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DeFiChainTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeFiChainTransactions_transactionId_key" ON "DeFiChainTransactions"("transactionId");
