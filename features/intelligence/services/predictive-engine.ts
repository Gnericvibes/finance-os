interface Entry {
  amount: number;

  createdAt: Date;

  type?: string;
}

export class PredictiveEngine {
  /*
   -----------------------------------
   MONTHLY AVERAGE
   -----------------------------------
  */

  static getMonthlyAverage(
    entries: Entry[]
  ) {
    if (
      entries.length === 0
    )
      return 0;

    const total =
      entries.reduce(
        (acc, entry) =>
          acc + entry.amount,
        0
      );

    return Math.round(
      total / 30
    );
  }

  /*
   -----------------------------------
   PROJECTED MONTHLY SPENDING
   -----------------------------------
  */

  static projectMonthlySpending(
    expenses: Entry[]
  ) {
    return (
      this.getMonthlyAverage(
        expenses
      ) * 30
    );
  }

  /*
   -----------------------------------
   SAVINGS FORECAST
   -----------------------------------
  */

  static forecastSavings(
    income: number,
    expenses: number
  ) {
    return income - expenses;
  }

  /*
   -----------------------------------
   BURN RATE
   -----------------------------------
  */

  static calculateBurnRate(
    expenses: number
  ) {
    return expenses / 30;
  }

  /*
   -----------------------------------
   RUNWAY
   -----------------------------------
  */

  static calculateRunway(
    balance: number,
    burnRate: number
  ) {
    if (burnRate <= 0)
      return "∞";

    return Math.floor(
      balance / burnRate
    );
  }

  /*
   -----------------------------------
   INVESTMENT GROWTH
   -----------------------------------
  */

  static projectInvestmentGrowth({
    principal,
    monthlyContribution,
    annualRate,
    years,
  }: {
    principal: number;

    monthlyContribution: number;

    annualRate: number;

    years: number;
  }) {
    const monthlyRate =
      annualRate / 12 / 100;

    const months =
      years * 12;

    let futureValue =
      principal;

    for (
      let i = 0;
      i < months;
      i++
    ) {
      futureValue =
        futureValue *
          (1 +
            monthlyRate) +
        monthlyContribution;
    }

    return Math.round(
      futureValue
    );
  }

  /*
   -----------------------------------
   FINANCIAL HEALTH SCORE
   -----------------------------------
  */

  static calculateHealthScore({
    income,
    expenses,
    savings,
  }: {
    income: number;

    expenses: number;

    savings: number;
  }) {
    let score = 50;

    /*
     -----------------------------------
     SAVINGS RATE
     -----------------------------------
    */

    const savingsRate =
      income > 0
        ? (savings /
            income) *
          100
        : 0;

    if (savingsRate >= 30)
      score += 25;

    else if (
      savingsRate >= 15
    )
      score += 15;

    /*
     -----------------------------------
     EXPENSE CONTROL
     -----------------------------------
    */

    const expenseRatio =
      income > 0
        ? (expenses /
            income) *
          100
        : 100;

    if (expenseRatio < 50)
      score += 20;

    else if (
      expenseRatio < 80
    )
      score += 10;

    /*
     -----------------------------------
     LIMITS
     -----------------------------------
    */

    if (score > 100)
      score = 100;

    if (score < 0)
      score = 0;

    return score;
  }

  /*
   -----------------------------------
   HEALTH LABEL
   -----------------------------------
  */

  static getHealthLabel(
    score: number
  ) {
    if (score >= 80)
      return "Excellent";

    if (score >= 65)
      return "Healthy";

    if (score >= 50)
      return "Moderate";

    if (score >= 35)
      return "Risky";

    return "Critical";
  }
}