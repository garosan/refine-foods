"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { mockGeocode } from "@/lib/maps";
import { STORE_STATUSES } from "./queries";

export type StoreInput = {
  title: string;
  email: string;
  phone: string;
  address: string;
  status: string;
};

function nextId() {
  return `store_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function validate(input: StoreInput) {
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.address.trim()) throw new Error("Address is required");
  if (!(STORE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error("Invalid status");
  }
}

export async function createStore(input: StoreInput) {
  validate(input);

  const { lat, lng } = mockGeocode(input.address);

  await db.insert(stores).values({
    id: nextId(),
    title: input.title.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    lat,
    lng,
    status: input.status as (typeof STORE_STATUSES)[number],
  });

  revalidatePath("/stores");
}

export async function updateStore(id: string, input: StoreInput) {
  validate(input);

  await db
    .update(stores)
    .set({
      title: input.title.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      status: input.status as (typeof STORE_STATUSES)[number],
    })
    .where(eq(stores.id, id));

  revalidatePath("/stores");
}
