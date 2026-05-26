import { redirect } from "next/navigation";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { Sidebar } from "@/components/layout/sidebar";

import { Topbar } from "@/components/layout/topbar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   -----------------------------------
   SESSION
   -----------------------------------
  */

  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  /*
   -----------------------------------
   PROTECT ROUTE
   -----------------------------------
  */

  if (!session?.user) {
    redirect("/sign-in");
  }

  /*
   -----------------------------------
   LAYOUT
   -----------------------------------
  */

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* SIDEBAR */}

      <Sidebar />

      {/* CONTENT */}

      <div className="flex-1 flex flex-col">
        <Topbar
          name={
            session.user.name || "User"
          }
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}