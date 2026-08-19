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
import { CourierFormDialog } from "./courier-form-dialog";

type Store = { id: string; title: string };
type Courier = {
  id: string;
  name: string;
  vehicleId: string;
  phone: string;
  storeId: string;
  status: string;
};

export function CourierRowActions({ courier, stores }: { courier: Courier; stores: Store[] }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Courier actions">
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
            Edit courier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CourierFormDialog
        stores={stores}
        courier={courier}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
