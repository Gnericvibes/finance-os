"use client";

import { useState } from "react";

import { createEntry } from "../actions/create-entry";

export function EntryForm() {
  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState<{
      type:
        | "INCOME"
        | "EXPENSE"
        | "INVESTMENT"
        | "DEBT_PAYMENT";

      title: string;
      amount: number;
      category: string;
    }>({
      type: "EXPENSE",
      title: "",
      amount: 0,
      category: "",
    });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const result =
        await createEntry({
          ...formData,
          amount: Number(
            formData.amount
          ),
        });

      setLoading(false);

      if (result.success) {
        alert("Entry Created");

        setFormData({
          type: "EXPENSE",
          title: "",
          amount: 0,
          category: "",
        });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold">
        Add Entry
      </h2>

      <select
        className="w-full bg-black border border-zinc-800 rounded-xl p-3"
        value={formData.type}
        onChange={(e) =>
          setFormData({
            ...formData,
            type:
              e.target.value as
                | "INCOME"
                | "EXPENSE"
                | "INVESTMENT"
                | "DEBT_PAYMENT",
          })
        }
      >
        <option value="INCOME">
          Income
        </option>

        <option value="EXPENSE">
          Expense
        </option>

        <option value="INVESTMENT">
          Investment
        </option>

        <option value="DEBT_PAYMENT">
          Debt Payment
        </option>
      </select>

      <input
        type="text"
        placeholder="Title"
        className="w-full bg-black border border-zinc-800 rounded-xl p-3"
        value={formData.title}
        onChange={(e) =>
          setFormData({
            ...formData,
            title: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Amount"
        className="w-full bg-black border border-zinc-800 rounded-xl p-3"
        value={formData.amount}
        onChange={(e) =>
          setFormData({
            ...formData,
            amount: Number(
              e.target.value
            ),
          })
        }
      />

      <input
        type="text"
        placeholder="Category"
        className="w-full bg-black border border-zinc-800 rounded-xl p-3"
        value={formData.category}
        onChange={(e) =>
          setFormData({
            ...formData,
            category: e.target.value,
          })
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
      >
        {loading
          ? "Creating..."
          : "Create Entry"}
      </button>
    </form>
  );
}