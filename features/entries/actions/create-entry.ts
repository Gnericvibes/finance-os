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

        const categoryName = validated.category.trim();

    const category =
      (await db.category.findFirst({
        where: {
          userId: session.user.id,
          name: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
      })) ??
      (await db.category.create({
        data: {
          userId: session.user.id,
          name: categoryName,
        },
      }));

        const entry = await db.entry.create({
      data: {
        type: validated.type,
        title: validated.title,
        amount: validated.amount,
        userId: session.user.id,
        categoryId: category.id,
      },
    });


                // Sync budget allocation actuals
    try {
      const { DashboardEngine } = await import(
        "@/features/dashboard/services/dashboard-engine"
      );

            const allEntries = await db.entry.findMany({
        where: { userId: session.user.id },
        include: { category: { select: { name: true } } },
      });

      const engineEntries = allEntries.map((e) => ({
        type: e.type as string,
        amount: Number(e.amount),
        category: e.category?.name ?? "Uncategorized",
      }));

      await DashboardEngine.refreshAllocationActuals(
        session.user.id,
        engineEntries
      );
    } catch (e) {
      console.error("Failed to sync allocation actuals:", e);
    }

    revalidatePath("/dashboard");

    /*
   -----------------------------------
   SUCCESS
   -----------------------------------
  */

    return {
      success: true,
      entry: {
        ...entry,
        amount: Number(entry.amount),
      },
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