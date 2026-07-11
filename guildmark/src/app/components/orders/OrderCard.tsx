/** A single order row in the Orders list. */
import { Link } from "react-router";
import { Hash, MapPin, ShoppingBag, ShoppingCart, Truck, User } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { DISPLAY, MONO } from "../../constants/typography";
import type { Order, OrderStatus } from "../../models/order";

export function OrderCard({ order }: { order: Order }) {
  const isSale = order.type === "sale";

  return (
    <div className="border border-border p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
              {isSale ? <ShoppingBag size={15} style={{ color: "var(--muted-foreground)" }} /> : <ShoppingCart size={15} style={{ color: "var(--muted-foreground)" }} />}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{order.productName}</p>
              {order.specs && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{order.specs}</p>}
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Qty: {order.quantity}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs pl-12" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
            <span className="flex items-center gap-1"><Hash size={11} /> {order.transactionId}</span>
            <span className="flex items-center gap-1"><User size={11} /> {isSale ? "Buyer" : "Seller"}: {order.counterparty}</span>
            {order.destination && <span className="flex items-center gap-1"><MapPin size={11} /> {order.destination}</span>}
          </div>
          {order.trackingNumber && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 w-fit" style={{ border: "1px solid var(--border)", background: "var(--secondary)" }}>
              <Truck size={12} style={{ color: "var(--muted-foreground)" }} />
              <span className="text-xs" style={{ fontFamily: MONO }}>{order.carrier ?? "Carrier"} · {order.trackingNumber}</span>
            </div>
          )}
        </div>
        {/* Right */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <OrderStatusBadge status={order.status as OrderStatus} />
          <div className="text-right">
            <p className="text-lg leading-none" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>${order.totalValue.toLocaleString()}</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{isSale ? "Net revenue" : "Total cost"}</p>
          </div>
          <Link to={`/pre/orders/${order.id}`} className="inline-flex items-center px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors">View Details</Link>
        </div>
      </div>
    </div>
  );
}
