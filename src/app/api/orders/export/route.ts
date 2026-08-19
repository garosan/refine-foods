import { NextRequest, NextResponse } from "next/server";
import { getAllOrdersForExport } from "@/app/(app)/orders/queries";
import { toCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const rows = await getAllOrdersForExport({ status, q });

  const csv = toCsv(
    rows.map((r) => ({
      id: r.id,
      status: r.status,
      amount: r.amount,
      store: r.storeTitle,
      customer: r.customerName,
      createdAt: formatDate(r.createdAt),
    })),
    ["id", "status", "amount", "store", "customer", "createdAt"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders.csv"`,
    },
  });
}
