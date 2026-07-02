// features/pfos/services/pfos-engine.ts

export type ProfileInput = {
  monthlyIncome: number;

  rentHousing?: number | null;
  food?: number | null;
  transport?: number | null;
  utilities?: number | null;
  schoolFees?: number | null;
  subscriptions?: number | null;
  healthCare?: number | null;
  miscellaneousExpenses?: number | null;

  totalDebt?: number | null;
  repaymentAmount?: number | null;

  dependentsCount?: number;
};

export type BlueprintMode =
  | "SURVIVAL"
  | "RECOVERY"
  | "STABLE"
  | "GROWTH"
  | "WEALTH_BUILDING";

export class PFOSEngine {
  /*
   -----------------------------------
   EXPENSE CALCULATIONS
   -----------------------------------
  */

  static calculateTotalExpenses(
    profile: ProfileInput
  ): number {
    return (
      (profile.rentHousing ?? 0) +
      (profile.food ?? 0) +
      (profile.transport ?? 0) +
      (profile.utilities ?? 0) +
      (profile.schoolFees ?? 0) +
      (profile.subscriptions ?? 0) +
      (profile.healthCare ?? 0) +
      (profile.miscellaneousExpenses ?? 0) +
      (profile.repaymentAmount ?? 0)
    );
  }

  static calculateDisposableIncome(
    profile: ProfileInput
  ): number {
    return (
      profile.monthlyIncome -
      this.calculateTotalExpenses(profile)
    );
  }

  static calculateSavingsRate(
    profile: ProfileInput
  ): number {
    const disposable =
      this.calculateDisposableIncome(profile);

    if (profile.monthlyIncome <= 0) {
      return 0;
    }

    return (
      (disposable / profile.monthlyIncome) *
      100
    );
  }

  /*
   -----------------------------------
   DEBT ANALYSIS
   -----------------------------------
  */

  static calculateDebtToIncomeRatio(
    profile: ProfileInput
  ): number {
    if (profile.monthlyIncome <= 0) {
      return 100;
    }

    return (
      ((profile.repaymentAmount ?? 0) /
        profile.monthlyIncome) *
      100
    );
  }

  /*
   -----------------------------------
   LIQUIDITY ANALYSIS
   -----------------------------------
  */

  static calculateLiquidityScore(
    profile: ProfileInput
  ): number {
    const disposable =
      this.calculateDisposableIncome(profile);

    if (disposable <= 0) return 10;

    const ratio =
      disposable / profile.monthlyIncome;

    if (ratio >= 0.4) return 90;

    if (ratio >= 0.25) return 75;

    if (ratio >= 0.15) return 60;

    return 40;
  }

  /*
   -----------------------------------
   PRESSURE ANALYSIS
   -----------------------------------
  */

  static calculatePressureScore(
    profile: ProfileInput
  ): number {
    const debtRatio =
      this.calculateDebtToIncomeRatio(profile);

    if (profile.monthlyIncome <= 0) {
  return 100;
}

const expenseRatio =
  (this.calculateTotalExpenses(profile) /
    profile.monthlyIncome) *
  100;

    const score =
      debtRatio * 0.5 +
      expenseRatio * 0.5;

    return Math.min(
      Math.round(score),
      100
    );
  }

static calculateFinancialHealthScore(
  profile: ProfileInput
): number {
  const pressure =
    this.calculatePressureScore(profile);

  const liquidity =
    this.calculateLiquidityScore(profile);

  const savingsRate =
    this.calculateSavingsRate(profile);

  const debtRatio =
    this.calculateDebtToIncomeRatio(profile);

  const stage =
    this.detectBlueprintMode(profile);

  const stageBonusMap: Record<
    BlueprintMode,
    number
  > = {
    SURVIVAL: 0,
    RECOVERY: 5,
    STABLE: 10,
    GROWTH: 15,
    WEALTH_BUILDING: 20,
  };

  const stageBonus =
    stageBonusMap[stage];

  const debtPenalty =
    debtRatio > 50
      ? 20
      : debtRatio > 35
      ? 10
      : debtRatio > 20
      ? 5
      : 0;

  const baseScore =
    liquidity * 0.35 +
    savingsRate * 0.30 +
    (100 - pressure) * 0.25 +
    (100 - debtRatio) * 0.10;

  const finalScore =
    baseScore +
    stageBonus -
    debtPenalty;

  return Math.max(
    0,
    Math.min(
      Math.round(finalScore),
      100
    )
  );
}

