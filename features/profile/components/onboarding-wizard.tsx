"use client";

import { useState } from "react";

import { completeOnboarding } from "../actions/complete-onboarding";

export function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] =
    useState({
      monthlyIncome: 0,
      employmentStatus: "",

      housingCost: 0,
      utilitiesCost: 0,
      transportationCost: 0,
      foodCost: 0,

      debtAmount: 0,
      debtMonthlyPayment: 0,

      emergencyFundGoal: 0,
      savingsGoal: 0,

      dependents: 0,
    });

  const [loading, setLoading] =
    useState(false);

  function updateField(
    field: string,
    value: string | number
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const result =
        await completeOnboarding(
          formData
        );

      setLoading(false);

      if (result.success) {
        alert(
          "PFOS Blueprint Generated"
        );

        console.log(result.blueprint);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);

      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Finance OS Onboarding
        </h1>

        <p className="text-gray-500">
          Step {step} of 3
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Monthly Income"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "monthlyIncome",
                Number(e.target.value)
              )
            }
          />

          <input
            type="text"
            placeholder="Employment Status"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "employmentStatus",
                e.target.value
              )
            }
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Housing Cost"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "housingCost",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Utilities Cost"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "utilitiesCost",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Transportation Cost"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "transportationCost",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Food Cost"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "foodCost",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Debt Amount"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "debtAmount",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Debt Monthly Payment"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "debtMonthlyPayment",
                Number(e.target.value)
              )
            }
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Emergency Fund Goal"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "emergencyFundGoal",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Savings Goal"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "savingsGoal",
                Number(e.target.value)
              )
            }
          />

          <input
            type="number"
            placeholder="Dependents"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              updateField(
                "dependents",
                Number(e.target.value)
              )
            }
          />
        </div>
      )}

      <div className="flex gap-4">
        {step > 1 && (
          <button
            onClick={() =>
              setStep(step - 1)
            }
            className="border px-4 py-2 rounded"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={() =>
              setStep(step + 1)
            }
            className="bg-black text-white px-4 py-2 rounded"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading
              ? "Generating..."
              : "Generate Blueprint"}
          </button>
        )}
      </div>
    </div>
  );
}