interface MetricsHeaderProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function MetricsHeader({
  title,
  value,
  subtitle,
}: MetricsHeaderProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-8">
      <div className="space-y-3">
        <p className="text-zinc-400 text-sm uppercase tracking-wider">
          {title}
        </p>

        <h1 className="text-5xl font-bold text-white">
          {value}
        </h1>

        {subtitle && (
          <p className="text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}