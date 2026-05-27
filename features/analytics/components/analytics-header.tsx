import Link from "next/link";

interface AnalyticsHeaderProps {
  title: string;
  description: string;
}

export function AnalyticsHeader({
  title,
  description,
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}

      <div className="flex justify-start">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* HEADER */}

      <div>
        <h1 className="text-5xl font-bold capitalize">
          {title}
        </h1>

        <p className="text-zinc-400 mt-2">
          {description}
        </p>
      </div>
    </div>
  );
}