"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { couriers } from "@/db/schema";
import { nextSequentialId } from "@/db/next-id";
import { COURIER_STATUSES } from "./constants";

export type CourierInput = {
  name: string;
  vehicleId: string;
  phone: string;
  storeId: string;
  status: string;
};

function validate(input: CourierInput) {
  if (!input.name.trim()) throw new Error("Name is required");
  if (!input.vehicleId.trim()) throw new Error("Vehicle ID is required");
  if (!input.storeId) throw new Error("Store is required");
  if (!(COURIER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error("Invalid status");
  }
}

export async function createCourier(input: CourierInput) {
  validate(input);

  const id = await nextSequentialId(couriers, couriers.id, "cour");

  await db.insert(couriers).values({
    id,
    name: input.name.trim(),
    vehicleId: input.vehicleId.trim(),
    phone: input.phone.trim(),
    storeId: input.storeId,
    rating: 0,
    status: input.status as (typeof COURIER_STATUSES)[number],
  });

  revalidatePath("/couriers");
}

export async function updateCourier(id: string, input: CourierInput) {
  validate(input);

  await db
    .update(couriers)
    .set({
      name: input.name.trim(),
      vehicleId: input.vehicleId.trim(),
      phone: input.phone.trim(),
      storeId: input.storeId,
      status: input.status as (typeof COURIER_STATUSES)[number],
    })
    .where(eq(couriers.id, id));

  revalidatePath("/couriers");
}
