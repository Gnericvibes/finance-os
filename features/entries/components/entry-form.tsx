"use client";

import { useState } from "react";

import { createEntry } from "../actions/create-entry";

const EXPENSE_CATEGORIES = [
  "Rent / Housing",
  "Food & Groceries",
  "Transport",
  "Utilities",
  "School Fees",
  "Subscriptions",
  "Healthcare",
  "Miscellaneous",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment Returns",
  "Other Income",
];

export function EntryForm() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    type: "INCOME" | "EXPENSE" | "INVESTMENT" | "DEBT_PAYMENT";
    title: string;
    amount: string;
    category: string;
  }>({
    type: "EXPENSE",
    title: "",
    amount: "",
    category: "",
  });

  const categories =
    formData.type === "EXPENSE" || formData.type === "DEBT_PAYMENT"
      ? EXPENSE_CATEGORIES
      : formData.type === "INCOME"
        ? INCOME_CATEGORIES
        : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const amountNum = Number(formData.amount);

      if (!amountNum || amountNum <= 0) {
        alert("Please enter a valid amount greater than 0.");
        setLoading(false);
        return;
      }

      const result = await createEntry({
        type: formData.type,
        title: formData.title,
        amount: amountNum,
        category: formData.category || formData.type,
      });

      setLoading(false);

      if (result.success) {
        alert("Entry Created");
        setFormData({ type: "EXPENSE", title: "", amount: "", category: "" });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

    return (
    <form onSubmit={handleSubmit} className="border border-zinc-800 bg-zinc-950 rounded-3xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white">Add Entry</h2>

      <p className="text-sm text-zinc-400">
        Entries are best created through the AI Chat, but you can add them here too.
      </p>

      <select
        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white"
        value={formData.type}
        onChange={(e) =>
          setFormData({
            ...formData,
            type: e.target.value as "INCOME" | "EXPENSE" | "INVESTMENT" | "DEBT_PAYMENT",
            category: "",
          })
        }
      >
        <option value="EXPENSE">Expense</option>
        <option value="INCOME">Income</option>
        <option value="INVESTMENT">Investment</option>
        <option value="DEBT_PAYMENT">Debt Payment</option>
      </select>

      <input
        type="text"
        placeholder="Title"
        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Amount"
        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        required
      />

      {categories.length > 0 && (
        <select
          className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors w-full"
      >
        {loading ? "Creating..." : "Create Entry"}
      </button>
    </form>
  );
}