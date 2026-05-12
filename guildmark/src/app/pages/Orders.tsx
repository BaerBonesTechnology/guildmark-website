import { useState } from "react";
import { Link } from "react-router";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Truck,
  MapPin,
  Hash,
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Inbox,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useOrders } from "../hooks/useOrders";

type OrderTab = "all" | "purchases" | "sales";

type OrderStatus =
  | "delivered"
  | "in_transit"
  | "processing"
  | "cancelled"
  | "refunded";

function statusConfig(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return {
        label: "Delivered",
        className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        Icon: CheckCircle2,
      };
    case "in_transit":
      return {
        label: "In Transit",
        className: "bg-primary/10 text-primary border-primary/30",
        Icon: Truck,
      };
    case "processing":
      return {
        label: "Processing",
        className: "bg-warning/10 text-warning border-warning/30",
        Icon: Clock,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-500/10 text-red-500 border-red-500/30",
        Icon: AlertCircle,
      };
    case "refunded":
      return {
        label: "Refunded",
        className: "bg-muted text-muted-foreground border-border",
        Icon: RotateCcw,
      };
  }
}

function EmptyState({ tab }: { tab: OrderTab }) {
  const labels: Record<OrderTab, string> = {
    all: "orders",
    purchases: "purchases",
    sales: "sales",
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-mono font-semibold text-foreground">
          No {labels[tab]} yet
        </p>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {tab === "purchases"
            ? "Items you buy from the marketplace will appear here."
            : tab === "sales"
            ? "Orders placed by buyers for your listings will appear here."
            : "Your completed and active orders will show here once you start trading."}
        </p>
      </div>
    </div>
  );
}

export function Orders() {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const { orders, stats, isLoading } = useOrders();

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.type === activeTab.slice(0, -1)); // "purchases" → "purchase"

  const tabs: { key: OrderTab; label: string }[] = [
    { key: "all", label: "All Orders" },
    { key: "purchases", label: "Purchases" },
    { key: "sales", label: "Sales" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-mono font-semibold text-foreground">
          Orders &amp; Transactions
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Track your purchases, sales, and shipment activity in one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
                Total Orders
              </p>
            </div>
            <p className="text-2xl font-mono text-foreground">
              {isLoading ? "—" : (stats?.totalOrders ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
                Active Orders
              </p>
            </div>
            <p className="text-2xl font-mono text-primary">
              {isLoading ? "—" : (stats?.activeOrders ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
                Total Value
              </p>
            </div>
            <p className="text-2xl font-mono text-emerald-500">
              {isLoading
                ? "—"
                : `$${(stats?.totalValue ?? 0).toLocaleString()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
                This Month
              </p>
            </div>
            <p className="text-2xl font-mono text-foreground">
              {isLoading
                ? "—"
                : `$${(stats?.monthValue ?? 0).toLocaleString()}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = statusConfig(order.status as OrderStatus);
            const StatusIcon = status.Icon;
            const isSale = order.type === "sale";

            return (
              <Card key={order.id} className="font-mono">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left — product & counterparty */}
                    <div className="flex-1 space-y-3">
                      {/* Product */}
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {isSale ? (
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-semibold text-sm text-foreground">
                            {order.productName}
                          </p>
                          {order.specs && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.specs}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {order.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {order.transactionId}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {isSale ? `Buyer: ${order.counterparty}` : `Seller: ${order.counterparty}`}
                        </span>
                        {order.destination && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.destination}
                          </span>
                        )}
                      </div>

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-border w-fit">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-mono text-foreground">
                            {order.carrier ?? "Carrier"} · {order.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right — status & financials */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <Badge
                        className={`flex items-center gap-1 border font-mono text-xs ${status.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>

                      <div className="text-right">
                        <p className="text-lg font-mono font-semibold text-foreground">
                          ${order.totalValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSale ? "Net revenue" : "Total cost"}
                        </p>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs"
                      >
                        <Link to={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
