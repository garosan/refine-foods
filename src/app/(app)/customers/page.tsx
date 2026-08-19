import Link from "next/link";
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
import { RowActions } from "@/components/row-actions";
import { InitialsAvatar } from "@/components/initials-avatar";
import { formatDate } from "@/lib/format";
import { getCustomersPage, CUSTOMER_STATUSES } from "./queries";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const { rows, total, totalPages } = await getCustomersPage({
    page,
    dir,
    status: sp.status,
    q: sp.q,
  });

  function buildHref(overrides: Record<string, string | number | null>) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.status) params.set("status", sp.status);
    params.set("dir", dir);
    if (page > 1) params.set("page", String(page));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) params.delete(key);
      else params.set(key, String(value));
    }
    return `/customers?${params.toString()}`;
  }

  const exportHref = `/api/customers/export?${new URLSearchParams({
    ...(sp.q ? { q: sp.q } : {}),
    ...(sp.status ? { status: sp.status } : {}),
  }).toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <Button asChild variant="outline">
          <a href={exportHref}>
            <Download />
            Export
          </a>
        </Button>
      </div>

      <TableToolbar
        searchPlaceholder="Search by name"
        statusOptions={[...CUSTOMER_STATUSES]}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gsm No</TableHead>
              <TableHead>
                <SortableHeader
                  label="Created At"
                  field="createdAt"
                  currentSort="createdAt"
                  currentDir={dir}
                  buildHref={(_s, d) => buildHref({ dir: d, page: null })}
                />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="text-muted-foreground">
                  #{customer.id.replace("cust_", "")}
                </TableCell>
                <TableCell>
                  <InitialsAvatar name={customer.name} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={customer.status} />
                </TableCell>
                <TableCell className="text-right">
                  <RowActions href={`/customers/${customer.id}`} />
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
