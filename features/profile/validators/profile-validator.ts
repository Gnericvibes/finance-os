import { z } from "zod";

export const onboardingSchema =
  z.object({
    monthlyIncome: z.number(),

    employmentStatus: z.string(),

    housingCost: z.number(),
    utilitiesCost: z.number(),
    transportationCost: z.number(),
    foodCost: z.number(),

    debtAmount: z.number(),
    debtMonthlyPayment: z.number(),

    emergencyFundGoal: z.number(),
    savingsGoal: z.number(),

    dependents: z.number(),
  });

export type OnboardingInput =
  z.infer<typeof onboardingSchema>;
  