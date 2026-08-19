# RefineFoods

Food-delivery admin dashboard — portfolio piece demonstrating a production-quality
internal tool built with AI-assisted development. See `RefineFoods_PRD.md` for the
full spec and `CLAUDE.md` for repo conventions.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_MAPS_API_KEY
npm run db:push        # sync Drizzle schema to Neon
npm run db:seed        # seed stores/categories/products/customers/couriers/orders
npm run db:seed-admin  # create the single admin login (admin@refinefoods.dev)
npm run dev
```

Work is tracked as [GitHub issues](https://github.com/garosan/refine-foods/issues),
one per PRD module/phase.
