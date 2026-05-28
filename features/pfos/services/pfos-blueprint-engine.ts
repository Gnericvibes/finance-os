interface PFOSBlueprintInput {
  monthlyIncome: number;

  hasDebt: boolean;
}

interface PFOSBlueprintOutput {
  investmentAllocation: number;

  debtAllocation: number;

  treasuryAllocation: number;

  operationalAllocation: number;

  emergencyAllocation: number;

  isDebtFree: boolean;
}

export class PFOSBlueprintEngine {
  /*
   -----------------------------------
   GENERATE BLUEPRINT
   -----------------------------------
  */

  static generate(
    input: PFOSBlueprintInput
  ): PFOSBlueprintOutput {
    const {
      monthlyIncome,
      hasDebt,
    } = input;

    /*
     -----------------------------------
     USER HAS DEBT
     -----------------------------------
    */

    if (hasDebt) {
      return {
        investmentAllocation:
          monthlyIncome * 0.1,

        debtAllocation:
          monthlyIncome * 0.2,

        treasuryAllocation: 0,

        operationalAllocation:
          monthlyIncome * 0.7,

        emergencyAllocation:
          monthlyIncome * 0.03,

        isDebtFree: false,
      };
    }

    /*
     -----------------------------------
     DEBT FREE
     -----------------------------------
    */

    return {
      investmentAllocation:
        monthlyIncome * 0.2,

      debtAllocation: 0,

      treasuryAllocation:
        monthlyIncome * 0.1,

      operationalAllocation:
        monthlyIncome * 0.7,

      emergencyAllocation:
        monthlyIncome * 0.05,

      isDebtFree: true,
    };
  }
}