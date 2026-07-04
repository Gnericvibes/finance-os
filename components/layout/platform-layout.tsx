"use client";

import { Sidebar } from "@/components/layout/sidebar";

interface Props {
  children: React.ReactNode;
}

export function PlatformLayout({
  children,
}: Props) {
    return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />

      <main className="ml-[220px] h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}