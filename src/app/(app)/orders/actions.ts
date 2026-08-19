"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ORDER_STATUSES } from "./queries";

export async function updateOrderStatus(orderId: string, status: string) {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Invalid status");
  }

  await db
    .update(orders)
    .set({ status: status as (typeof ORDER_STATUSES)[number] })
    .where(eq(orders.id, orderId));

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}
