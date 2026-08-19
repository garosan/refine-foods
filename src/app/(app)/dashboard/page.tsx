import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { DataPagination } from "@/components/data-pagination";
import { MockMap } from "@/components/mock-map";
import { DateRangeSelect } from "@/components/dashboard/date-range-select";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { BarChartWidget } from "@/components/dashboard/bar-chart-widget";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/format";
import { DATE_RANGES, type DateRange } from "./constants";
import {
  getRevenueSeries,
  getOrdersSeries,
  getNewCustomersSeries,
  getRecentOrdersPage,
  getTimelineOrders,
  getTrendingProducts,
  getStoreMapPoints,
} from "./queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const range: DateRange = (DATE_RANGES as readonly string[]).includes(sp.range ?? "")
    ? (sp.range as DateRange)
    : "week";
  const ordersPage = sp.ordersPage ? Number(sp.ordersPage) : 1;

  const [
    revenueSeries,
    ordersSeries,
    { series: customersSeries, pctChange },
    recentOrders,
    timeline,
    trendingProducts,
    storePoints,
  ] = await Promise.all([
    getRevenueSeries(range),
    getOrdersSeries(range),
    getNewCustomersSeries(range),
    getRecentOrdersPage(ordersPage),
    getTimelineOrders(),
    getTrendingProducts(range),
    getStoreMapPoints(),
  ]);

  const totalRevenue = revenueSeries.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = ordersSeries.reduce((sum, d) => sum + d.orders, 0);

  function ordersHref(page: number) {
    const params = new URLSearchParams();
    params.set("range", range);
    if (page > 1) params.set("ordersPage", String(page));
    return `/dashboard?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <DateRangeSelect value={range} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-primary" />
              Daily Revenue
            </CardTitle>
            <span className="text-sm font-semibold">{formatCurrency(totalRevenue)}</span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ShoppingBag className="size-4 text-primary" />
              Daily Orders
            </CardTitle>
            <span className="text-sm font-semibold">{totalOrders}</span>
          </CardHeader>
          <CardContent>
            <BarChartWidget data={ordersSeries} dataKey="orders" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Users className="size-4 text-primary" />
              New Customers
            </CardTitle>
            <span
              className={`flex items-center gap-0.5 text-sm font-semibold ${
                pctChange >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {pctChange >= 0 ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {Math.abs(pctChange).toFixed(0)}%
            </span>
          </CardHeader>
          <CardContent>
            <BarChartWidget data={customersSeries} dataKey="customers" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Delivery Map</CardTitle>
          </CardHeader>
          <CardContent>
            <MockMap
              points={storePoints.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.title }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-base">
              <Clock className="size-4 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {timeline.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{order.id.replace("order_", "")}
                    </Link>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatRelativeTime(order.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <ul className="divide-y">
              {recentOrders.rows.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{order.id.replace("order_", "")}
                    </Link>
                    <p className="truncate text-sm">{order.customer?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.store?.address}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.items.map((i) => i.product?.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <DataPagination
              page={ordersPage}
              totalPages={recentOrders.totalPages}
              totalItems={recentOrders.total}
              buildHref={ordersHref}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trending Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {trendingProducts.map((product, i) => (
                <li key={product.id} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={36}
                    height={36}
                    className="size-9 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.orderCount} orders · {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </li>
              ))}
              {trendingProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">No orders in this range.</p>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
