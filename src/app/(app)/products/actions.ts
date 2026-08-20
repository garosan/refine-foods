"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { nextSequentialId } from "@/db/next-id";
import { PRODUCT_STATUSES } from "./queries";

export type ProductInput = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  status: string;
};

function validate(input: ProductInput) {
  if (!input.name.trim()) throw new Error("Name is required");
  if (!input.categoryId) throw new Error("Category is required");
  if (Number.isNaN(Number(input.price)) || Number(input.price) < 0) {
    throw new Error("Price must be a non-negative number");
  }
  if (!(PRODUCT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error("Invalid status");
  }
}

export async function createProduct(input: ProductInput) {
  validate(input);

  const id = await nextSequentialId(products, products.id, "prod");

  await db.insert(products).values({
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    categoryId: input.categoryId,
    imageUrl: input.imageUrl.trim() || `https://picsum.photos/seed/${id}/400/300`,
    status: input.status as (typeof PRODUCT_STATUSES)[number],
  });

  revalidatePath("/products");
}

export async function updateProduct(id: string, input: ProductInput) {
  validate(input);

  await db
    .update(products)
    .set({
      name: input.name.trim(),
      description: input.description.trim(),
      price: input.price,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl.trim(),
      status: input.status as (typeof PRODUCT_STATUSES)[number],
    })
    .where(eq(products.id, id));

  revalidatePath("/products");
}
