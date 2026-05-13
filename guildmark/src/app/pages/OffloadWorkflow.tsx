import { useState } from "react";
import {
  Truck, Package, ShieldCheck, CheckCircle2, FileText,
  Download, RefreshCw, MapPin, Clock, AlertCircle, Loader2,
} from "lucide-react";
import { useOrders, useOrderTracking, type TrackingData } from "../lib/apiHooks";
import type { Order } from "../models/order";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: Order["orderStatus"]) {
  const map: Record<string, string> = {
    awaiting_payment: "bg-yellow-500/20 text-yellow-400",
    funded:           "bg-blue-500/20   text-blue-400",
    shipped:          "bg-violet-500/20 text-violet-400",
    delivered:        "bg-emerald-500/20 text-emerald-400",
    inspecting:       "bg-orange-500/20  text-orange-400",
    complete:         "bg-primary/20     text-primary",
    disputed:         "bg-red-500/20     text-red-400",
    cancelled:        "bg-slate-500/20   text-slate-400",
  };
  return map[status] ?? "bg-slate-500/20 text-slate-400";
}

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function usd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(cents / 100);
}

// ---------------------------------------------------------------------------
// Map FedEx status code → our 5-step progress pipeline
// ---------------------------------------------------------------------------

type StepStatus = "complete" | "active" | "pending";

interface PipelineStep {
  id:     string;
  label:  string;
  Icon:   React.ElementType;
  status: StepStatus;
}

/**
 * FedEx derivedStatusCode groups:
 *   PU  = picked up
 *   IT  = in transit / at facility
 *   OD  = out for delivery
 *   DL  = delivered
 *   DE/RS/HL/CC = exception / returned
 */
function buildSteps(order: Order, tracking: TrackingData | null | undefined): PipelineStep[] {
  const statusCode = tracking?.status_code ?? "";
  const lifecycle  = order.orderStatus;

  // Derive step completion from the FedEx status (or fall back to order status)
  const pickupDone   = ["IT","OD","DL"].includes(statusCode) || ["shipped","delivered","inspecting","complete"].includes(lifecycle);
  const arrivalDone  = ["OD","DL"].includes(statusCode)        || ["delivered","inspecting","complete"].includes(lifecycle);
  const wipeDone     = lifecycle === "complete" || lifecycle === "inspecting";
  const qualityDone  = lifecycle === "complete";
  const paymentDone  = lifecycle === "complete";

  const step = (done: boolean, next: boolean): StepStatus =>
    done ? "complete" : next ? "active" : "pending";

  return [
    { id: "pickup",  label: "Pickup / Shipped",   Icon: Truck,        status: step(pickupDone, true) },
    { id: "transit", label: "Arrival Confirmed",  Icon: Package,      status: step(arrivalDone, pickupDone && !arrivalDone) },
    { id: "wipe",    label: "Data Wiping",        Icon: ShieldCheck,  status: step(wipeDone,   arrivalDone && !wipeDone) },
    { id: "quality", label: "Quality Check",      Icon: CheckCircle2, status: step(qualityDone, wipeDone && !qualityDone) },
    { id: "payment", label: "Payment Sent",       Icon: FileText,     status: step(paymentDone, qualityDone && !paymentDone) },
  ];
}

