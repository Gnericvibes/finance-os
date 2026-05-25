"use server";

import { PFOSEngine } from "../services/pfos-engine";

import {
  createEntrySchema,
  CreateEntryInput,
} from "../validators/entry-validator";

export async function createEntryAction(
  data: CreateEntryInput
) {
  try {
    // Validate incoming data
    const validatedData =
      createEntrySchema.parse(data);

    // Create database entry
    const entry =
      await PFOSEngine.createEntry(
        validatedData
      );

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Invalid entry data",
    };
  }
}