import { NextRequest, NextResponse } from "next/server";
import { getAllCustomersForExport } from "@/app/(app)/customers/queries";
import { toCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const rows = await getAllCustomersForExport({ status, q });

  const csv = toCsv(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      status: r.status,
      createdAt: formatDate(r.createdAt),
    })),
    ["id", "name", "phone", "status", "createdAt"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="customers.csv"`,
    },
  });
}
