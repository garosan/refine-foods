# Work Log

Sequential record of what was built, in what order, and why. Each entry
maps to a commit (and usually a closed GitHub issue). See `git log` for
full diffs and issue comments on
[garosan/refine-foods](https://github.com/garosan/refine-foods/issues?q=is%3Aissue)
for verification notes on each ticket.

## 2026-08-19

**Repo setup** — Read `RefineFoods_PRD.md` and the reference screenshots,
broke the PRD into 11 GitHub issues (one per module/phase), initialized
the git repo and pushed to `garosan/refine-foods`.

**#1 Foundation** (`33fb3ae`) — Next.js 16 (App Router, TypeScript,
Tailwind, shadcn/ui) scaffold. Connected to the Neon Postgres project,
pushed the Drizzle schema, wired up BetterAuth (email/password), wrote
the seed script at PRD volumes (600 customers, 1,200 orders, 79 products,
70 couriers, 20 stores, 10 categories) plus a single seeded admin. Built
the sidebar/top-bar shell. Confirmed Next.js 16 actually renamed
`middleware.ts` to `proxy.ts` — the PRD's naming wasn't a typo.

**#2 Auth/Login** (`5aa17cb`) — Branded login screen with an original
dark gradient background, orange brand color tokens, a UI-only
forgot-password stub, confirmed "remember me" was already correct via
BetterAuth's session flag.

**#4 Orders** (`c3a9102`) — Table with search/filter/sort, server-side
pagination, CSV export, and a detail page with a working status-change
dropdown. Built the first reusable pieces (`StatusBadge`, `TableToolbar`,
`SortableHeader`, `DataPagination`) that every later module reused.

**#5 Customers** (`ae948ce`) — Table plus a detail page showing full
order history per customer.

**#6 Products** (`eee69ea`) — Table/grid view toggle, category+status
filters, an add/edit dialog wired to server actions.

**#7 Categories** (`6a13fdd`) — List view with product thumbnail strips
and an inline visibility toggle.

**#8 Stores** (`9d9f027`) — Table plus a list/map view toggle. Google
Maps isn't wired up (no API key), so built `MockMap` — a small
lat/lng-to-pin wrapper — as the seam a real Google Maps integration
drops into later without touching call sites.

**Bug fix** (`75c7b70`) — `ProductFormDialog` and `StoreFormDialog`
(client components) imported a status constant from files that also
imported the Neon DB client, which bundled a live database connection
attempt into the browser and crashed on `DATABASE_URL` (correctly
absent from the client). Caught by the user testing `/products`. Fixed
by splitting status constants into db-free `constants.ts` files per
module and auditing every other client component for the same pattern.

**#9 Couriers** (`d6b0360`) — Table with a star-rating display, last of
the six core CRUD modules.

**#3 Dashboard** (`973eea9`) — Date-range selector driving Recharts
revenue/orders/customers charts, the mocked delivery map, a relative-time
timeline, paginated recent orders, and trending products ranked by order
count.

**#10 Polish** (`d0c1451`) — Loading skeletons for every page, an error
boundary and branded 404 for the app shell. Audited (rather than
re-built) empty states, responsive tables, dark-mode tokens, and CSV
export — all already solid from their own tickets.

**Deploy** — Linked the repo to Vercel (`garosan-projects` team), set
production env vars, deployed. Live at
`https://refine-foods-delta.vercel.app`. Rotated the seeded admin
password before going public.

**#11 Ship** (deploy only, no code commit) — Closed out the PRD's
phased plan. GitHub auto-deploy-on-push wasn't wired up (needs a
one-time Vercel GitHub App authorization in the browser); manual
`vercel --prod` deploys in the meantime.

**Bug fix** (`fb4c941`) — User reported the live site looked unstyled
(serif fonts, "like the CSS disconnected"). Traced to `shadcn init`
having written a self-referential `--font-sans: var(--font-sans)` in
`globals.css` back in Foundation, instead of pointing at the real
`next/font` variable (`--font-geist-sans`). A circular custom property
resolves to invalid, so every element using Tailwind's `font-sans`
utility silently fell back to the browser default font — while colors,
layout, and spacing rendered fine, since those tokens weren't affected.
Confirmed the fix against current shadcn/Tailwind v4 docs before
applying it.

**UI tweak** (`76173e0`) — Added breathing room between sidebar nav
items (`gap-1.5`).

**Bug fix** (`3c20c5c`) — User noticed a store created through the UI
had an ugly ID (`store_1787183999135_821`) next to seeded stores'
`store_1`, `store_2`, etc. Create actions across Products/Stores/
Categories/Couriers were generating `<prefix>_<timestamp>_<random>` IDs
instead of continuing the seed script's sequential numbering. Added
`nextSequentialId()` and deleted the one stray test record it produced.

**Theme experiments** — Tried tweakcn's "Ocean Breeze" preset locally
per request (not committed, reviewed and replaced). Landed on "Bubblegum"
(`8a37ad5`) with the pink pushed to higher chroma and dark mode's
primary overridden to stay pink instead of the stock preset's
cream/yellow drift — deployed live.
