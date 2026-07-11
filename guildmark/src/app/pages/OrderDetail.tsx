/** OrderDetail page (View) — status, lifecycle timeline, panels, buyer actions. */
import { Link } from "react-router";
import {
  AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, CircleDot, Clock,
  ExternalLink, Hash, MapPin, Package, ShieldCheck, Truck, User,
} from "lucide-react";
import { OrderDetailRow } from "../components/orders/OrderDetailRow";
import { OrderPanel } from "../components/orders/OrderPanel";
import { OrderTimeline } from "../components/orders/OrderTimeline";
import { BODY, DISPLAY, MONO } from "../constants/typography";
import { formatDateTime, orderLifecycleConfig } from "../services/order.service";
import { useOrderDetailViewModel } from "../viewmodels/useOrderDetailViewModel";

export function OrderDetail() {
  const { canAct, confirm, dispute, error, isBuyer, isConfirming, isDisputing, isLoading, order } = useOrderDetailViewModel();

  const BackLink = () => (
    <Link to="/pre/orders" className="inline-flex items-center gap-1.5 text-xs mb-5 hover:text-foreground transition-colors" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
      <ArrowLeft size={13} /> Back to Orders
    </Link>
  );

  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-[1400px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border h-64 animate-pulse" style={{ background: "var(--card)" }} />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="px-6 py-6 max-w-[1400px] mx-auto" style={{ fontFamily: BODY }}>
        <BackLink />
        <div className="border border-border p-8 flex items-start gap-4" style={{ background: "var(--card)", borderLeft: "3px solid var(--chart-4)" }}>
          <AlertCircle size={22} className="mt-0.5 shrink-0" style={{ color: "var(--chart-4)" }} />
          <div><p className="font-medium mb-1">Order not found</p><p className="text-sm" style={{ color: "var(--muted-foreground)" }}>This order could not be loaded.</p></div>
        </div>
      </div>
    );
  }

  const { label: statusLabel, color: statusColor, Icon: StatusIcon } = orderLifecycleConfig(order.orderStatus);

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto pb-20" style={{ fontFamily: BODY }}>
      <BackLink />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="tracking-tight" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", lineHeight: 1 }}>{order.productName}</h1>
          {order.specs && <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{order.specs}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 tracking-wider uppercase shrink-0"
          style={{ fontFamily: MONO, color: statusColor, border: `1px solid color-mix(in srgb, ${statusColor} 35%, transparent)`, background: `color-mix(in srgb, ${statusColor} 8%, transparent)` }}>
          <StatusIcon size={12} /> {statusLabel}
        </span>
      </div>

      {/* Timeline */}
      <div className="border border-border p-6 mb-6" style={{ background: "var(--card)" }}>
        <OrderTimeline order={order} />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OrderPanel title="Order Details">
            <OrderDetailRow icon={Hash} label="Transaction ID" value={order.transactionId} />
            <OrderDetailRow icon={User} label={isBuyer ? "Seller" : "Buyer"} value={order.counterparty} />
            <OrderDetailRow icon={Package} label="Quantity" value={String(order.quantity)} />
            {order.destination && <OrderDetailRow icon={MapPin} label="Destination" value={order.destination} />}
            <OrderDetailRow icon={Clock} label="Created" value={formatDateTime(order.createdAt)} />
          </OrderPanel>
          <OrderPanel title="Shipping">
            <OrderDetailRow icon={Truck} label="Carrier" value={order.carrier ? order.carrier.toUpperCase() : "—"} />
            <OrderDetailRow icon={Hash} label="Tracking" value={order.trackingNumber ?? "Not yet shipped"} />
            <OrderDetailRow icon={CalendarClock} label="Shipped" value={formatDateTime(order.shippedAt)} />
            <OrderDetailRow icon={CheckCircle2} label="Delivered" value={formatDateTime(order.deliveredAt)} />
          </OrderPanel>
        </div>

        <div className="space-y-6">
          <OrderPanel title="Financials">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{isBuyer ? "Total Cost" : "Net Revenue"}</span>
              <span className="text-3xl leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700, color: "var(--primary)" }}>${order.totalValue.toLocaleString()}</span>
            </div>
            {order.completedAt && <OrderDetailRow icon={CheckCircle2} label="Completed" value={formatDateTime(order.completedAt)} />}
          </OrderPanel>
          <OrderPanel title="Escrow">
            <OrderDetailRow icon={ShieldCheck} label="Escrow ID" value={order.escrowTransactionId ?? "Not yet created"} />
            <OrderDetailRow icon={CircleDot} label="Status" value={order.escrowStatus ?? "—"} />
            {order.inspectionEndsAt && <OrderDetailRow icon={CalendarClock} label="Inspection Ends" value={formatDateTime(order.inspectionEndsAt)} />}
            {order.escrowPaymentUrl && (
              <a href={order.escrowPaymentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs mt-1 hover:underline" style={{ color: "var(--primary)", fontFamily: MONO }}>
                <ExternalLink size={12} /> Fund Escrow
              </a>
            )}
          </OrderPanel>

          {canAct && (
            <div className="border p-5" style={{ background: "color-mix(in srgb, var(--grade-b) 6%, var(--card))", borderColor: "color-mix(in srgb, var(--grade-b) 30%, transparent)" }}>
              <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--grade-b)", fontFamily: MONO }}>Action Required</p>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                Inspect the items and confirm receipt to release payment to the seller, or open a dispute if there's an issue.
              </p>
              <div className="flex gap-2">
                <button disabled={isConfirming} onClick={() => confirm(order.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "var(--grade-a)", color: "#fff" }}>
                  <CheckCircle2 size={15} /> {isConfirming ? "Confirming…" : "Confirm Receipt"}
                </button>
                <button disabled={isDisputing} onClick={() => dispute(order.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm border transition-colors disabled:opacity-50"
                  style={{ borderColor: "color-mix(in srgb, var(--chart-4) 40%, transparent)", color: "var(--chart-4)" }}>
                  <AlertCircle size={15} /> {isDisputing ? "Filing…" : "Open Dispute"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
