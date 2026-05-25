"use server";

import { db } from "@/lib/db";

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
     TEMP DEMO USER
     -----------------------------------
    */

    const userId = "demo-user";

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
     CREATE PROFILE
     -----------------------------------
    */

    const profile =
      await db.profile.create({
        data: {
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
     SAVE BLUEPRINT
     -----------------------------------
    */

    await db.pFOSBlueprint.create({
      data: {
        ...blueprint,
        userId,
      },
    });

    /*
     -----------------------------------
     SUCCESS RESPONSE
     -----------------------------------
    */

    return {
      success: true,
      profile,
      blueprint,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error:
        "Failed to complete onboarding",
    };
  }
}