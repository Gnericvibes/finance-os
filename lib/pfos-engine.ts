export interface PFOSInput {
  income: number;
  hasDebt: boolean;
  totalDebt?: number;
}

export interface PFOSResult {
  mode: string;

  allocations: {
    operations: number;
    debt: number;
    investing: number;
    emergency: number;
  };

  percentages: {
    operations: number;
    debt: number;
    investing: number;
    emergency: number;
  };

  financialHealthScore: number;

  interpretation: string;
}

export function generatePFOS(
  data: PFOSInput
): PFOSResult {
  const {
    income,
    hasDebt,
    totalDebt,
  } = data;

  /*
   ---------------------------------------
   DEBT MODE
   ---------------------------------------
  */

  if (hasDebt) {
    const operations =
      income * 0.7;

    const debt =
      income * 0.2;

    const investing =
      income * 0.1;

    let score = 55;

    if (
      totalDebt &&
      totalDebt < income * 3
    ) {
      score += 10;
    }

    return {
      mode: "RECOVERY_MODE",

      allocations: {
        operations,
        debt,
        investing,
        emergency: 0,
      },

      percentages: {
        operations: 70,
        debt: 20,
        investing: 10,
        emergency: 0,
      },

      financialHealthScore:
        score,

      interpretation:
        "PFOS has entered Recovery Mode to eliminate financial drag and stabilize your system.",
    };
  }

  /*
   ---------------------------------------
   NO DEBT MODE
   ---------------------------------------
  */

  const operations =
    income * 0.75;

  const investing =
    income * 0.2;

  const emergency =
    income * 0.05;

  return {
    mode:
      "EXPANSION_MODE",

    allocations: {
      operations,
      debt: 0,
      investing,
      emergency,
    },

    percentages: {
      operations: 75,
      debt: 0,
      investing: 20,
      emergency: 5,
    },

    financialHealthScore:
      82,

    interpretation:
      "PFOS has entered Expansion Mode. Your system is optimized for wealth growth and future stability.",
  };
}