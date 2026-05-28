"use client";

interface Props {
  children: React.ReactNode;
}

export function PlatformLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}