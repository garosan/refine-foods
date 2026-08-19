import { List, Map as MapIcon, Plus } from "lucide-react";
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
import { ViewToggle } from "@/components/view-toggle";
import { StoreRowActions } from "@/components/stores/store-row-actions";
import { StoreFormDialog } from "@/components/stores/store-form-dialog";
import { MockMap } from "@/components/mock-map";
import { getStores, STORE_STATUSES } from "./queries";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const view = sp.view === "map" ? "map" : "list";

  const stores = await getStores({ status: sp.status, q: sp.q });

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.status) params.set("status", sp.status);
    if (view !== "list") params.set("view", view);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    return `/stores?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Stores</h1>
        <StoreFormDialog
          trigger={
            <Button>
              <Plus />
              Add New Store
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TableToolbar
          searchPlaceholder="Search by title or email"
          statusOptions={[...STORE_STATUSES]}
        />
        <ViewToggle
          value={view}
          options={[
            { value: "list", icon: List, label: "List view" },
            { value: "map", icon: MapIcon, label: "Map view" },
          ]}
          buildHref={(v) => buildHref({ view: v === "list" ? null : v })}
        />
      </div>

      {view === "map" ? (
        <MockMap
          points={stores.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.title }))}
          className="aspect-[21/9]"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No stores found.
                  </TableCell>
                </TableRow>
              )}
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="text-muted-foreground">
                    #{store.id.replace("store_", "")}
                  </TableCell>
                  <TableCell className="font-medium">{store.title}</TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell>{store.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{store.address}</TableCell>
                  <TableCell>
                    <StatusBadge status={store.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <StoreRowActions store={store} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
