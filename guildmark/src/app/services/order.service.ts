/** Order business logic — pure functions (Service). No React state, no effects. */
import { AlertCircle, CheckCircle2, Clock, DollarSign, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Order, OrderLifecycleStatus, OrderStatus } from "../models/order";
import type { OrderTab } from "../constants/order.constants";

interface OrderStatusConfig {
  Icon: React.ElementType;
  color: string;
  label: string;
}

/** Ordered happy-path lifecycle steps shown in the OrderDetail timeline. */
export const LIFECYCLE_STEPS: OrderLifecycleStatus[] = [
  "awaiting_payment",
  "funded",
  "shipped",
  "delivered",
  "complete",
];

/** Presentation config (label, token colour, icon) for an order status. */
export function orderStatusConfig(status: OrderStatus): OrderStatusConfig {
  switch (status) {
    case "delivered":  return { label: "Delivered",  color: "var(--grade-a)",          Icon: CheckCircle2 };
    case "in_transit": return { label: "In Transit",  color: "var(--primary)",          Icon: Truck };
    case "processing": return { label: "Processing",  color: "var(--grade-b)",          Icon: Clock };
    case "cancelled":  return { label: "Cancelled",   color: "var(--chart-4)",          Icon: AlertCircle };
    case "refunded":   return { label: "Refunded",    color: "var(--muted-foreground)", Icon: RotateCcw };
  }
}

/** Filter orders for the active tab (all / purchases / sales). */
export function filterOrdersByTab(orders: Order[], tab: OrderTab): Order[] {
  if (tab === "all") return orders;
  return orders.filter((order) => order.type === tab.slice(0, -1));
}

/** Human-readable date-time, e.g. "Mar 5, 2026, 02:15 PM", or "—" when absent. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short", year: "numeric" });
}

/** Display label for a lifecycle status. */
export function lifecycleLabel(status: OrderLifecycleStatus): string {
  const labels: Record<OrderLifecycleStatus, string> = {
    awaiting_payment: "Awaiting Payment",
    cancelled: "Cancelled",
    complete: "Complete",
    delivered: "Delivered",
    disputed: "Disputed",
    funded: "Funded",
    inspecting: "Under Inspection",
    shipped: "Shipped",
  };
  return labels[status] ?? status;
}

/** Index of a lifecycle status within LIFECYCLE_STEPS (-1 for terminal states). */
export function lifecycleStepIndex(status: OrderLifecycleStatus): number {
  if (status === "cancelled" || status === "disputed") return -1;
  return LIFECYCLE_STEPS.indexOf(status);
}

/** Presentation config (label, token colour, icon) for a lifecycle status. */
export function orderLifecycleConfig(status: OrderLifecycleStatus): OrderStatusConfig {
  switch (status) {
    case "complete":  return { label: "Complete",   color: "var(--grade-a)",          Icon: CheckCircle2 };
    case "shipped":   return { label: "In Transit",  color: "var(--primary)",          Icon: Truck };
    case "delivered":
    case "inspecting": return { label: "Inspection", color: "var(--grade-b)",          Icon: ShieldCheck };
    case "funded":    return { label: "Funded",     color: "var(--amps-accent)",      Icon: DollarSign };
    case "disputed":  return { label: "Disputed",   color: "var(--chart-4)",          Icon: AlertCircle };
    case "cancelled": return { label: "Cancelled",  color: "var(--muted-foreground)", Icon: RotateCcw };
    default:          return { label: lifecycleLabel(status), color: "var(--grade-b)", Icon: Clock };
  }
}
