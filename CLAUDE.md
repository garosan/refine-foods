# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo state

No code has been scaffolded yet — this repo currently holds only the PRD and reference screenshots. `@RefineFoods_PRD.md` is the spec. Before writing app code, check GitHub issues for the current unit of work (the PRD has been broken into one issue per module) rather than re-deriving scope from the PRD each session.

## What this project is

RefineFoods is a from-scratch rebuild of a food-delivery admin dashboard (original branding, not a clone) — a portfolio/showcase artifact, not a real product. No real payments, no real customer PII, single seeded Admin role only for v1. Resist scope creep: no RBAC, no multi-tenant, no features beyond the reference screens (PRD §11).

## Tech stack (PRD §3)

Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui + tweakcn theme tokens, Drizzle ORM, Neon (serverless Postgres), BetterAuth, Google Maps JavaScript API, Recharts, deployed to Vercel.

- **Middleware file is named `proxy.ts`**, not the standard `middleware.ts` — this is intentional per the PRD, don't "correct" it.
- Secrets live in `.env`, never hardcoded.

## Styling rules

- Tailwind utility classes + shadcn/ui primitives first; tweakcn CSS variable tokens for all theming — no hardcoded colors, dark mode must use tokens only.
- Fonts loaded via `next/font/google`.

## Data & performance

- Server-side pagination required on Orders (~1,200 rows) and Customers (~600 rows) tables — no client-side over-fetching.
- Seed script volumes to preserve (PRD §7): 600 customers, 1,200 orders, 79 products, 70 couriers, 20 stores, 10 categories.
