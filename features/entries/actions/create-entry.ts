"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import {
  entrySchema,
  EntryInput,
} from "../validators/entry-validator";

export async function createEntry(
  data: EntryInput
) {
  try {
    /*
     -----------------------------------
     VALIDATE
     -----------------------------------
    */

    const validated =
      entrySchema.parse(data);

    /*
     -----------------------------------
     GET SESSION
     -----------------------------------
    */

    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    /*
     -----------------------------------
     CREATE ENTRY
     -----------------------------------
    */

    const entry =
      await db.entry.create({
        data: {
          ...validated,
          userId: session.user.id,
        },
      });
revalidatePath("/dashboard");
    /*
     -----------------------------------
     SUCCESS
     -----------------------------------
    */

    return {
      success: true,
      entry,
    };
  } catch (error) {
    console.error(
      "CREATE ENTRY ERROR:",
      error
    );

    return {
      success: false,
      error:
        "Failed to create entry",
    };
  }
}