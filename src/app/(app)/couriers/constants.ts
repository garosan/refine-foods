// No `db` import here on purpose — this file is safe to import from
// client components. couriers/queries.ts pulls in the Neon client at
// module scope, which must never end up in a browser bundle.
export const COURIER_STATUSES = ["Available", "Offline", "On delivery"] as const;
