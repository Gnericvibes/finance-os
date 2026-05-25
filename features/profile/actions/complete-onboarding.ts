"use server";

import { cookies } from "next/headers";

import { db } from "@/lib/db";

import { auth } from "@/lib/auth";

import { PFOSEngine } from "@/features/pfos/services/pfos-engine";

import {
  onboardingSchema,
  OnboardingInput,
} from "../validators/profile-validator";

export async function completeOnboarding(
  data: OnboardingInput
) {
  try {
    /*
     -----------------------------------
     VALIDATE INPUT
     -----------------------------------
    */

    const validated =
      onboardingSchema.parse(data);

    /*
     -----------------------------------
     GET SESSION
     -----------------------------------
    */

    const session =
      await auth.api.getSession({
        headers: new Headers({
          cookie: (await cookies()).toString(),
        }),
      });

    console.log("SESSION:", session);

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    /*
     -----------------------------------
     DETECT FINANCIAL STAGE
     -----------------------------------
    */

    const financialStage =
      PFOSEngine.detectFinancialStage(
        validated
      );

    /*
     -----------------------------------
     UPSERT PROFILE
     -----------------------------------
    */

    const profile =
      await db.profile.upsert({
        where: {
          userId,
        },

        update: {
          ...validated,
          financialStage,
        },

        create: {
          ...validated,
          financialStage,
          userId,
        },
      });

    /*
     -----------------------------------
     GENERATE BLUEPRINT
     -----------------------------------
    */

    const blueprint =
      PFOSEngine.generateBlueprint(
        validated
      );

    /*
     -----------------------------------
     UPSERT BLUEPRINT
     -----------------------------------
    */

    await db.PFOSBlueprint.upsert({
      where: {
        userId,
      },

      update: {
        ...blueprint,
      },

      create: {
        ...blueprint,
        userId,
      },
    });

    /*
     -----------------------------------
     SUCCESS
     -----------------------------------
    */

    return {
      success: true,
      profile,
      blueprint,
    };
  } catch (error) {
    console.error(
      "ONBOARDING ERROR:",
      error
    );

    return {
      success: false,
      error:
        "Failed to complete onboarding",
    };
  }
}