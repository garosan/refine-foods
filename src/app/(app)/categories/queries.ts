import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export async function getCategoriesWithProducts() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.title));

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
    })
    .from(products);

  const productsByCategory = new Map<string, typeof allProducts>();
  for (const product of allProducts) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  return allCategories.map((category) => ({
    ...category,
    products: productsByCategory.get(category.id) ?? [],
  }));
}

