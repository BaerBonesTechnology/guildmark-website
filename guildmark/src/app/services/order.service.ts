/** Order business logic — pure functions (Service). No React state, no effects. */
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
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
  "inspecting",
  "complete",
];

/** Presentation config (label, token colour, icon) for an order status. */
export function orderStatusConfig(status: OrderStatus): OrderStatusConfig {
  switch (status) {
    case "delivered":
      return {
        label: "Delivered",
        color: "var(--grade-a-text)",
        Icon: CheckCircle2,
      };
    case "in_transit":
      return { label: "In Transit", color: "var(--primary)", Icon: Truck };
    case "processing":
      return { label: "Processing", color: "var(--grade-b-text)", Icon: Clock };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "var(--grade-c-text)",
        Icon: AlertCircle,
      };
    case "refunded":
      return {
        label: "Refunded",
        color: "var(--muted-foreground)",
        Icon: RotateCcw,
      };
  }
}

/** Filter orders for the active tab (all / purchases / sales). */
export function filterOrdersByTab(orders: Order[], tab: OrderTab): Order[] {
  if (tab === "all") return orders;
  return orders.filter((order) => order.type === tab.slice(0, -1));
}

/** Human-readable date-time, e.g. "Mar 5, 2026, 02:15 PM", or "—" when absent. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "—";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
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
export function orderLifecycleConfig(
  status: OrderLifecycleStatus,
): OrderStatusConfig {
  switch (status) {
    case "complete":
      return {
        label: "Complete",
        color: "var(--grade-a-text)",
        Icon: CheckCircle2,
      };
    case "shipped":
      return { label: "In Transit", color: "var(--primary)", Icon: Truck };
    case "delivered":
      return { label: "Delivered", color: "var(--grade-a-text)", Icon: Truck };
    case "inspecting":
      return {
        label: "Inspection",
        color: "var(--grade-b-text)",
        Icon: ShieldCheck,
      };
    case "funded":
      return {
        label: "Funded",
        color: "var(--grade-a-text)",
        Icon: DollarSign,
      };
    case "disputed":
      return {
        label: "Disputed",
        color: "var(--grade-c-text)",
        Icon: AlertCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "var(--muted-foreground)",
        Icon: RotateCcw,
      };
    default:
      return {
        label: lifecycleLabel(status),
        color: "var(--grade-b-text)",
        Icon: Clock,
      };
  }
}

/** Bound DOM work while the orders API still returns an unpaginated collection. */
export function ordersPage(
  orders: Order[],
  tab: OrderTab,
  status: string,
  search: string,
  rawPage: string | null,
) {
  const term = search.trim().toLocaleLowerCase();
  const filtered = filterOrdersByTab(orders, tab).filter(
    (order) =>
      (status === "all" || order.orderStatus === status) &&
      [
        order.productName,
        order.transactionId,
        order.counterparty,
        order.trackingNumber,
      ].some((value) => value?.toLocaleLowerCase().includes(term)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const parsed = Number(rawPage);
  const page =
    Number.isSafeInteger(parsed) && parsed > 0
      ? Math.min(parsed, totalPages)
      : 1;
  return {
    page,
    totalPages,
    filteredCount: filtered.length,
    pageItems: filtered.slice((page - 1) * 8, page * 8),
  };
}
export function orderMoney(value: number | null | undefined): string {
  return value != null && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    : "Unavailable";
}
export function canReviewDelivery(order: Order | null | undefined): boolean {
  return (
    order?.type === "purchase" &&
    ["delivered", "inspecting"].includes(order.orderStatus)
  );
}
export function orderPaymentLink(order: Order): string | null {
  if (
    order.type !== "purchase" ||
    order.orderStatus !== "awaiting_payment" ||
    !order.escrowPaymentUrl
  )
    return null;
  try {
    const url = new URL(order.escrowPaymentUrl);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
/** Mutation replies may have a seller-default viewpoint. Preserve the viewer's identity and amounts. */
export function mergeOrderLifecycle(current: Order, result: Order): Order {
  if (current.id !== result.id) return current;
  return {
    ...current,
    orderStatus: result.orderStatus,
    status: result.status,
    completedAt: result.completedAt ?? current.completedAt,
    escrowStatus: result.escrowStatus ?? current.escrowStatus,
  };
}
