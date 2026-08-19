import { sql, gte, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, customers, products, orderItems, stores } from "@/db/schema";
import type { DateRange } from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

function rangeBounds(range: DateRange) {
  const days = range === "week" ? 7 : 30;
  const end = new Date();
  const start = new Date(end.getTime() - days * DAY_MS);
  const prevStart = new Date(start.getTime() - days * DAY_MS);
  return { start, end, prevStart, days };
}

export async function getRevenueSeries(range: DateRange) {
  const { start, end } = rangeBounds(range);
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${orders.createdAt})::date`,
      revenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, start))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  return fillSeries(rows, start, end, (r) => ({ date: r.day, revenue: Number(r.revenue) }), "revenue");
}

export async function getOrdersSeries(range: DateRange) {
  const { start, end } = rangeBounds(range);
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${orders.createdAt})::date`,
      count: sql<string>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, start))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  return fillSeries(rows, start, end, (r) => ({ date: r.day, orders: Number(r.count) }), "orders");
}

export async function getNewCustomersSeries(range: DateRange) {
  const { start, end, prevStart } = rangeBounds(range);

  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${customers.createdAt})::date`,
      count: sql<string>`count(*)`,
    })
    .from(customers)
    .where(gte(customers.createdAt, start))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const [{ count: currentTotal }] = await db
    .select({ count: sql<string>`count(*)` })
    .from(customers)
    .where(gte(customers.createdAt, start));

  const [{ count: prevTotal }] = await db
    .select({ count: sql<string>`count(*)` })
    .from(customers)
    .where(sql`${customers.createdAt} >= ${prevStart} and ${customers.createdAt} < ${start}`);

  const current = Number(currentTotal);
  const prev = Number(prevTotal);
  const pctChange = prev === 0 ? (current > 0 ? 100 : 0) : ((current - prev) / prev) * 100;

  return {
    series: fillSeries(rows, start, end, (r) => ({ date: r.day, customers: Number(r.count) }), "customers"),
    pctChange,
  };
}

function fillSeries<T extends { day: string }, K extends string>(
  rows: T[],
  start: Date,
  end: Date,
  map: (r: T) => { date: string } & Record<K, number>,
  key: K,
) {
  const byDay = new Map(rows.map((r) => [r.day, map(r)[key]]));
  const days: ({ date: string } & Record<K, number>)[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    days.push({ date: iso, [key]: byDay.get(iso) ?? 0 } as { date: string } & Record<K, number>);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const RECENT_ORDERS_PAGE_SIZE = 5;

export async function getRecentOrdersPage(page = 1) {
  const [rows, [{ total }]] = await Promise.all([
    db.query.orders.findMany({
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: RECENT_ORDERS_PAGE_SIZE,
      offset: (page - 1) * RECENT_ORDERS_PAGE_SIZE,
      with: {
        customer: true,
        store: true,
        items: { with: { product: true } },
      },
    }),
    db.select({ total: sql<string>`count(*)` }).from(orders),
  ]);

  return {
    rows,
    total: Number(total),
    totalPages: Math.max(1, Math.ceil(Number(total) / RECENT_ORDERS_PAGE_SIZE)),
  };
}

export async function getTimelineOrders(limit = 8) {
  return db
    .select({
      id: orders.id,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getTrendingProducts(range: DateRange, limit = 5) {
  const { start } = rangeBounds(range);

  return db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      orderCount: sql<string>`count(distinct ${orderItems.orderId})`,
      revenue: sql<string>`coalesce(sum(${orderItems.priceAtOrder}::numeric * ${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(gte(orders.createdAt, start))
    .groupBy(products.id, products.name, products.imageUrl)
    .orderBy(desc(sql`count(distinct ${orderItems.orderId})`))
    .limit(limit);
}

export async function getStoreMapPoints() {
  return db.select().from(stores);
}
