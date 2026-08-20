"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { nextSequentialId } from "@/db/next-id";

export type CategoryInput = {
  title: string;
  icon: string;
};

function validate(input: CategoryInput) {
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.icon.trim()) throw new Error("Icon is required");
}

export async function createCategory(input: CategoryInput) {
  validate(input);

  const id = await nextSequentialId(categories, categories.id, "cat");

  await db.insert(categories).values({
    id,
    title: input.title.trim(),
    icon: input.icon.trim(),
    status: "Visible",
  });

  revalidatePath("/categories");
}

export async function updateCategory(id: string, input: CategoryInput) {
  validate(input);

  await db
    .update(categories)
    .set({ title: input.title.trim(), icon: input.icon.trim() })
    .where(eq(categories.id, id));

  revalidatePath("/categories");
}

export async function toggleCategoryVisibility(id: string, visible: boolean) {
  await db
    .update(categories)
    .set({ status: visible ? "Visible" : "Hidden" })
    .where(eq(categories.id, id));

  revalidatePath("/categories");
}
