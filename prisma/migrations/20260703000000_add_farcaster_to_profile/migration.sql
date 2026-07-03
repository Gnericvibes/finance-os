-- Add optional Farcaster creator identity to FinancialProfile.
ALTER TABLE "FinancialProfile" ADD COLUMN "farcasterFid" INTEGER;
ALTER TABLE "FinancialProfile" ADD COLUMN "farcasterUsername" TEXT;
ALTER TABLE "FinancialProfile" ADD COLUMN "farcasterDisplayName" TEXT;
ALTER TABLE "FinancialProfile" ADD COLUMN "farcasterPfpUrl" TEXT;
ALTER TABLE "FinancialProfile" ADD COLUMN "farcasterFollowers" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProfile_farcasterFid_key" ON "FinancialProfile"("farcasterFid");