  /*
   -----------------------------------
   PFOS MODE DETECTION
   -----------------------------------
  */

  static detectBlueprintMode(
    profile: ProfileInput
  ): BlueprintMode {
    const pressure =
      this.calculatePressureScore(profile);

    const savingsRate =
      this.calculateSavingsRate(profile);

    if (pressure >= 80) {
      return "SURVIVAL";
    }

    if (pressure >= 60) {
      return "RECOVERY";
    }

    if (
      savingsRate >= 35 &&
      pressure < 30
    ) {
      return "WEALTH_BUILDING";
    }

    if (
      savingsRate >= 20 &&
      pressure < 50
    ) {
      return "GROWTH";
    }

    return "STABLE";
  }

  /*
   -----------------------------------
   ALLOCATION ENGINE
   -----------------------------------
  */

  static generateAllocations(
    mode: BlueprintMode
  ) {
    switch (mode) {
      case "SURVIVAL":
        return {
          operationalPercentage: 75,
          debtPercentage: 20,
          emergencyPercentage: 5,
          investmentPercentage: 0,
        };

      case "RECOVERY":
        return {
          operationalPercentage: 65,
          debtPercentage: 20,
          emergencyPercentage: 10,
          investmentPercentage: 5,
        };

      case "STABLE":
        return {
          operationalPercentage: 55,
          debtPercentage: 10,
          emergencyPercentage: 15,
          investmentPercentage: 20,
        };

      case "GROWTH":
        return {
          operationalPercentage: 45,
          debtPercentage: 10,
          emergencyPercentage: 15,
          investmentPercentage: 30,
        };

      case "WEALTH_BUILDING":
        return {
          operationalPercentage: 35,
          debtPercentage: 5,
          emergencyPercentage: 15,
          investmentPercentage: 45,
        };

      default:
        return {
          operationalPercentage: 55,
          debtPercentage: 10,
          emergencyPercentage: 15,
          investmentPercentage: 20,
        };
    }
  }

  /*
   -----------------------------------
   COMPLETE PFOS BLUEPRINT
   -----------------------------------
  */

  static generateBlueprint(
    profile: ProfileInput
  ) {
    const mode =
      this.detectBlueprintMode(profile);

    const allocations =
      this.generateAllocations(mode);

    const income =
      profile.monthlyIncome;

    const financialHealthScore =
      this.calculateFinancialHealthScore(
        profile
      );

    return {
      blueprintMode: mode,

      operationalAllocation:
        income *
        (allocations.operationalPercentage /
          100),

      debtAllocation:
        income *
        (allocations.debtPercentage / 100),

      emergencyAllocation:
        income *
        (allocations.emergencyPercentage /
          100),

      investmentAllocation:
        income *
        (allocations.investmentPercentage /
          100),

      operationalPercentage:
        allocations.operationalPercentage,

      debtPercentage:
        allocations.debtPercentage,

      emergencyPercentage:
        allocations.emergencyPercentage,

      investmentPercentage:
        allocations.investmentPercentage,

      financialHealthScore,

      isDebtFree:
        (profile.totalDebt ?? 0) <= 0,

      savingsRate:
        this.calculateSavingsRate(profile),

      debtToIncomeRatio:
        this.calculateDebtToIncomeRatio(
          profile
        ),

      liquidityScore:
        this.calculateLiquidityScore(
          profile
        ),

      pressureScore:
        this.calculatePressureScore(
          profile
        ),

      stabilityScore:
        100 -
        this.calculatePressureScore(profile),
    };
  }

  /*
   -----------------------------------
   DATABASE METHODS
   -----------------------------------
  */

    static async createEntry(data: {
    title: string;
    description?: string;
    amount: number;
    category: string;
    userId: string;
    type:
      | "EXPENSE"
      | "INCOME"
      | "INVESTMENT"
      | "DEBT_PAYMENT"
      | "TRANSFER";
  }) {
    const { db } = await import("@/lib/db");

    const categoryName = data.category.trim();

    const category =
      (await db.category.findFirst({
        where: {
          userId: data.userId,
          name: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
      })) ??
      (await db.category.create({
        data: {
          userId: data.userId,
          name: categoryName,
        },
      }));

        return db.entry.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        userId: data.userId,
                type: data.type,
        categoryId: category.id,

      },
    });

  }

}