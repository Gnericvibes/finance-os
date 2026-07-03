"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import {
  connectFarcaster,
  disconnectFarcaster,
} from "@/features/farcaster/actions/connect-farcaster";
import { logCreatorIncome } from "@/features/farcaster/actions/log-creator-income";

export interface FarcasterConnection {
  fid: number;
  username: string;
  displayName: string | null;
  pfpUrl: string | null;
  followers: number | null;
}

interface ConnectFarcasterCardProps {
  connection: FarcasterConnection | null;
  currencySymbol: string;
}

export function ConnectFarcasterCard({
  connection,
  currencySymbol,
}: ConnectFarcasterCardProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeNote, setIncomeNote] = useState<string | null>(null);

  function handleConnect() {
    setError(null);
    startTransition(async () => {
      const result = await connectFarcaster(username);
      if (!result.success) {
        setError(result.error ?? "Could not connect.");
      }
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      await disconnectFarcaster();
    });
  }

  function handleLogIncome() {
    setIncomeNote(null);
    startTransition(async () => {
      const result = await logCreatorIncome(
        Number(incomeAmount),
        incomeSource
      );
      if (result.success) {
        setIncomeAmount("");
        setIncomeSource("");
        setIncomeNote("Creator income logged.");
      } else {
        setIncomeNote(result.error ?? "Could not log income.");
      }
    });
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Farcaster Creator</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Connect your Farcaster to get creator-aware financial advice.
          </p>
        </div>
      </div>

      {connection ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {connection.pfpUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={connection.pfpUrl}
                alt={connection.username}
                className="size-12 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="size-12 rounded-full bg-zinc-800" />
            )}

            <div className="min-w-0">
              <p className="text-white font-medium truncate">
                {connection.displayName ?? connection.username}
              </p>
              <p className="text-sm text-zinc-500 truncate">
                @{connection.username} - FID {connection.fid}
                {typeof connection.followers === "number"
                  ? ` - ${connection.followers.toLocaleString()} followers`
                  : ""}
              </p>
            </div>
          </div>

          {/* Quick-log creator income */}
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <p className="text-sm font-medium text-white mb-3">
              Log creator income
            </p>
            <p className="text-xs text-zinc-500 mb-3">
              Tips, mints, rewards, sponsorships. Tagged as Farcaster Creator
              income.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                inputMode="decimal"
                placeholder={`Amount (${currencySymbol})`}
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                className="h-10 flex-1 rounded-none border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-600"
              />
              <input
                type="text"
                placeholder="Source (e.g. mint, tip)"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                className="h-10 flex-1 rounded-none border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-600"
              />
              <Button
                variant="secondary"
                onClick={handleLogIncome}
                disabled={pending || !incomeAmount}
              >
                Log
              </Button>
            </div>
            {incomeNote && (
              <p className="mt-2 text-xs text-zinc-400">{incomeNote}</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={pending}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Your Farcaster username (e.g. gnericvibes)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10 flex-1 rounded-none border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-600"
            />
            <Button
              onClick={handleConnect}
              disabled={pending || !username.trim()}
            >
              {pending ? "Connecting..." : "Connect"}
            </Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </section>
  );
}
