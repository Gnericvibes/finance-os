"use server";

import { db } from "@/lib/db";

import {
  generatePFOS,
} from "@/lib/pfos-engine";

export async function saveOnboarding(
  userId: string,
  data: any
) {
  /*
   CREATE USER PROFILE
  */

  const profile =
    await db.userProfile.create({
      data: {
        userId,

        fullName:
          data.fullName,

        employmentType:
          data.employmentType,

        maritalStatus:
          data.maritalStatus,

        hasDependents:
          data.hasDependents ===
          "true",

        dependentsCount:
          data.dependentsCount,

        currency:
          data.currency,
      },
    });

  /*
   GENERATE PFOS
  */

  const pfos =
    generatePFOS({
      income:
        data.mainMonthlyIncome,

      hasDebt:
        data.hasDebt ===
        "true",

      totalDebt:
        data.totalDebt,
    });

  /*
   STORE BLUEPRINT
  */

  await db.pfosBlueprint.create({
    data: {
      userProfileId:
        profile.id,

      mode: pfos.mode,

      operationsPercent:
        pfos.percentages
          .operations,

      debtPercent:
        pfos.percentages
          .debt,

      investingPercent:
        pfos.percentages
          .investing,

      emergencyPercent:
        pfos.percentages
          .emergency,

      operationsAmount:
        pfos.allocations
          .operations,

      debtAmount:
        pfos.allocations
          .debt,

      investingAmount:
        pfos.allocations
          .investing,

      emergencyAmount:
        pfos.allocations
          .emergency,

      financialHealthScore:
        pfos.financialHealthScore,

      interpretation:
        pfos.interpretation,
    },
  });

  /*
   CREATE FIRST SNAPSHOT
  */

  await db.monthlySnapshot.create({
    data: {
      userProfileId:
        profile.id,

      month:
        new Date().toLocaleString(
          "default",
          {
            month: "long",
            year: "numeric",
          }
        ),

      baseIncome:
        data.mainMonthlyIncome,

      additionalIncome:
        data.additionalIncome,

      totalExpenses:
        Number(
          data.rentHousing || 0
        ) +
        Number(data.food || 0) +
        Number(
          data.transport || 0
        ) +
        Number(
          data.utilities || 0
        ),

      totalDebt:
        data.totalDebt,

      financialHealthScore:
        pfos.financialHealthScore,
    },
  });

  return {
    success: true,
  };
}