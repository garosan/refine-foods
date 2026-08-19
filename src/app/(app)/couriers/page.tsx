import { Plus } from "lucide-react";
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
import { StarRating } from "@/components/star-rating";
import { InitialsAvatar } from "@/components/initials-avatar";
import { CourierFormDialog } from "@/components/couriers/courier-form-dialog";
import { CourierRowActions } from "@/components/couriers/courier-row-actions";
import { getCouriersPage, getAllStoresList, COURIER_STATUSES } from "./queries";

export default async function CouriersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const [{ rows, total, totalPages }, stores] = await Promise.all([
    getCouriersPage({ page, dir, status: sp.status, q: sp.q }),
    getAllStoresList(),
  ]);

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
    return `/couriers?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Couriers</h1>
        <CourierFormDialog
          stores={stores}
          trigger={
            <Button>
              <Plus />
              Add new courier
            </Button>
          }
        />
      </div>

      <TableToolbar
        searchPlaceholder="Search by name"
        statusOptions={[...COURIER_STATUSES]}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Gsm</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>
                <SortableHeader
                  label="Rating"
                  field="rating"
                  currentSort="rating"
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
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No couriers found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((courier) => (
              <TableRow key={courier.id}>
                <TableCell className="text-muted-foreground">
                  #{courier.id.replace("cour_", "")}
                </TableCell>
                <TableCell>
                  <InitialsAvatar name={courier.name} />
                </TableCell>
                <TableCell className="font-medium">{courier.name}</TableCell>
                <TableCell>{courier.vehicleId}</TableCell>
                <TableCell>{courier.phone}</TableCell>
                <TableCell>{courier.storeTitle}</TableCell>
                <TableCell>
                  <StarRating rating={courier.rating} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={courier.status} />
                </TableCell>
                <TableCell className="text-right">
                  <CourierRowActions courier={courier} stores={stores} />
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
