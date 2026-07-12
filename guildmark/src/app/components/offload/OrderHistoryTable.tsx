/** Order History table — clickable rows jump the tracker to that shipment. */
import { AlertCircle, Loader2, Truck } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { ORDER_HISTORY_HEADERS, TRACKING_LINK_COLOR } from "../../constants/offload.constants";
import { MONO } from "../../constants/typography";
import type { Order, OrdersResponse } from "../../models/order";
import { fmt, statusStyle, usd } from "../../services/offload.service";

interface OrderHistoryTableProps {
  data: OrdersResponse | undefined;
  error: unknown;
  isLoading: boolean;
  onTrack: (orderId: string) => void;
  orders: Order[];
  trackedOrder: Order | null;
}

export function OrderHistoryTable({ data, error, isLoading, onTrack, orders, trackedOrder }: OrderHistoryTableProps) {
  return (
    <div className="border border-border" style={{ background: "var(--card)" }}>
      <div className="p-6 border-b border-border flex items-center justify-between">
        <SectionTitle>Order History</SectionTitle>
        {data?.stats && (
          <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
            <span>{data.stats.totalOrders} orders</span>
            <span style={{ color: "var(--primary)" }}>{usd(data.stats.totalValue * 100)} total value</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {ORDER_HISTORY_HEADERS.map((h) => (
                <th key={h} className="text-left p-4 text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…</td></tr>}
            {error && <tr><td colSpan={7} className="p-8 text-center"><div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--chart-4)" }}><AlertCircle className="w-4 h-4" /> Failed to load orders</div></td></tr>}
            {!isLoading && orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No orders yet</td></tr>}
            {orders.map((order, ndx) => (
              <tr key={order.id}
                className="hover:bg-muted/40 cursor-pointer transition-colors"
                style={{ borderBottom: ndx !== orders.length - 1 ? "1px solid color-mix(in srgb, var(--border) 60%, transparent)" : undefined, background: trackedOrder?.id === order.id ? "color-mix(in srgb, var(--primary) 5%, transparent)" : undefined }}
                onClick={() => { if (["shipped", "delivered"].includes(order.orderStatus)) { onTrack(order.id); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>
                <td className="p-4"><span className="text-sm">{order.transactionId}</span></td>
                <td className="p-4">
                  <p className="text-sm truncate max-w-[160px]">{order.productName}</p>
                  {order.specs && <p className="text-xs truncate max-w-[160px]" style={{ color: "var(--muted-foreground)" }}>{order.specs}</p>}
                </td>
                <td className="p-4"><span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{order.quantity}</span></td>
                <td className="p-4"><span className="inline-flex px-2 py-0.5 text-xs" style={statusStyle(order.orderStatus)}>{order.orderStatus.replace(/_/g, " ")}</span></td>
                <td className="p-4"><span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{fmt(order.createdAt)}</span></td>
                <td className="p-4"><span className="text-sm" style={{ color: "var(--primary)", fontFamily: MONO }}>{usd(order.totalValue * 100)}</span></td>
                <td className="p-4">
                  {order.trackingNumber ? (
                    <button className="text-xs flex items-center gap-1" style={{ color: TRACKING_LINK_COLOR, fontFamily: MONO }}
                      onClick={(e) => { e.stopPropagation(); onTrack(order.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      <Truck className="w-3 h-3" /> {order.trackingNumber.slice(0, 12)}…
                    </button>
                  ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
