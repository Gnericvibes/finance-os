import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";

import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [nextCookies()],

  baseURL:
    "http://localhost:3000",

  trustedOrigins: [
    "http://localhost:3000",
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      httpOnly: true,
    },
  },
});