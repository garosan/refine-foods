"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductFormDialog } from "./product-form-dialog";

type Category = { id: string; title: string };
type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  status: string;
};

export function ProductRowActions({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Product actions">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
          >
            Edit product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProductFormDialog
        categories={categories}
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
