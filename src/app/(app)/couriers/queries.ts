import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { couriers, stores } from "@/db/schema";
import { COURIER_STATUSES } from "./constants";

export { COURIER_STATUSES };

export const PAGE_SIZE = 10;

export type CouriersQuery = {
  page?: number;
  dir?: "asc" | "desc";
  status?: string;
  q?: string;
};

function buildWhere({ status, q }: CouriersQuery) {
  const conditions = [];
  if (status && (COURIER_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(couriers.status, status as (typeof COURIER_STATUSES)[number]));
  }
  if (q) {
    conditions.push(ilike(couriers.name, `%${q}%`));
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function getCouriersPage(query: CouriersQuery) {
  const page = Math.max(1, query.page ?? 1);
  const dir = query.dir === "asc" ? asc : desc;
  const where = buildWhere(query);

  const baseFrom = db
    .select({
      id: couriers.id,
      name: couriers.name,
      vehicleId: couriers.vehicleId,
      phone: couriers.phone,
      rating: couriers.rating,
      status: couriers.status,
      storeId: couriers.storeId,
      storeTitle: stores.title,
    })
    .from(couriers)
    .leftJoin(stores, eq(couriers.storeId, stores.id));

  const rows = await baseFrom
    .where(where)
    .orderBy(dir(couriers.rating))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(couriers)
    .leftJoin(stores, eq(couriers.storeId, stores.id))
    .where(where);

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAllStoresList() {
  return db.select().from(stores).orderBy(asc(stores.title));
}
