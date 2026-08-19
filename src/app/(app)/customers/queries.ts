import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";

export const CUSTOMER_STATUSES = ["Active", "Idle"] as const;

export const PAGE_SIZE = 10;

export type CustomersQuery = {
  page?: number;
  dir?: "asc" | "desc";
  status?: string;
  q?: string;
};

function buildWhere({ status, q }: CustomersQuery) {
  const conditions = [];
  if (status && (CUSTOMER_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(customers.status, status as (typeof CUSTOMER_STATUSES)[number]));
  }
  if (q) {
    conditions.push(ilike(customers.name, `%${q}%`));
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function getCustomersPage(query: CustomersQuery) {
  const page = Math.max(1, query.page ?? 1);
  const dir = query.dir === "asc" ? asc : desc;
  const where = buildWhere(query);

  const rows = await db
    .select()
    .from(customers)
    .where(where)
    .orderBy(dir(customers.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(customers)
    .where(where);

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAllCustomersForExport(query: CustomersQuery) {
  const where = buildWhere(query);
  return db.select().from(customers).where(where).orderBy(desc(customers.createdAt));
}
