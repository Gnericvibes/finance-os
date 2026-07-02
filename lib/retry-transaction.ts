function isPrismaUniqueViolation(
  error: unknown
): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

/**
 * Run a Prisma transaction that auto-retries once if it hits a
 * unique-constraint violation (e.g. another request raced to create
 * an active blueprint).
 *
  * This gives a smooth UX instead of surfacing a retry error to the user.
 */

import { db } from "@/lib/db";

export async function retryTransaction<T>(
  transactionFn: (tx: any) => Promise<T>
): Promise<T> {
  try {
    return await (db as any).$transaction(transactionFn);
  } catch (firstError) {
    if (!isPrismaUniqueViolation(firstError)) {
      throw firstError;
    }

    // Retry once
    return await (db as any).$transaction(transactionFn);
  }
}
