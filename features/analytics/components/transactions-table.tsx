interface Transaction {
  id: string;

  title: string;

  amount: number;

  category: string;

  type: string;

  createdAt: Date;
}

interface TransactionsTableProps {
  entries: Transaction[];
}

export function TransactionsTable({
  entries,
}: TransactionsTableProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Transactions
        </h2>

        <p className="text-sm text-zinc-400">
          {entries.length} records
        </p>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between border border-zinc-800 rounded-2xl p-4"
          >
            <div>
              <p className="font-semibold text-white">
                {entry.title}
              </p>

              <p className="text-sm text-zinc-400">
                {entry.category}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-white">
                ₦
                {entry.amount.toLocaleString()}
              </p>

              <p className="text-xs text-zinc-500">
                {new Date(
                  entry.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}