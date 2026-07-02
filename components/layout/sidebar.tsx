"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },

  {
    name: "Blueprint",
    href: "/allocations",
  },

  {
    name: "AI Chat",
    href: "/chat",
  },

    {
    name: "Transactions",
    href: "/transactions",
  },

  {
    name: "Profile",
    href: "/profile",
  },

  {
    name: "Settings",
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] min-h-screen bg-zinc-950 border-r border-zinc-800 p-6 hidden lg:flex flex-col">
      {/* LOGO */}

      <div className="mb-12">
        <h1 className="text-2xl font-bold text-white">
          Finance OS
        </h1>

        <p className="text-zinc-500 text-sm mt-1">
          Personal Financial Operating System
        </p>
      </div>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-3">
        {navigation.map((item) => {
          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-3 transition-all duration-200 border ${
                active
                  ? "bg-white text-black border-white"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}

      <div className="mt-auto pt-10">
        <div className="border border-zinc-800 bg-black rounded-2xl p-4">
          <p className="text-sm text-zinc-500">
            Finance intelligence powered by AI
          </p>
        </div>
      </div>
    </aside>
  );
}