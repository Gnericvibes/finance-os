import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session =
    await auth.api.getSession({
      headers: await import("next/headers").then(
        (mod) => mod.headers()
      ),
    });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const profile =
    await db.financialProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/allocations");
}