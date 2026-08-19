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
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryRowActions } from "@/components/categories/category-row-actions";
import { VisibilityToggle } from "@/components/categories/visibility-toggle";
import { getCategoriesWithProducts } from "./queries";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus />
              Add category
            </Button>
          }
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="text-xl">{category.icon}</TableCell>
                <TableCell className="font-medium">{category.title}</TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {category.products.slice(0, 10).map((product) => (
                      <Image
                        key={product.id}
                        src={product.imageUrl}
                        alt={product.name}
                        width={28}
                        height={28}
                        className="size-7 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                    {category.products.length === 0 && (
                      <span className="text-sm text-muted-foreground">No products</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <VisibilityToggle
                    categoryId={category.id}
                    visible={category.status === "Visible"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <CategoryRowActions category={category} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
