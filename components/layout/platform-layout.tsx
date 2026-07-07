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

      <main className="lg:ml-[220px] px-4 lg:px-6 py-4 lg:py-6 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}