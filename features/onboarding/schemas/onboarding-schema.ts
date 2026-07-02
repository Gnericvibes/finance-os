import { z } from "zod";

export const CurrencySchema =
  z.enum([
    "NGN",
    "USD",
    "GBP",
    "EUR",
    "CAD",
    "AUD",
    "AED",
    "ZAR",
    "KES",
    "GHS",
  ]);

export const onboardingSchema =
  z
    .object({
      /*
       -----------------------------------
       PERSONAL PROFILE
       -----------------------------------
      */

      fullName: z
        .string()
        .min(
          2,
          "Full name is required"
        ),

      employmentType: z.enum([
        "EMPLOYED",
        "SELF_EMPLOYED",
        "BUSINESS_OWNER",
        "FREELANCER",
        "STUDENT",
        "UNEMPLOYED",
        "RETIRED",
      ]),

      maritalStatus: z.enum([
        "SINGLE",
        "MARRIED",
        "DIVORCED",
        "WIDOWED",
      ]),

      hasDependents: z.enum([
        "true",
        "false",
      ]),

      dependentsCount:
        z.number().optional(),

      /*
       -----------------------------------
       INCOME
       -----------------------------------
      */

      currency:
        CurrencySchema.default(
          "NGN"
        ),

      mainMonthlyIncome: z
        .number()
        .positive(
          "Monthly income must be greater than zero"
        ),

      additionalIncome:
        z.number().optional(),

      incomeFrequency:
        z.enum([
          "MONTHLY",
          "WEEKLY",
          "BI_WEEKLY",
          "QUARTERLY",
          "ANNUALLY",
        ]),

      /*
       -----------------------------------
       EXPENSES
       -----------------------------------
      */

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

      /*
       -----------------------------------
       DEBT
       -----------------------------------
      */

      hasDebt: z.enum([
        "true",
        "false",
      ]),

      totalDebt:
        z.number().optional(),

      debtDueDate:
        z.string().optional(),

      repaymentSchedule:
        z.string().optional(),

      repaymentAmount:
        z.number().optional(),

      /*
       -----------------------------------
       GOALS
       -----------------------------------
      */

      financialGoal: z.enum([
        "EMERGENCY_FUND",
        "DEBT_FREEDOM",
        "HOME_OWNERSHIP",
        "BUSINESS_GROWTH",
        "RETIREMENT",
        "INVESTMENT",
        "WEALTH_BUILDING",
      ]),

      emergencySavingsGoal:
        z.number().optional(),

      interestedInInvesting:
        z.boolean().optional(),
    })
    .superRefine(
      (data, ctx) => {
        /*
         -----------------------------------
         DEPENDENTS VALIDATION
         -----------------------------------
        */

        if (
          data.hasDependents ===
            "true" &&
          (!data.dependentsCount ||
            data.dependentsCount <
              1)
        ) {
          ctx.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "dependentsCount",
            ],

            message:
              "Please specify number of dependents",
          });
        }

        /*
         -----------------------------------
         DEBT VALIDATION
         -----------------------------------
        */

        if (
          data.hasDebt ===
          "true"
        ) {
          if (
            !data.totalDebt ||
            data.totalDebt <=
              0
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode
                  .custom,

              path: [
                "totalDebt",
              ],

              message:
                "Debt amount is required",
            });
          }

          if (
            !data
              .repaymentAmount ||
            data
              .repaymentAmount <=
              0
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode
                  .custom,

              path: [
                "repaymentAmount",
              ],

              message:
                "Repayment amount is required",
            });
          }
        }
      }
    );

export type OnboardingFormValues =
  z.infer<
    typeof onboardingSchema
  >;