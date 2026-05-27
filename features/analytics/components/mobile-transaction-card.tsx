interface MobileTransactionCardProps {
  title: string;

  category: string;

  amount: number;

  date: string;
}

export function MobileTransactionCard({
  title,
  category,
  amount,
  date,
}: MobileTransactionCardProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">
            {title}
          </p>

          <p className="text-sm text-zinc-400 capitalize">
            {category}
          </p>
        </div>

        <p className="font-bold text-white">
          ₦
          {amount.toLocaleString()}
        </p>
      </div>

      <p className="text-xs text-zinc-500">
        {date}
      </p>
    </div>
  );
}