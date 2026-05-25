import { z } from "zod";

export const entrySchema = z.object({
  type: z.enum([
    "INCOME",
    "EXPENSE",
    "INVESTMENT",
    "DEBT_PAYMENT",
  ]),

  title: z.string().min(1),

  amount: z.number().positive(),

  category: z.string().min(1),
});

export type EntryInput =
  z.infer<typeof entrySchema>;