interface TrendBadgeProps {
  value: number;

  trend:
    | "up"
    | "down"
    | "neutral";
}

export function TrendBadge({
  value,
  trend,
}: TrendBadgeProps) {
  /*
   -----------------------------------
   COLORS
   -----------------------------------
  */

  const styles = {
    up: "bg-green-500/15 text-green-400 border-green-500/20",

    down: "bg-red-500/15 text-red-400 border-red-500/20",

    neutral:
      "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  };

  const arrows = {
    up: "↑",

    down: "↓",

    neutral: "•",
  };

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2
        px-3
        py-1.5
        rounded-full
        border
        text-sm
        font-medium
        ${styles[trend]}
      `}
    >
      <span>
        {arrows[trend]}
      </span>

      <span>
        {Math.abs(value)}%
      </span>
    </div>
  );
}