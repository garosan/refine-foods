// No `db` import here on purpose — this file is safe to import from
// client components. stores/queries.ts pulls in the Neon client at
// module scope, which must never end up in a browser bundle.
export const STORE_STATUSES = ["Open", "Closed"] as const;
