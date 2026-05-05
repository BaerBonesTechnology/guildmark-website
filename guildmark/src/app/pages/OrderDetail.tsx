import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  DollarSign,
  Hash,
  User,
  MapPin,
  ShieldCheck,
  ExternalLink,
  CalendarClock,
  CircleDot,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useOrder, useConfirmOrder, useDisputeOrder } from "../hooks/useOrders";
import type { Order, OrderLifecycleStatus } from "../models/order";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function lifecycleLabel(status: OrderLifecycleStatus): string {
  const map: Record<OrderLifecycleStatus, string> = {
    awaiting_payment: "Awaiting Payment",
    funded: "Funded",
    shipped: "Shipped",
    delivered: "Delivered",
    inspecting: "Under Inspection",
    complete: "Complete",
    disputed: "Disputed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

interface StatusCfg {
  label: string;
  className: string;
  Icon: React.ElementType;
}

function statusConfig(status: OrderLifecycleStatus): StatusCfg {
  switch (status) {
    case "complete":
      return { label: "Complete", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", Icon: CheckCircle2 };
    case "shipped":
      return { label: "In Transit", className: "bg-blue-500/10 text-blue-500 border-blue-500/30", Icon: Truck };
    case "delivered":
    case "inspecting":
      return { label: "Inspection", className: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: ShieldCheck };
    case "funded":
      return { label: "Funded", className: "bg-violet-500/10 text-violet-500 border-violet-500/30", Icon: DollarSign };
    case "disputed":
      return { label: "Disputed", className: "bg-red-500/10 text-red-500 border-red-500/30", Icon: AlertCircle };
    case "cancelled":
      return { label: "Cancelled", className: "bg-muted text-muted-foreground border-border", Icon: RotateCcw };
    default:
      return { label: lifecycleLabel(status), className: "bg-amber-500/10 text-amber-500 border-amber-500/30", Icon: Clock };
  }
}

// ---------------------------------------------------------------------------
// Lifecycle timeline
// ---------------------------------------------------------------------------

const LIFECYCLE_STEPS: OrderLifecycleStatus[] = [
  "awaiting_payment",
  "funded",
  "shipped",
  "delivered",
  "complete",
];

function stepIndex(status: OrderLifecycleStatus): number {
  if (status === "cancelled" || status === "disputed") return -1;
  return LIFECYCLE_STEPS.indexOf(status as OrderLifecycleStatus);
}

function OrderTimeline({ order }: { order: Order }) {
  const current = stepIndex(order.orderStatus);
  const isBad = order.orderStatus === "cancelled" || order.orderStatus === "disputed";

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
        Order Timeline
      </p>
      <div className="flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const done = !isBad && i <= current;
          const active = !isBad && i === current;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isBad
                      ? "border-border bg-muted"
                      : done
                      ? active
                        ? "border-[#3B82F6] bg-[#3B82F6]"
                        : "border-emerald-500 bg-emerald-500"
                      : "border-border bg-background"
                  }`}
                >
                  {done && !isBad ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <CircleDot className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p
                  className={`text-[10px] font-mono mt-1 text-center w-16 leading-tight ${
                    active ? "text-[#3B82F6] font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {lifecycleLabel(step)}
                </p>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-5 transition-colors ${
                    !isBad && i < current ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
        {isBad && (
          <div className="ml-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs font-mono text-red-500">
              {order.orderStatus === "cancelled" ? "Cancelled" : "Disputed"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { order, isLoading, error } = useOrder(id!);
  const { confirm, isConfirming } = useConfirmOrder();
  const { dispute, isDisputing } = useDisputeOrder();

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline" size="sm" className="font-mono">
          <Link to="/orders">← Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const { label: statusLabel, className: statusClass, Icon: StatusIcon } = statusConfig(
    order.orderStatus
  );

  const isBuyer = order.type === "purchase";
  const canConfirm =
    isBuyer &&
    (order.orderStatus === "delivered" || order.orderStatus === "inspecting");
  const canDispute =
    isBuyer &&
    (order.orderStatus === "delivered" || order.orderStatus === "inspecting");

  return (
    <div className="space-y-6 pb-20">
      {/* Back link + header */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-mono hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-mono font-semibold text-foreground">
              {order.productName}
            </h1>
            {order.specs && (
              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                {order.specs}
              </p>
            )}
          </div>
          <Badge
            className={`flex items-center gap-1.5 border font-mono text-xs px-3 py-1.5 ${statusClass}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <OrderTimeline order={order} />
        </CardContent>
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Order info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row icon={Hash} label="Transaction ID" value={order.transactionId} />
              <Row
                icon={User}
                label={isBuyer ? "Seller" : "Buyer"}
                value={order.counterparty}
              />
              <Row icon={Package} label="Quantity" value={String(order.quantity)} />
              {order.destination && (
                <Row icon={MapPin} label="Destination" value={order.destination} />
              )}
              <Row icon={Clock} label="Created" value={fmt(order.createdAt)} />
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                icon={Truck}
                label="Carrier"
                value={order.carrier ? order.carrier.toUpperCase() : "—"}
              />
              <Row
                icon={Hash}
                label="Tracking"
                value={order.trackingNumber ?? "Not yet shipped"}
              />
              <Row icon={CalendarClock} label="Shipped" value={fmt(order.shippedAt)} />
              <Row icon={CheckCircle2} label="Delivered" value={fmt(order.deliveredAt)} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Financials + Escrow */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">
                  {isBuyer ? "Total Cost" : "Net Revenue"}
                </span>
                <span className="text-2xl font-mono font-semibold text-foreground">
                  ${order.totalValue.toLocaleString()}
                </span>
              </div>
              {order.completedAt && (
                <Row
                  icon={CheckCircle2}
                  label="Completed"
                  value={fmt(order.completedAt)}
                />
              )}
            </CardContent>
          </Card>

          {/* Escrow */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                Escrow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                icon={ShieldCheck}
                label="Escrow ID"
                value={order.escrowTransactionId ?? "Not yet created"}
              />
              <Row
                icon={CircleDot}
                label="Status"
                value={order.escrowStatus ?? "—"}
              />
              {order.inspectionEndsAt && (
                <Row
                  icon={CalendarClock}
                  label="Inspection Ends"
                  value={fmt(order.inspectionEndsAt)}
                />
              )}
              {order.escrowPaymentUrl && (
                <a
                  href={order.escrowPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3B82F6] hover:underline mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Fund Escrow
                </a>
              )}
            </CardContent>
          </Card>

          {/* Buyer actions */}
          {(canConfirm || canDispute) && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-mono text-muted-foreground">
                  Inspect the items and confirm receipt to release payment to the
                  seller, or open a dispute if there's an issue.
                </p>
                <div className="flex gap-2">
                  {canConfirm && (
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-mono"
                      disabled={isConfirming}
                      onClick={() => confirm(order.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {isConfirming ? "Confirming…" : "Confirm Receipt"}
                    </Button>
                  )}
                  {canDispute && (
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/40 text-red-500 hover:bg-red-500/10 font-mono"
                      disabled={isDisputing}
                      onClick={() => dispute(order.id)}
                    >
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      {isDisputing ? "Filing…" : "Open Dispute"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared row component
// ---------------------------------------------------------------------------

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs font-mono">{label}</span>
      </div>
      <span className="text-xs font-mono text-foreground text-right max-w-[200px] truncate">
        {value}
      </span>
    </div>
  );
}
