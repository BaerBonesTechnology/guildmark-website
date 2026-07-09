import { useState } from "react";
import {
  Truck, Package, ShieldCheck, CheckCircle2, FileText,
  Download, RefreshCw, MapPin, Clock, AlertCircle, Loader2,
} from "lucide-react";
import { useOrders, useOrderTracking, type TrackingData } from "../lib/apiHooks";
import type { Order } from "../models/order";

const BODY = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const CARD = { background: "var(--card)" } as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Semantic status colors (inline so they work in both themes).
const STATUS_COLOR: Record<string, string> = {
  awaiting_payment: "#f59e0b",
  funded:           "#2d6ef0",
  shipped:          "#8b5cf6",
  delivered:        "#10b981",
  inspecting:       "#f97316",
  complete:         "var(--primary)",
  disputed:         "#ef4444",
  cancelled:        "var(--muted-foreground)",
};
function statusStyle(status: Order["orderStatus"]) {
  const c = STATUS_COLOR[status] ?? "var(--muted-foreground)";
  return {
    color: c,
    border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
    background: `color-mix(in srgb, ${c} 10%, transparent)`,
  };
}

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function usd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{children}</span>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium" style={{ fontFamily: BODY }}>{children}</p>;
}

// ---------------------------------------------------------------------------
// FedEx status → 5-step progress pipeline
// ---------------------------------------------------------------------------

type StepStatus = "complete" | "active" | "pending";
interface PipelineStep { id: string; label: string; Icon: React.ElementType; status: StepStatus }

function buildSteps(order: Order, tracking: TrackingData | null | undefined): PipelineStep[] {
  const statusCode = tracking?.status_code ?? "";
  const lifecycle = order.orderStatus;

  const pickupDone  = ["IT","OD","DL"].includes(statusCode) || ["shipped","delivered","inspecting","complete"].includes(lifecycle);
  const arrivalDone = ["OD","DL"].includes(statusCode)       || ["delivered","inspecting","complete"].includes(lifecycle);
  const wipeDone    = lifecycle === "complete" || lifecycle === "inspecting";
  const qualityDone = lifecycle === "complete";
  const paymentDone = lifecycle === "complete";

  const step = (done: boolean, next: boolean): StepStatus => done ? "complete" : next ? "active" : "pending";

  return [
    { id: "pickup",  label: "Pickup / Shipped",  Icon: Truck,        status: step(pickupDone, true) },
    { id: "transit", label: "Arrival Confirmed", Icon: Package,      status: step(arrivalDone, pickupDone && !arrivalDone) },
    { id: "wipe",    label: "Data Wiping",       Icon: ShieldCheck,  status: step(wipeDone,   arrivalDone && !wipeDone) },
    { id: "quality", label: "Quality Check",     Icon: CheckCircle2, status: step(qualityDone, wipeDone && !qualityDone) },
    { id: "payment", label: "Payment Sent",      Icon: FileText,     status: step(paymentDone, qualityDone && !paymentDone) },
  ];
}
function progressPct(steps: PipelineStep[]) {
  return Math.round((steps.filter(s => s.status === "complete").length / steps.length) * 100);
}

// ---------------------------------------------------------------------------
// Tracking panel
// ---------------------------------------------------------------------------

