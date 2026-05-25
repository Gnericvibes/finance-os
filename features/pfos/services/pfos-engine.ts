import { FinancialStage } from "@prisma/client";

type ProfileInput = {
  monthlyIncome: number;

  housingCost: number;
  utilitiesCost: number;
  transportationCost: number;
  foodCost: number;

  debtAmount: number;
  debtMonthlyPayment: number;

  emergencyFundGoal: number;
  savingsGoal: number;

  dependents: number;
};

export class PFOSEngine {
  /*
   -----------------------------------
   CORE FINANCIAL CALCULATIONS
   -----------------------------------
  */

  static calculateTotalExpenses(
    profile: ProfileInput
  ) {
    return (
      profile.housingCost +
      profile.utilitiesCost +
      profile.transportationCost +
      profile.foodCost +
      profile.debtMonthlyPayment
    );
  }

  static calculateSavingsRate(
    profile: ProfileInput
  ) {
    const expenses =
      this.calculateTotalExpenses(profile);

    const remaining =
      profile.monthlyIncome - expenses;

    return (
      (remaining / profile.monthlyIncome) *
      100
    );
  }

  static calculateDebtToIncomeRatio(
    profile: ProfileInput
  ) {
    return (
      (profile.debtMonthlyPayment /
        profile.monthlyIncome) *
      100
    );
  }

  static calculateLiquidityScore(
    profile: ProfileInput
  ) {
    const expenses =
      this.calculateTotalExpenses(profile);

    const remaining =
      profile.monthlyIncome - expenses;

    if (remaining <= 0) return 10;

    if (
      remaining >=
      profile.monthlyIncome * 0.4
    ) {
      return 90;
    }

    if (
      remaining >=
      profile.monthlyIncome * 0.2
    ) {
      return 70;
    }

    return 40;
  }

  static calculatePressureScore(
    profile: ProfileInput
  ) {
    const debtRatio =
      this.calculateDebtToIncomeRatio(
        profile
      );

    const expenses =
      this.calculateTotalExpenses(profile);

    const expenseRatio =
      (expenses / profile.monthlyIncome) *
      100;

    let score = 0;

    score += debtRatio * 0.5;

    score += expenseRatio * 0.5;

    return Math.min(
      Math.round(score),
      100
    );
  }

  /*
   -----------------------------------
   FINANCIAL STAGE DETECTION
   -----------------------------------
  */

  static detectFinancialStage(
    profile: ProfileInput
  ): FinancialStage {
    const pressure =
      this.calculatePressureScore(profile);

    const savingsRate =
      this.calculateSavingsRate(profile);

    if (pressure >= 80) {
      return FinancialStage.SURVIVAL;
    }

    if (pressure >= 60) {
      return FinancialStage.RECOVERY;
    }

    if (
      savingsRate >= 35 &&
      pressure < 30
    ) {
      return FinancialStage.WEALTH_BUILDING;
    }

    if (
      savingsRate >= 20 &&
      pressure < 50
    ) {
      return FinancialStage.GROWTH;
    }

    return FinancialStage.STABLE;
  }

  /*
   -----------------------------------
   BLUEPRINT ALLOCATION ENGINE
   -----------------------------------
  */

  static generateAllocations(
    stage: FinancialStage
  ) {
    switch (stage) {
      case FinancialStage.SURVIVAL:
        return {
          survivalAllocation: 70,
          debtAllocation: 20,
          emergencyAllocation: 5,
          investmentAllocation: 0,
          lifestyleAllocation: 5,
        };

      case FinancialStage.RECOVERY:
        return {
          survivalAllocation: 60,
          debtAllocation: 20,
          emergencyAllocation: 10,
          investmentAllocation: 5,
          lifestyleAllocation: 5,
        };

      case FinancialStage.STABLE:
        return {
          survivalAllocation: 50,
          debtAllocation: 10,
          emergencyAllocation: 15,
          investmentAllocation: 15,
          lifestyleAllocation: 10,
        };

      case FinancialStage.GROWTH:
        return {
          survivalAllocation: 40,
          debtAllocation: 10,
          emergencyAllocation: 15,
          investmentAllocation: 25,
          lifestyleAllocation: 10,
        };

      case FinancialStage.WEALTH_BUILDING:
        return {
          survivalAllocation: 30,
          debtAllocation: 5,
          emergencyAllocation: 15,
          investmentAllocation: 40,
          lifestyleAllocation: 10,
        };

      default:
        return {
          survivalAllocation: 50,
          debtAllocation: 10,
          emergencyAllocation: 15,
          investmentAllocation: 15,
          lifestyleAllocation: 10,
        };
    }
  }

  /*
   -----------------------------------
   FULL BLUEPRINT GENERATION
   -----------------------------------
  */

  static generateBlueprint(
    profile: ProfileInput
  ) {
    const savingsRate =
      this.calculateSavingsRate(profile);

    const debtToIncomeRatio =
      this.calculateDebtToIncomeRatio(
        profile
      );

    const liquidityScore =
      this.calculateLiquidityScore(
        profile
      );

    const pressureScore =
      this.calculatePressureScore(
        profile
      );

    const financialStage =
      this.detectFinancialStage(profile);

    const allocations =
      this.generateAllocations(
        financialStage
      );

    const stabilityScore =
      Math.max(
        100 - pressureScore,
        0
      );

    return {
      financialStage,

      savingsRate,
      debtToIncomeRatio,

      liquidityScore,
      pressureScore,
      stabilityScore,

      ...allocations,
    };
  }

  /*
   -----------------------------------
   ENTRY DATABASE METHODS
   -----------------------------------
  */

  static async createEntry(data: {
    title: string;
    description?: string;
    amount: number;
    category: string;
    userId: string;
  }) {
    const { db } = await import(
      "@/lib/db"
    );

    return db.entry.create({
      data: {
        ...data,
        type: "EXPENSE",
      },
    });
  }
}