function progressPct(steps: PipelineStep[]) {
  const done = steps.filter(s => s.status === "complete").length;
  // Each step covers a segment; show 0% until first is done
  return Math.round((done / steps.length) * 100);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TrackingPanel({ orderId, order }: { orderId: string; order: Order }) {
  const { data: tracking, isLoading, error, refetch, isFetching } = useOrderTracking(
    orderId,
    order.orderStatus === "shipped" || order.orderStatus === "delivered",
  );

  const steps = buildSteps(order, tracking);
  const pct   = progressPct(steps);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-700" />
        <div
          className="absolute top-8 left-0 h-0.5 bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isComplete = step.status === "complete";
            const isActive   = step.status === "active";
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? "bg-primary text-white"
                      : isActive
                      ? "bg-yellow-500 text-white animate-pulse"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                  }`}
                >
                  <step.Icon className="w-6 h-6" />
                </div>
                <p className={`text-xs font-sans mt-3 text-center max-w-[72px] leading-tight ${
                  isComplete || isActive
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <span className="text-xs text-yellow-500 font-sans mt-1">In Progress</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FedEx details */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm font-sans text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching live tracking…
        </div>
      )}

      {tracking && (
        <div className="space-y-3">
          {/* Status + ETA row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-slate-400 uppercase tracking-wide">Status</span>
              <span className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-100">
                {tracking.status}
              </span>
            </div>
            {tracking.estimated_delivery && !tracking.actual_delivery && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-sans text-slate-400">ETA</span>
                <span className="text-sm font-sans text-slate-700 dark:text-slate-200">
                  {fmtDateTime(tracking.estimated_delivery)}
                </span>
              </div>
            )}
            {tracking.actual_delivery && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-sans text-slate-400">Delivered</span>
                <span className="text-sm font-sans text-emerald-500">
                  {fmtDateTime(tracking.actual_delivery)}
                </span>
              </div>
            )}
            <div className="ml-auto">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 text-xs font-sans text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Scan events timeline */}
          {tracking.events.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {tracking.events.slice(0, 12).map((ev, i) => (
                  <div
                    key={i}
                    className={`flex gap-4 px-4 py-3 text-sm font-sans ${
                      i < tracking.events.length - 1
                        ? "border-b border-slate-100 dark:border-slate-700/30"
                        : ""
                    } ${i === 0 ? "bg-slate-50 dark:bg-slate-800/60" : ""}`}
                  >
                    <span className="text-slate-400 whitespace-nowrap text-xs shrink-0 pt-0.5">
                      {fmtDateTime(ev.timestamp)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-100 truncate">
                        {ev.event_description}
                      </p>
                      {(ev.city || ev.state) && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
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

      {/* No tracking number yet */}
      {!isLoading && !tracking && !error && order.trackingNumber && (
        <p className="text-sm font-sans text-slate-400">
          Tracking unavailable — FedEx may not have scanned this shipment yet.
        </p>
      )}

      {!order.trackingNumber && (
        <p className="text-sm font-sans text-slate-400">
          No tracking number attached to this order yet.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OffloadWorkflow() {
  const { data, isLoading, error } = useOrders();

  const orders     = data?.orders ?? [];
  const shipped    = orders.filter(o => ["shipped","delivered"].includes(o.orderStatus));
  const complete   = orders.filter(o => o.orderStatus === "complete");

  // Which shipped order is selected for the tracker
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const trackedOrder = shipped.find(o => o.id === trackedId) ?? shipped[0] ?? null;

  return (
    <div className="space-y-6 pb-20">

      {/* ── Logistics Generation ── */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <h2 className="font-sans text-slate-900 dark:text-slate-100 mb-6">Logistics Generation</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-sans text-slate-400 mb-2 uppercase tracking-wide">
              Shipping Method
            </label>
            <select className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-sm font-sans text-slate-200 focus:outline-none focus:border-primary">
              <option>Prepaid Labels (1–5 units)</option>
              <option>Pallet Pickup (6+ units)</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              Labels are generated per order when a buyer offer is accepted and the escrow is funded.
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            disabled
            className="flex-1 bg-primary/60 text-white px-4 py-3 rounded-lg font-sans text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            <Download className="w-4 h-4" />
            Generate Shipping Labels
          </button>
          <button
            disabled
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-lg font-sans text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            <Truck className="w-4 h-4" />
            Schedule Pallet Pickup
          </button>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-3">
          Logistics actions are triggered automatically through the order flow — select a funded order to proceed.
        </p>
      </div>

      {/* ── Active Shipment Tracker ── */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-sans text-slate-900 dark:text-slate-100">
              {trackedOrder
                ? `Active Shipment: ${trackedOrder.transactionId}`
                : "Shipment Tracker"}
            </h2>
            {trackedOrder?.trackingNumber && (
              <p className="text-xs font-sans text-slate-400 mt-0.5">
                FedEx {trackedOrder.trackingNumber}
              </p>
            )}
          </div>
          {/* Select among shipped orders */}
          {shipped.length > 1 && (
            <select
              value={trackedId ?? trackedOrder?.id ?? ""}
              onChange={e => setTrackedId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-sans text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {shipped.map(o => (
                <option key={o.id} value={o.id}>{o.transactionId}</option>
              ))}
            </select>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm font-sans text-slate-400 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading orders…
          </div>
        )}

        {!isLoading && trackedOrder && (
          <TrackingPanel orderId={trackedOrder.id} order={trackedOrder} />
        )}

        {!isLoading && !trackedOrder && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <Truck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="font-sans text-sm text-slate-400">
              No active shipments. Orders in transit will appear here.
            </p>
          </div>
        )}
      </div>

      {/* ── Order History ── */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="font-sans text-slate-900 dark:text-slate-100">Order History</h2>
          {data?.stats && (
            <div className="flex gap-4 text-xs font-sans text-slate-400">
              <span>{data.stats.totalOrders} orders</span>
              <span className="text-primary font-semibold">
                {usd(data.stats.totalValue * 100)} total value
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                {["Order ID","Product","Qty","Status","Date","Value","Tracking"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm font-sans text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-sans text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      Failed to load orders
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm font-sans text-slate-400">
                    No orders yet
                  </td>
                </tr>
              )}
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors ${
                    idx !== orders.length - 1 ? "border-b border-slate-100 dark:border-slate-700/30" : ""
                  } ${trackedOrder?.id === order.id ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    if (["shipped","delivered"].includes(order.orderStatus)) {
                      setTrackedId(order.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <td className="p-4">
                    <span className="font-sans text-sm text-slate-700 dark:text-slate-200">
                      {order.transactionId}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-sans text-sm text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                      {order.productName}
                    </p>
                    {order.specs && (
                      <p className="text-xs text-slate-400 font-sans truncate max-w-[160px]">{order.specs}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-sans text-sm text-slate-600 dark:text-slate-300">{order.quantity}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-sans ${statusBadge(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-sans text-sm text-slate-500 dark:text-slate-400">{fmt(order.createdAt)}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-sans text-sm text-primary font-semibold">
                      {usd(order.totalValue * 100)}
                    </span>
                  </td>
                  <td className="p-4">
                    {order.trackingNumber ? (
                      <button
                        className="text-xs font-sans text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); setTrackedId(order.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        <Truck className="w-3 h-3" />
                        {order.trackingNumber.slice(0, 12)}…
                      </button>
                    ) : (
                      <span className="text-xs font-sans text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Compliance Vault ── */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-sans text-slate-900 dark:text-slate-100">Compliance Vault</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Certificates of data destruction for legal and audit purposes
            </p>
          </div>
          <FileText className="w-6 h-6 text-slate-400" />
        </div>

        {complete.length === 0 ? (
          <p className="text-sm font-sans text-slate-400 py-4">
            Certificates appear here once orders reach the <strong>complete</strong> status.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complete.map(order => (
              <div
                key={order.id}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-sans text-slate-800 dark:text-slate-200 truncate">
                      {order.transactionId}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      NIST 800-88 · {order.quantity} unit{order.quantity !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-slate-400 font-sans">{fmt(order.completedAt ?? order.createdAt)}</p>
                  </div>
                </div>
                <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-sans text-primary hover:text-primary/80 transition-colors py-1.5 border border-primary/20 hover:border-primary/40 rounded">
                  <Download className="w-3 h-3" />
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
