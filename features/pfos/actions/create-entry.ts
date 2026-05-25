"use server";

import { PFOSEngine } from "../services/pfos-engine";

type CreateEntryInput = {
  title: string;
  description?: string;
  amount: number;
  category: string;
  userId: string;
};

export async function createEntryAction(
  data: CreateEntryInput
) {
  try {
    const entry =
      await PFOSEngine.createEntry(data);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to create entry",
    };
  }
}