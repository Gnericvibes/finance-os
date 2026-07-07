import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";

import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

// Base URL must be the deployed origin in production, or sign-in redirects and
// cookies break. Falls back to localhost for local dev.
const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const isProduction = process.env.NODE_ENV === "production";

// Extra allowed origins can be supplied as a comma-separated list.
const extraTrustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([baseURL, "http://localhost:3000", ...extraTrustedOrigins])
);

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [nextCookies()],

  baseURL,

  trustedOrigins,

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      sameSite: "lax",
      // Secure cookies over HTTPS in production; relaxed for local http dev.
      secure: isProduction,
      httpOnly: true,
    },
  },
});
