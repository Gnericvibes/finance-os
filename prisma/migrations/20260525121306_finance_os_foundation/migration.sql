/*
  Warnings:

  - Added the required column `type` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('EXPENSE', 'INCOME', 'INVESTMENT', 'DEBT_PAYMENT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "FinancialStage" AS ENUM ('SURVIVAL', 'RECOVERY', 'STABLE', 'GROWTH', 'WEALTH_BUILDING');

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "EntryType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "housingCost" DOUBLE PRECISION NOT NULL,
    "utilitiesCost" DOUBLE PRECISION NOT NULL,
    "transportationCost" DOUBLE PRECISION NOT NULL,
    "foodCost" DOUBLE PRECISION NOT NULL,
    "debtAmount" DOUBLE PRECISION NOT NULL,
    "debtMonthlyPayment" DOUBLE PRECISION NOT NULL,
    "emergencyFundGoal" DOUBLE PRECISION NOT NULL,
    "savingsGoal" DOUBLE PRECISION NOT NULL,
    "dependents" INTEGER NOT NULL DEFAULT 0,
    "financialStage" "FinancialStage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PFOSBlueprint" (
    "id" TEXT NOT NULL,
    "survivalAllocation" DOUBLE PRECISION NOT NULL,
    "debtAllocation" DOUBLE PRECISION NOT NULL,
    "emergencyAllocation" DOUBLE PRECISION NOT NULL,
    "investmentAllocation" DOUBLE PRECISION NOT NULL,
    "lifestyleAllocation" DOUBLE PRECISION NOT NULL,
    "debtToIncomeRatio" DOUBLE PRECISION NOT NULL,
    "savingsRate" DOUBLE PRECISION NOT NULL,
    "liquidityScore" DOUBLE PRECISION NOT NULL,
    "pressureScore" DOUBLE PRECISION NOT NULL,
    "stabilityScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PFOSBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PFOSBlueprint_userId_key" ON "PFOSBlueprint"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PFOSBlueprint" ADD CONSTRAINT "PFOSBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
