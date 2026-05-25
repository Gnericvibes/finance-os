/*
  Warnings:

  - Added the required column `financialStage` to the `PFOSBlueprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PFOSBlueprint" ADD COLUMN     "financialStage" "FinancialStage" NOT NULL;
