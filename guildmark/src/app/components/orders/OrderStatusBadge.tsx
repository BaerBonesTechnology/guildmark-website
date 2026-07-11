/** Status pill for an order (label + token colour + icon). */
import { MONO } from "../../constants/typography";
import { orderStatusConfig } from "../../services/order.service";
import type { OrderStatus } from "../../models/order";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color, Icon } = orderStatusConfig(status);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 tracking-wider uppercase"
      style={{ fontFamily: MONO, color, border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 8%, transparent)` }}>
      <Icon size={10} /> {label}
    </span>
  );
}
