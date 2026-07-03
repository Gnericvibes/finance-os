# Finance OS

An AI personal-finance operating system. You tell it what you earn, spend, and owe; a deterministic engine scores your financial health, places you on a stage (SURVIVAL -> RECOVERY -> STABLE -> GROWTH -> WEALTH_BUILDING), and generates a four-bucket blueprint (operational / debt / investment / emergency). An AI advisor then narrates and coaches against that state.

Built for the Nigerian market first (Naira default), multi-currency ready.

## How it works

- **Deterministic engine, not vibes.** `features/pfos/services/pfos-engine.ts` computes every number - health score, debt-to-income, liquidity, pressure, stage. The LLM never does the math; it only explains numbers the engine already produced. If the AI call fails, the app still answers from the engine (graceful fallback).
- **Feature-sliced.** Each domain lives under `features/<domain>/{actions,components,services,validators,schemas,store}`.
- **Versioned blueprints + snapshots.** Every profile change generates a new versioned `FinancialBlueprint`; `Snapshot` records point-in-time net worth; `EntryHistory` keeps an audit trail.

## Stack

- Next.js 16 (App Router) + React
- Prisma + PostgreSQL
- better-auth (email/password)
- DeepSeek (chat advisor, OpenAI-compatible API - swappable to OpenAI)
- Tailwind v4 + shadcn/ui + Recharts + framer-motion
- Zod, react-hook-form, zustand

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# then fill in DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY

# 3. Set up the database
npx prisma migrate deploy   # or: npx prisma migrate dev

# 4. Run
npm run dev
```

Open http://localhost:3000.

## Deploying

This app deploys cleanly to Vercel. Set these in the project's environment:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (>= 32 random chars - `openssl rand -base64 32`)
- `BETTER_AUTH_URL` = your deployed origin, e.g. `https://finance-os.vercel.app` (required, or sign-in breaks)
- `DEEPSEEK_API_KEY` (or `OPENAI_API_KEY` to use OpenAI instead)

Cookies are set `secure` automatically when `NODE_ENV=production`.

## Project layout

| Path | What |
|------|------|
| `features/pfos/` | The deterministic financial engine (scores, stages, blueprint) |
| `features/ai/` | AI advisor - context builder + orchestrator + fallback |
| `features/onboarding/` | Multi-step profile intake |
| `features/analytics/` | Transactions, comparisons, CSV export |
| `features/budgets/` `features/dashboard/` `features/intelligence/` | Budgeting, dashboard, predictive views |
| `lib/` | Auth, db, currency, shared utils |
| `prisma/` | Schema + migrations |

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## License

MIT.
