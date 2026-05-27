"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },

  {
    label: "Budgets",
    href: "/budgets",
  },

  {
    label: "Chat",
    href: "/chat",
  },

  {
    label: "Income",
    href: "/analytics/income",
  },

  {
    label: "Expenses",
    href: "/analytics/expenses",
  },

  {
    label: "Investments",
    href: "/analytics/investments",
  },
];

export function AppNavbar() {
  const pathname =
    usePathname();

  return (
    <nav className="w-full border-b border-zinc-800 bg-black/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6 overflow-x-auto">
        {routes.map((route) => {
          const active =
            pathname ===
            route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm whitespace-nowrap transition ${
                active
                  ? "text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {route.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}