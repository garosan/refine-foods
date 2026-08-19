import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";

export const PRODUCT_STATUSES = ["Available", "Unavailable"] as const;

export const PAGE_SIZE = 10;

export type ProductsQuery = {
  page?: number;
  dir?: "asc" | "desc";
  status?: string;
  category?: string;
  q?: string;
};

function buildWhere({ status, category, q }: ProductsQuery) {
  const conditions = [];
  if (status && (PRODUCT_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(products.status, status as (typeof PRODUCT_STATUSES)[number]));
  }
  if (category) {
    conditions.push(eq(products.categoryId, category));
  }
  if (q) {
    conditions.push(ilike(products.name, `%${q}%`));
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function getProductsPage(query: ProductsQuery) {
  const page = Math.max(1, query.page ?? 1);
  const dir = query.dir === "asc" ? asc : desc;
  const where = buildWhere(query);

  const baseFrom = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      imageUrl: products.imageUrl,
      status: products.status,
      categoryId: products.categoryId,
      categoryTitle: categories.title,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

  const rows = await baseFrom
    .where(where)
    .orderBy(dir(products.price))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAllCategoriesList() {
  return db.select().from(categories).orderBy(asc(categories.title));
}
