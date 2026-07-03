"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const FARCASTER_INCOME_CATEGORY = "Farcaster Creator";

interface LogCreatorIncomeResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Could not log creator income. Try again.";
}

// Records creator earnings (tips, mints, rewards, sponsorships) as an INCOME
// entry pre-tagged to the "Farcaster Creator" category, so creator income is
// tracked distinctly from a salary.
export async function logCreatorIncome(
  amount: number,
  source: string
): Promise<LogCreatorIncomeResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Enter an amount greater than zero." };
  }

  try {
    const userId = session.user.id;

    // Find-or-create the shared creator-income category for this user.
    const existing = await db.category.findFirst({
      where: { userId, name: FARCASTER_INCOME_CATEGORY },
    });

    const category =
      existing ??
      (await db.category.create({
        data: { userId, name: FARCASTER_INCOME_CATEGORY },
      }));

    await db.entry.create({
      data: {
        userId,
        type: "INCOME",
        title: source.trim() || "Farcaster creator income",
        amount,
        categoryId: category.id,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
