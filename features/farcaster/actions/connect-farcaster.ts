"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { NeynarService } from "@/features/farcaster/services/neynar-service";

export interface ConnectFarcasterResult {
  success: boolean;
  error?: string;
  creator?: {
    fid: number;
    username: string;
    displayName: string | null;
    pfpUrl: string | null;
    followers: number;
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Could not connect Farcaster. Try again.";
}

export async function connectFarcaster(
  username: string
): Promise<ConnectFarcasterResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const creator = await NeynarService.getByUsername(username);

    await db.financialProfile.updateMany({
      where: { userId: session.user.id },
      data: {
        farcasterFid: creator.fid,
        farcasterUsername: creator.username,
        farcasterDisplayName: creator.displayName,
        farcasterPfpUrl: creator.pfpUrl,
        farcasterFollowers: creator.followers,
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      creator: {
        fid: creator.fid,
        username: creator.username,
        displayName: creator.displayName,
        pfpUrl: creator.pfpUrl,
        followers: creator.followers,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function disconnectFarcaster(): Promise<ConnectFarcasterResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  await db.financialProfile.updateMany({
    where: { userId: session.user.id },
    data: {
      farcasterFid: null,
      farcasterUsername: null,
      farcasterDisplayName: null,
      farcasterPfpUrl: null,
      farcasterFollowers: null,
    },
  });

  revalidatePath("/profile");

  return { success: true };
}
