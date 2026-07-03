// Thin wrapper over the Neynar API for resolving a Farcaster creator's public
// identity. We only read public profile fields - no writes, no signer.

export interface FarcasterCreator {
  fid: number;
  username: string;
  displayName: string | null;
  pfpUrl: string | null;
  followers: number;
  following: number;
}

const NEYNAR_BASE = "https://api.neynar.com/v2/farcaster";

interface NeynarUser {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
}

function apiKey(): string {
  const key = process.env.NEYNAR_API_KEY;
  if (!key) {
    throw new Error(
      "NEYNAR_API_KEY is not configured. Add it to your environment to connect Farcaster."
    );
  }
  return key;
}

function toCreator(user: NeynarUser): FarcasterCreator {
  return {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name ?? null,
    pfpUrl: user.pfp_url ?? null,
    followers: user.follower_count ?? 0,
    following: user.following_count ?? 0,
  };
}

export class NeynarService {
  // Resolve a public Farcaster profile by username (handle without the @).
  static async getByUsername(username: string): Promise<FarcasterCreator> {
    const handle = username.trim().replace(/^@/, "").toLowerCase();

    if (!handle) {
      throw new Error("Enter a Farcaster username.");
    }

    const res = await fetch(
      `${NEYNAR_BASE}/user/by_username?username=${encodeURIComponent(handle)}`,
      {
        headers: {
          "x-api-key": apiKey(),
          accept: "application/json",
        },
        // Public profile data is fine to cache briefly.
        next: { revalidate: 300 },
      }
    );

    if (res.status === 404) {
      throw new Error(`No Farcaster user found for "@${handle}".`);
    }

    if (!res.ok) {
      throw new Error(`Neynar request failed (${res.status}).`);
    }

    const data = (await res.json()) as { user?: NeynarUser };

    if (!data.user) {
      throw new Error(`No Farcaster user found for "@${handle}".`);
    }

    return toCreator(data.user);
  }
}
