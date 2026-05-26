interface TopbarProps {
  name: string;
}

export function Topbar({
  name,
}: TopbarProps) {
  return (
    <header className="h-[80px] border-b border-zinc-800 bg-black/60 backdrop-blur-xl flex items-center justify-between px-8">
      <div>
        <p className="text-sm text-zinc-500">
          Welcome back
        </p>

        <h2 className="text-xl font-bold text-white">
          {name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="border border-zinc-800 bg-zinc-950 rounded-2xl px-4 py-2">
          <p className="text-sm text-zinc-400">
            Finance OS Active
          </p>
        </div>
      </div>
    </header>
  );
}