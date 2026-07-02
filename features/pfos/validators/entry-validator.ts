import { z } from "zod";
import { EntryType } from "@prisma/client";

export const createEntrySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),

  amount: z
    .number()
    .positive("Amount must be positive"),

  category: z
    .string()
    .min(2, "Category is required"),

  userId: z.string(),

  type: z.nativeEnum(EntryType),
});

export type CreateEntryInput =
  z.infer<typeof createEntrySchema>;