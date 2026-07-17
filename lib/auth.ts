import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";

import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmailHtml, verifyEmailHtml } from "@/lib/email-templates";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,

    emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your PFOS password",
          html: resetPasswordEmailHtml({
            username: user.name,
            resetUrl: url,
          }),
        });
        console.log(`[EMAIL] Password reset link sent to ${user.email}: ${url}`);
      } catch (error) {
        // Log the URL as fallback so users can still reset in development
        console.log(`[EMAIL-FALLBACK] Password reset URL for ${user.email}: ${url}`);
      }
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your PFOS email",
          html: verifyEmailHtml({
            username: user.name,
            verifyUrl: url,
          }),
        });
        console.log(`[EMAIL] Verification email sent to ${user.email}: ${url}`);
      } catch (error) {
        console.log(`[EMAIL-FALLBACK] Verification URL for ${user.email}: ${url}`);
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  plugins: [nextCookies()],

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://finance-os-five-psi.vercel.app",
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      sameSite: "lax",

      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});