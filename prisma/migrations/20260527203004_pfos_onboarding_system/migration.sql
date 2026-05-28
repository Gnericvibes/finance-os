-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('SALARIED', 'FREELANCER', 'BUSINESS_OWNER', 'STUDENT', 'UNEMPLOYED');

-- CreateEnum
CREATE TYPE "IncomeFrequency" AS ENUM ('MONTHLY', 'WEEKLY', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "FinancialGoal" AS ENUM ('EMERGENCY_FUND', 'DEBT_FREE', 'HOME_OWNERSHIP', 'BUSINESS', 'RETIREMENT', 'FINANCIAL_FREEDOM');

-- CreateTable
CREATE TABLE "FinancialProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "additionalIncome" DOUBLE PRECISION,
    "incomeFrequency" "IncomeFrequency" NOT NULL,
    "hasDebt" BOOLEAN NOT NULL DEFAULT false,
    "totalDebt" DOUBLE PRECISION,
    "monthlyDebtPayments" DOUBLE PRECISION,
    "debtInterestRate" DOUBLE PRECISION,
    "missedPayments" BOOLEAN NOT NULL DEFAULT false,
    "mainFinancialGoal" "FinancialGoal" NOT NULL,
    "emergencySavingsGoal" DOUBLE PRECISION,
    "interestedInInvesting" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialBlueprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investmentAllocation" DOUBLE PRECISION NOT NULL,
    "debtAllocation" DOUBLE PRECISION NOT NULL,
    "treasuryAllocation" DOUBLE PRECISION NOT NULL,
    "operationalAllocation" DOUBLE PRECISION NOT NULL,
    "emergencyAllocation" DOUBLE PRECISION NOT NULL,
    "isDebtFree" BOOLEAN NOT NULL,
    "financialHealthScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "recommended" DOUBLE PRECISION NOT NULL,
    "actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyFund" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "treasurySavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investmentCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProfile_userId_key" ON "FinancialProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialBlueprint_userId_key" ON "FinancialBlueprint"("userId");

-- AddForeignKey
ALTER TABLE "FinancialProfile" ADD CONSTRAINT "FinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialBlueprint" ADD CONSTRAINT "FinancialBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsAccount" ADD CONSTRAINT "SavingsAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
