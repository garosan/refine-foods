import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/components/order-status-select";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "../queries";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: (orders, { eq }) => eq(orders.id, id),
    with: {
      store: true,
      customer: true,
      courier: true,
      items: { with: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Order #{order.id.replace("order_", "")}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusSelect
              orderId={order.id}
              status={order.status}
              statuses={ORDER_STATUSES}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{order.customer?.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{order.store?.title}</p>
            <p className="text-sm text-muted-foreground">{order.store?.address}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={36}
                          height={36}
                          className="size-9 rounded-md object-cover"
                        />
                      )}
                      <span>{item.product?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.priceAtOrder)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(item.priceAtOrder) * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-semibold">{formatCurrency(order.amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Created {formatDate(order.createdAt)}
        {order.courier && ` · Courier: ${order.courier.name}`}
      </p>
    </div>
  );
}