function TrackingPanel({ orderId, order }: { orderId: string; order: Order }) {
  const { data: tracking, isLoading, error, refetch, isFetching } = useOrderTracking(
    orderId, order.orderStatus === "shipped" || order.orderStatus === "delivered",
  );
  const steps = buildSteps(order, tracking);
  const pct = progressPct(steps);

  return (
    <div className="space-y-6">
      {/* Progress pipeline */}
      <div className="relative">
        <div className="absolute top-8 left-0 right-0 h-px" style={{ background: "var(--border)" }} />
        <div className="absolute top-8 left-0 h-px transition-all duration-700" style={{ width: `${pct}%`, background: "var(--primary)" }} />
        <div className="relative flex justify-between">
          {steps.map((s) => {
            const complete = s.status === "complete";
            const active = s.status === "active";
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    background: complete ? "var(--primary)" : active ? "#f59e0b" : "var(--secondary)",
                    color: complete || active ? "#fff" : "var(--muted-foreground)",
                  }}>
                  <s.Icon className="w-6 h-6" />
                </div>
                <p className="text-xs mt-3 text-center max-w-[72px] leading-tight"
                  style={{ fontFamily: BODY, color: complete || active ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {s.label}
                </p>
                {active && <span className="text-xs mt-1" style={{ color: "#f59e0b", fontFamily: MONO }}>In Progress</span>}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> Fetching live tracking…
        </div>
      )}

      {tracking && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2"><MonoLabel>Status</MonoLabel>
              <span className="text-sm font-medium">{tracking.status}</span>
            </div>
            {tracking.estimated_delivery && !tracking.actual_delivery && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                <MonoLabel>ETA</MonoLabel>
                <span className="text-sm">{fmtDateTime(tracking.estimated_delivery)}</span>
              </div>
            )}
            {tracking.actual_delivery && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--chart-3)" }} />
                <MonoLabel>Delivered</MonoLabel>
                <span className="text-sm" style={{ color: "var(--chart-3)" }}>{fmtDateTime(tracking.actual_delivery)}</span>
              </div>
            )}
            <button onClick={() => refetch()} disabled={isFetching}
              className="ml-auto flex items-center gap-1.5 text-xs hover:text-foreground disabled:opacity-50 transition-colors"
              style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>
              <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {tracking.events.length > 0 && (
            <div className="border border-border">
              <div className="max-h-52 overflow-y-auto">
                {tracking.events.slice(0, 12).map((ev, i) => (
                  <div key={i} className="flex gap-4 px-4 py-3 text-sm"
                    style={{ borderBottom: i < tracking.events.length - 1 ? "1px solid var(--border)" : undefined, background: i === 0 ? "var(--secondary)" : undefined, fontFamily: BODY }}>
                    <span className="whitespace-nowrap text-xs shrink-0 pt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{fmtDateTime(ev.timestamp)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{ev.event_description}</p>
                      {(ev.city || ev.state) && (
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[ev.city, ev.state, ev.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && !tracking && !error && order.trackingNumber && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Tracking unavailable — FedEx may not have scanned this shipment yet.</p>
      )}
      {!order.trackingNumber && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No tracking number attached to this order yet.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function OffloadWorkflow() {
  const { data, isLoading, error } = useOrders();
  const orders = data?.orders ?? [];
  const shipped = orders.filter(o => ["shipped","delivered"].includes(o.orderStatus));
  const complete = orders.filter(o => o.orderStatus === "complete");

  const [trackedId, setTrackedId] = useState<string | null>(null);
  const trackedOrder = shipped.find(o => o.id === trackedId) ?? shipped[0] ?? null;

  const selectClass = "px-2 py-1 text-xs border border-border text-foreground focus:outline-none focus:border-primary appearance-none";
  const selectStyle = { fontFamily: BODY, background: "var(--input-background)" } as const;

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto space-y-4" style={{ fontFamily: BODY }}>

      {/* ── Logistics Generation ── */}
      <div className="border border-border p-6" style={CARD}>
        <SectionTitle>Logistics Generation</SectionTitle>
        <div className="grid md:grid-cols-2 gap-6 mt-5">
          <div>
            <label className="block mb-2"><MonoLabel>Shipping Method</MonoLabel></label>
            <select className={`w-full ${selectClass} py-2.5 text-sm`} style={selectStyle}>
              <option>Prepaid Labels (1–5 units)</option>
              <option>Pallet Pickup (6+ units)</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Labels are generated per order when a buyer offer is accepted and the escrow is funded.
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button disabled className="flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-50" style={{ background: "var(--primary)", color: "#fff" }}>
            <Download className="w-4 h-4" /> Generate Shipping Labels
          </button>
          <button disabled className="flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-50 border border-border" style={{ color: "var(--muted-foreground)" }}>
            <Truck className="w-4 h-4" /> Schedule Pallet Pickup
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
          Logistics actions are triggered automatically through the order flow — select a funded order to proceed.
        </p>
      </div>

      {/* ── Active Shipment Tracker ── */}
      <div className="border border-border p-6" style={CARD}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionTitle>{trackedOrder ? `Active Shipment: ${trackedOrder.transactionId}` : "Shipment Tracker"}</SectionTitle>
            {trackedOrder?.trackingNumber && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>FedEx {trackedOrder.trackingNumber}</p>
            )}
          </div>
          {shipped.length > 1 && (
            <select value={trackedId ?? trackedOrder?.id ?? ""} onChange={e => setTrackedId(e.target.value)} className={selectClass} style={selectStyle}>
              {shipped.map(o => <option key={o.id} value={o.id}>{o.transactionId}</option>)}
            </select>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        )}
        {!isLoading && trackedOrder && <TrackingPanel orderId={trackedOrder.id} order={trackedOrder} />}
        {!isLoading && !trackedOrder && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <Truck className="w-10 h-10" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No active shipments. Orders in transit will appear here.</p>
          </div>
        )}
      </div>

      {/* ── Order History ── */}
      <div className="border border-border" style={CARD}>
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
                {["Order ID","Product","Qty","Status","Date","Value","Tracking"].map(h => (
                  <th key={h} className="text-left p-4 text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…</td></tr>}
              {error && <tr><td colSpan={7} className="p-8 text-center"><div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--chart-4)" }}><AlertCircle className="w-4 h-4" /> Failed to load orders</div></td></tr>}
              {!isLoading && orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No orders yet</td></tr>}
              {orders.map((order, idx) => (
                <tr key={order.id}
                  className="hover:bg-muted/40 cursor-pointer transition-colors"
                  style={{ borderBottom: idx !== orders.length - 1 ? "1px solid color-mix(in srgb, var(--border) 60%, transparent)" : undefined, background: trackedOrder?.id === order.id ? "color-mix(in srgb, var(--primary) 5%, transparent)" : undefined }}
                  onClick={() => { if (["shipped","delivered"].includes(order.orderStatus)) { setTrackedId(order.id); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>
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
                      <button className="text-xs flex items-center gap-1" style={{ color: "#8b5cf6", fontFamily: MONO }}
                        onClick={e => { e.stopPropagation(); setTrackedId(order.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
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

      {/* ── Compliance Vault ── */}
      <div className="border border-border p-6" style={CARD}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <SectionTitle>Compliance Vault</SectionTitle>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Certificates of data destruction for legal and audit purposes</p>
          </div>
          <FileText className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
        </div>

        {complete.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "var(--muted-foreground)" }}>
            Certificates appear here once orders reach the <strong>complete</strong> status.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complete.map(order => (
              <div key={order.id} className="border border-border p-4 hover:border-primary transition-colors cursor-pointer" style={{ background: "var(--secondary)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                    <FileText className="w-6 h-6" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{order.transactionId}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>NIST 800-88 · {order.quantity} unit{order.quantity !== 1 ? "s" : ""}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>{fmt(order.completedAt ?? order.createdAt)}</p>
                  </div>
                </div>
                <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 border transition-colors"
                  style={{ color: "var(--primary)", borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)" }}>
                  <Download className="w-3 h-3" /> Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
