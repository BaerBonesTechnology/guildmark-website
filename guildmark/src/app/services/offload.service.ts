/**
 * Offload workflow service — pure functions for status styling, formatting,
 * order partitioning, and the FedEx-status → 5-step shipment pipeline.
 */
import {
  CheckCircle2,
  CreditCard,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { OFFLOAD_STATUS_COLOR } from "../constants/offload.constants";
import type { TrackingData } from "../lib/apiHooks";
import type { Order } from "../models/order";

export type StepStatus = "active" | "complete" | "pending";

export interface PipelineStep {
  Icon: React.ElementType;
  id: string;
  label: string;
  status: StepStatus;
}

export function completeOrders(orders: Order[]): Order[] {
  return orders.filter((order) => order.orderStatus === "complete");
}

export function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function progressPct(steps: PipelineStep[]): number {
  return Math.round(
    (steps.filter((step) => step.status === "complete").length / steps.length) *
      100,
  );
}

export function shippedOrders(orders: Order[]): Order[] {
  return orders.filter((order) =>
    ["shipped", "delivered"].includes(order.orderStatus),
  );
}

export function statusStyle(status: Order["orderStatus"]) {
  const color = OFFLOAD_STATUS_COLOR[status] ?? "var(--muted-foreground)";
  return {
    color,
    border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
    background: `color-mix(in srgb, ${color} 10%, transparent)`,
  };
}

export function usd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Only order lifecycle milestones are shown; carrier scans never prove erasure or payout. */
export function buildSteps(
  order: Order,
  _tracking?: TrackingData | null,
): PipelineStep[] {
  const statuses = [
    "awaiting_payment",
    "funded",
    "shipped",
    "delivered",
    "inspecting",
    "complete",
  ];
  const rank = statuses.indexOf(order.orderStatus);
  const milestones = [
    { id: "funded", label: "Payment funded", Icon: CreditCard, rank: 1 },
    { id: "shipped", label: "Shipped", Icon: Truck, rank: 2 },
    { id: "delivered", label: "Delivered", Icon: Package, rank: 3 },
    { id: "inspection", label: "Buyer inspection", Icon: ShieldCheck, rank: 4 },
    { id: "complete", label: "Order complete", Icon: CheckCircle2, rank: 5 },
  ];
  const next = milestones.find((milestone) => milestone.rank > rank);
  return milestones.map(({ rank: milestoneRank, ...milestone }) => ({
    ...milestone,
    status:
      rank < 0
        ? "pending"
        : rank >= milestoneRank
          ? "complete"
          : milestone.id === next?.id
            ? "active"
            : "pending",
  }));
}

export function sellerOrders(orders: Order[]): Order[] {
  return orders.filter((order) => order.type === "sale");
}

/** Bound rendering without pretending the orders API supports server pagination. */
export function historyPage(
  orders: Order[],
  search: string,
  status: string,
  rawPage: string | null,
) {
  const term = search.trim().toLocaleLowerCase();
  const filtered = orders.filter(
    (order) =>
      (status === "all" || order.orderStatus === status) &&
      [
        order.transactionId,
        order.productName,
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
