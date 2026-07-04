import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { TransactionsClient } from "@/features/transactions/components/transactions-client";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const entries = await db.entry.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 100,
  });

  const normalizedEntries = entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    amount: Number(entry.amount),
    category: entry.category?.name ?? "Uncategorized",
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="space-y-2">
          <h1 className="text-5xl font-bold">Transactions</h1>

          <p className="text-zinc-400 text-lg">
            All your financial activity
          </p>
        </div>

        {/* CLIENT COMPONENT */}

        <TransactionsClient entries={normalizedEntries} />
      </div>
    </main>
  );
}
