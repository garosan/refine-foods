import { sql } from "drizzle-orm";
import type { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";

/**
 * Continues the `<prefix>_<n>` numbering the seed script uses (store_1,
 * store_2, ...) so IDs created through the UI look the same as seeded ones,
 * rather than a timestamp. Not safe under concurrent writes — fine for a
 * single-admin mock app, not a pattern to reuse for real multi-writer data.
 */
export async function nextSequentialId(table: PgTable, column: AnyPgColumn, prefix: string) {
  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max((split_part(${column}, '_', 2))::int), 0) + 1`,
    })
    .from(table);

  return `${prefix}_${next}`;
}
