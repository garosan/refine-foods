# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

This project runs **Next.js 16**, which is newer than most training data and has breaking API changes (e.g. `middleware.ts` was renamed to `proxy.ts` — see the note below). Check `node_modules/next/dist/docs/` before assuming App Router conventions from memory.

## Repo state

Foundation scaffold (Next.js + Tailwind) is in place. Check GitHub issues (github.com/garosan/refine-foods) for the current unit of work — the PRD has been broken into one issue per module. `@RefineFoods_PRD.md` is the full spec.

## What this project is

RefineFoods is a from-scratch rebuild of a food-delivery admin dashboard (original branding, not a clone) — a portfolio/showcase artifact, not a real product. No real payments, no real customer PII, single seeded Admin role only for v1. Resist scope creep: no RBAC, no multi-tenant, no features beyond the reference screens (PRD §11).

## Tech stack (PRD §3)

Next.js 16 (App Router) + TypeScript, Tailwind CSS + shadcn/ui + tweakcn theme tokens, Drizzle ORM, Neon (serverless Postgres), BetterAuth, Google Maps JavaScript API (mocked/stubbed for now — no API key yet, see below), Recharts, deployed to Vercel.

- **Middleware file is named `proxy.ts`**, not `middleware.ts` — this is the actual Next.js 16 convention (Middleware was renamed to Proxy), not a PRD quirk. Confirmed in `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
- Secrets live in `.env`, never hardcoded. `.env` is gitignored.
- **Google Maps is mocked for now** — no API key provisioned yet. Build the Delivery Map / Stores map view against a small wrapper/interface so a real Google Maps JS API integration can be dropped in later without reshaping calling code.

## Styling rules

- Tailwind utility classes + shadcn/ui primitives first; tweakcn CSS variable tokens for all theming — no hardcoded colors, dark mode must use tokens only.
- Fonts loaded via `next/font/google`.

## Data & performance

- Server-side pagination required on Orders (~1,200 rows) and Customers (~600 rows) tables — no client-side over-fetching.
- Seed script volumes to preserve (PRD §7): 600 customers, 1,200 orders, 79 products, 70 couriers, 20 stores, 10 categories.

## Database

Neon Postgres project `refine-foods` (id `soft-star-40944587`, org `org-hidden-snow-65038412`). Connection string lives in `.env` as `DATABASE_URL` — pull it with `npx neon env pull` if it goes missing (reads project info from `.neon`).
