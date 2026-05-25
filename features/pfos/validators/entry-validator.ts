import { z } from "zod";

export const createEntrySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .optional(),

  amount: z
    .number()
    .positive("Amount must be positive"),

  category: z
    .string()
    .min(2, "Category is required"),

  userId: z.string(),
});

export type CreateEntryInput =
  z.infer<typeof createEntrySchema>;