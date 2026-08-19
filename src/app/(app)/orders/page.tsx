import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TableToolbar } from "@/components/table-toolbar";
import { SortableHeader } from "@/components/sortable-header";
import { DataPagination } from "@/components/data-pagination";
import { OrderRowActions } from "@/components/order-row-actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { getOrdersPage, ORDER_STATUSES } from "./queries";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const sort = sp.sort === "amount" ? "amount" : "createdAt";
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const { rows, total, totalPages } = await getOrdersPage({
    page,
    sort,
    dir,
    status: sp.status,
    q: sp.q,
  });

  function buildHref(overrides: Record<string, string | number | null>) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.status) params.set("status", sp.status);
    params.set("sort", sort);
    params.set("dir", dir);
    if (page > 1) params.set("page", String(page));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) params.delete(key);
      else params.set(key, String(value));
    }
    return `/orders?${params.toString()}`;
  }

  const exportHref = `/api/orders/export?${new URLSearchParams({
    ...(sp.q ? { q: sp.q } : {}),
    ...(sp.status ? { status: sp.status } : {}),
  }).toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <Button asChild variant="outline">
          <a href={exportHref}>
            <Download />
            Export
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TableToolbar
          searchPlaceholder="Search by store or customer"
          statusOptions={[...ORDER_STATUSES]}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>
                <SortableHeader
                  label="Amount"
                  field="amount"
                  currentSort={sort}
                  currentDir={dir}
                  buildHref={(s, d) => buildHref({ sort: s, dir: d, page: null })}
                />
              </TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>
                <SortableHeader
                  label="Created At"
                  field="createdAt"
                  currentSort={sort}
                  currentDir={dir}
                  buildHref={(s, d) => buildHref({ sort: s, dir: d, page: null })}
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    #{order.id.replace("order_", "")}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {order.thumbnails.map((t, i) => (
                      <Image
                        key={i}
                        src={t.imageUrl}
                        alt={t.name}
                        width={28}
                        height={28}
                        className="size-7 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(order.amount)}</TableCell>
                <TableCell>{order.storeTitle}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <OrderRowActions orderId={order.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          buildHref={(p) => buildHref({ page: p === 1 ? null : p })}
        />
      </div>
    </div>
  );
}
