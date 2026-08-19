import Image from "next/image";
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
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TableToolbar, type TableFilter } from "@/components/table-toolbar";
import { SortableHeader } from "@/components/sortable-header";
import { DataPagination } from "@/components/data-pagination";
import { ViewToggle } from "@/components/products/view-toggle";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductRowActions } from "@/components/products/product-row-actions";
import { formatCurrency } from "@/lib/format";
import { getProductsPage, getAllCategoriesList, PRODUCT_STATUSES } from "./queries";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const dir = sp.dir === "asc" ? "asc" : "desc";
  const view = sp.view === "grid" ? "grid" : "list";

  const [{ rows, total, totalPages }, categories] = await Promise.all([
    getProductsPage({ page, dir, status: sp.status, category: sp.category, q: sp.q }),
    getAllCategoriesList(),
  ]);

  function buildHref(overrides: Record<string, string | number | null>) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.status) params.set("status", sp.status);
    if (sp.category) params.set("category", sp.category);
    if (view !== "list") params.set("view", view);
    params.set("dir", dir);
    if (page > 1) params.set("page", String(page));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) params.delete(key);
      else params.set(key, String(value));
    }
    return `/products?${params.toString()}`;
  }

  const filters: TableFilter[] = [
    {
      param: "category",
      placeholder: "Category",
      allLabel: "All categories",
      options: categories.map((c) => ({ value: c.id, label: c.title })),
    },
    {
      param: "status",
      placeholder: "Status",
      allLabel: "All statuses",
      options: PRODUCT_STATUSES.map((s) => ({ value: s, label: s })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <ProductFormDialog
          categories={categories}
          trigger={
            <Button>
              <Plus />
              Add new product
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TableToolbar searchPlaceholder="Search by name" filters={filters} />
        <ViewToggle view={view} buildHref={(v) => buildHref({ view: v === "list" ? null : v })} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((product) => (
            <Card key={product.id} className="overflow-hidden py-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={300}
                height={200}
                className="aspect-video w-full object-cover"
              />
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{product.name}</p>
                  <ProductRowActions product={product} categories={categories} />
                </div>
                <p className="text-sm text-muted-foreground">{product.categoryTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{formatCurrency(product.price)}</span>
                  <StatusBadge status={product.status} />
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">
              No products found.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <SortableHeader
                    label="Price"
                    field="price"
                    currentSort="price"
                    currentDir={dir}
                    buildHref={(_s, d) => buildHref({ dir: d, page: null })}
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-muted-foreground">
                    #{product.id.replace("prod_", "")}
                  </TableCell>
                  <TableCell>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {product.description}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.categoryTitle}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductRowActions product={product} categories={categories} />
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
      )}
    </div>
  );
}
