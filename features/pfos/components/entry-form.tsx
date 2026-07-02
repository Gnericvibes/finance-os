"use client";

import { useState } from "react";

import { createEntryAction } from "../actions/create-entry";

export function EntryForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [type, setType] = useState<
    | "EXPENSE"
    | "INCOME"
    | "INVESTMENT"
    | "DEBT_PAYMENT"
    | "TRANSFER"
  >("EXPENSE");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const result =
      await createEntryAction({
        title,
        description,
        amount: Number(amount),
        category,
        type,

        // temporary hardcoded user
        userId: "demo-user",
      });

    setLoading(false);

    if (result.success) {
      alert("Entry created successfully");

      setTitle("");
      setDescription("");
      setAmount("");
      setCategory("");
      setType("EXPENSE");
    } else {
      alert(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md"
    >
      <select
        value={type}
        onChange={(e) =>
          setType(
            e.target.value as
              | "EXPENSE"
              | "INCOME"
              | "INVESTMENT"
              | "DEBT_PAYMENT"
              | "TRANSFER"
          )
        }
        className="w-full border p-2 rounded"
      >
        <option value="EXPENSE">
          Expense
        </option>

        <option value="INCOME">
          Income
        </option>

        <option value="INVESTMENT">
          Investment
        </option>

        <option value="DEBT_PAYMENT">
          Debt Payment
        </option>

        <option value="TRANSFER">
          Transfer
        </option>
      </select>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading
          ? "Creating..."
          : "Create Entry"}
      </button>
    </form>
  );
}