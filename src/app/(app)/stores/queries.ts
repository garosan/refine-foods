import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";

export const STORE_STATUSES = ["Open", "Closed"] as const;

export type StoresQuery = {
  status?: string;
  q?: string;
};

export async function getStores(query: StoresQuery) {
  const conditions = [];
  if (query.status && (STORE_STATUSES as readonly string[]).includes(query.status)) {
    conditions.push(eq(stores.status, query.status as (typeof STORE_STATUSES)[number]));
  }
  if (query.q) {
    conditions.push(
      or(ilike(stores.title, `%${query.q}%`), ilike(stores.email, `%${query.q}%`)),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  return db.select().from(stores).where(where).orderBy(asc(stores.title));
}
