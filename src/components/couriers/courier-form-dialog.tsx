"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCourier, updateCourier, type CourierInput } from "@/app/(app)/couriers/actions";
import { COURIER_STATUSES } from "@/app/(app)/couriers/constants";

type Store = { id: string; title: string };
type Courier = {
  id: string;
  name: string;
  vehicleId: string;
  phone: string;
  storeId: string;
  status: string;
};

export function CourierFormDialog({
  stores,
  courier,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  stores: Store[];
  courier?: Courier;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isEdit = !!courier;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = trigger ? uncontrolledOpen : (controlledOpen ?? false);
  const setOpen = trigger ? setUncontrolledOpen : (setControlledOpen ?? (() => {}));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const input: CourierInput = {
      name: String(formData.get("name") ?? ""),
      vehicleId: String(formData.get("vehicleId") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      storeId: String(formData.get("storeId") ?? ""),
      status: String(formData.get("status") ?? "Offline"),
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCourier(courier.id, input);
        } else {
          await createCourier(input);
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit courier" : "Add new courier"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={courier?.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle ID</Label>
              <Input id="vehicleId" name="vehicleId" required defaultValue={courier?.vehicleId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Gsm</Label>
              <Input id="phone" name="phone" defaultValue={courier?.phone} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeId">Store</Label>
            <Select name="storeId" defaultValue={courier?.storeId}>
              <SelectTrigger id="storeId" className="w-full">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={courier?.status ?? "Offline"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COURIER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Add courier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
