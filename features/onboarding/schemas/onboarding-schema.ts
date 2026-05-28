import { z } from "zod";

export const onboardingSchema =
  z.object({
    /* =========================
       PERSONAL PROFILE
    ========================= */

    fullName:
      z.string().min(
        2,
        "Full name is required"
      ),

    employmentType:
      z.string().min(
        1,
        "Employment status is required"
      ),

    maritalStatus:
      z.string().min(
        1,
        "Marital status is required"
      ),

    hasDependents:
      z.string(),

    dependentsCount:
      z.number().optional(),

    /* =========================
       INCOME
    ========================= */

    currency:
      z.string().optional(),

    mainMonthlyIncome:
      z.number().describe("Monthly income is required"),

    additionalIncome:
      z.number().optional(),

    incomeFrequency:
      z.string(),

    /* =========================
       EXPENSES
    ========================= */

    rentHousing:
      z.number().optional(),

    food:
      z.number().optional(),

    transport:
      z.number().optional(),

    utilities:
      z.number().optional(),

    schoolFees:
      z.number().optional(),

    subscriptions:
      z.number().optional(),

    healthCare:
      z.number().optional(),

    miscellaneousExpenses:
      z.number().optional(),

    /* =========================
       DEBT
    ========================= */

    hasDebt:
      z.string(),

    totalDebt:
      z.number().optional(),

    debtDueDate:
      z.string().optional(),

    repaymentSchedule:
      z.string().optional(),

    repaymentAmount:
      z.number().optional(),

    /* =========================
       GOALS
    ========================= */

    financialGoal:
      z.string().min(
        1,
        "Financial goal is required"
      ),

    emergencySavingsGoal:
      z.number().optional(),

    interestedInInvesting:
      z.boolean().optional(),
  });

export type OnboardingFormValues =
  z.infer<
    typeof onboardingSchema
  >;