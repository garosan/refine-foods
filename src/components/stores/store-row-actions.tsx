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
import { StoreFormDialog } from "./store-form-dialog";

type Store = {
  id: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  status: string;
};

export function StoreRowActions({ store }: { store: Store }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Store actions">
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
            Edit store
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <StoreFormDialog store={store} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
