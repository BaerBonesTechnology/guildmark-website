/**
 * Offload workflow service — pure functions for status styling, formatting,
 * order partitioning, and the FedEx-status → 5-step shipment pipeline.
 */
import { CheckCircle2, FileText, Package, ShieldCheck, Truck } from "lucide-react";
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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function progressPct(steps: PipelineStep[]): number {
  return Math.round((steps.filter((step) => step.status === "complete").length / steps.length) * 100);
}

export function shippedOrders(orders: Order[]): Order[] {
  return orders.filter((order) => ["shipped", "delivered"].includes(order.orderStatus));
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function buildSteps(order: Order, tracking: TrackingData | null | undefined): PipelineStep[] {
  const statusCode = tracking?.status_code ?? "";
  const lifecycle = order.orderStatus;

  const pickupDone = ["IT", "OD", "DL"].includes(statusCode) || ["shipped", "delivered", "inspecting", "complete"].includes(lifecycle);
  const arrivalDone = ["OD", "DL"].includes(statusCode) || ["delivered", "inspecting", "complete"].includes(lifecycle);
  const wipeDone = lifecycle === "complete" || lifecycle === "inspecting";
  const qualityDone = lifecycle === "complete";
  const paymentDone = lifecycle === "complete";

  const step = (done: boolean, next: boolean): StepStatus => (done ? "complete" : next ? "active" : "pending");

  return [
    { id: "pickup", label: "Pickup / Shipped", Icon: Truck, status: step(pickupDone, true) },
    { id: "transit", label: "Arrival Confirmed", Icon: Package, status: step(arrivalDone, pickupDone && !arrivalDone) },
    { id: "wipe", label: "Data Wiping", Icon: ShieldCheck, status: step(wipeDone, arrivalDone && !wipeDone) },
    { id: "quality", label: "Quality Check", Icon: CheckCircle2, status: step(qualityDone, wipeDone && !qualityDone) },
    { id: "payment", label: "Payment Sent", Icon: FileText, status: step(paymentDone, qualityDone && !paymentDone) },
  ];
}
