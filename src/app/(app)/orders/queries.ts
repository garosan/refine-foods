import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { orders, stores, customers, orderItems, products } from "@/db/schema";

export const ORDER_STATUSES = [
  "Pending",
  "Ready",
  "On the way",
  "Delivered",
  "Cancelled",
] as const;

export const PAGE_SIZE = 10;

export type OrdersQuery = {
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
  status?: string;
  q?: string;
};

function buildWhere({ status, q }: OrdersQuery) {
  const conditions = [];
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(orders.status, status as (typeof ORDER_STATUSES)[number]));
  }
  if (q) {
    conditions.push(
      or(ilike(stores.title, `%${q}%`), ilike(customers.name, `%${q}%`)),
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function getOrdersPage(query: OrdersQuery) {
  const page = Math.max(1, query.page ?? 1);
  const sort = query.sort === "amount" ? orders.amount : orders.createdAt;
  const dir = query.dir === "asc" ? asc : desc;
  const where = buildWhere(query);

  const baseFrom = db
    .select({
      id: orders.id,
      status: orders.status,
      amount: orders.amount,
      createdAt: orders.createdAt,
      storeTitle: stores.title,
      customerName: customers.name,
    })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .leftJoin(customers, eq(orders.customerId, customers.id));

  const rows = await baseFrom
    .where(where)
    .orderBy(dir(sort))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(where);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          imageUrl: products.imageUrl,
          name: products.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, ids))
    : [];

  const thumbsByOrder = new Map<string, { imageUrl: string; name: string }[]>();
  for (const item of items) {
    if (!item.imageUrl) continue;
    const list = thumbsByOrder.get(item.orderId) ?? [];
    if (list.length < 4) list.push({ imageUrl: item.imageUrl, name: item.name ?? "" });
    thumbsByOrder.set(item.orderId, list);
  }

  return {
    rows: rows.map((r) => ({ ...r, thumbnails: thumbsByOrder.get(r.id) ?? [] })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAllOrdersForExport(query: OrdersQuery) {
  const where = buildWhere(query);
  return db
    .select({
      id: orders.id,
      status: orders.status,
      amount: orders.amount,
      createdAt: orders.createdAt,
      storeTitle: stores.title,
      customerName: customers.name,
    })
    .from(orders)
    .leftJoin(stores, eq(orders.storeId, stores.id))
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(where)
    .orderBy(desc(orders.createdAt));
}
