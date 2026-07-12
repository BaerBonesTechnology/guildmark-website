/** Live FedEx tracking panel — 5-step pipeline + event feed for one order. */
import { CheckCircle2, Clock, Loader2, MapPin, RefreshCw } from "lucide-react";
import { MonoLabel } from "./MonoLabel";
import { PIPELINE_ACTIVE_COLOR } from "../../constants/offload.constants";
import { BODY, MONO } from "../../constants/typography";
import { useOrderTracking } from "../../lib/apiHooks";
import type { Order } from "../../models/order";
import { buildSteps, fmtDateTime, progressPct } from "../../services/offload.service";

export function TrackingPanel({ orderId, order }: { orderId: string; order: Order }) {
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
                    background: complete ? "var(--primary)" : active ? PIPELINE_ACTIVE_COLOR : "var(--secondary)",
                    color: complete || active ? "#fff" : "var(--muted-foreground)",
                  }}>
                  <s.Icon className="w-6 h-6" />
                </div>
                <p className="text-xs mt-3 text-center max-w-[72px] leading-tight"
                  style={{ fontFamily: BODY, color: complete || active ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  {s.label}
                </p>
                {active && <span className="text-xs mt-1" style={{ color: PIPELINE_ACTIVE_COLOR, fontFamily: MONO }}>In Progress</span>}
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
                {tracking.events.slice(0, 12).map((ev, ndx) => (
                  <div key={ndx} className="flex gap-4 px-4 py-3 text-sm"
                    style={{ borderBottom: ndx < tracking.events.length - 1 ? "1px solid var(--border)" : undefined, background: ndx === 0 ? "var(--secondary)" : undefined, fontFamily: BODY }}>
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
