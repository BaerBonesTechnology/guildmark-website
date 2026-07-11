/** Horizontal lifecycle progress bar for an order. */
import { AlertCircle, CheckCircle2, CircleDot } from "lucide-react";
import { LIFECYCLE_STEPS, lifecycleLabel, lifecycleStepIndex } from "../../services/order.service";
import { MONO } from "../../constants/typography";
import type { Order } from "../../models/order";

export function OrderTimeline({ order }: { order: Order }) {
  const current = lifecycleStepIndex(order.orderStatus);
  const isBad = order.orderStatus === "cancelled" || order.orderStatus === "disputed";

  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--muted-foreground)", fontFamily: MONO }}>Order Timeline</p>
      <div className="flex items-start gap-0">
        {LIFECYCLE_STEPS.map((step, ndx) => {
          const done = !isBad && ndx <= current;
          const active = !isBad && ndx === current;
          const color = active ? "var(--primary)" : done ? "var(--grade-a)" : "var(--border)";
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 flex items-center justify-center" style={{ border: `2px solid ${color}`, background: done ? color : "var(--background)" }}>
                  {done ? <CheckCircle2 size={13} style={{ color: "#fff" }} /> : <CircleDot size={12} style={{ color: "var(--muted-foreground)" }} />}
                </div>
                <p className="text-[10px] mt-1.5 text-center w-16 leading-tight" style={{ fontFamily: MONO, color: active ? "var(--primary)" : "var(--muted-foreground)" }}>{lifecycleLabel(step)}</p>
              </div>
              {ndx < LIFECYCLE_STEPS.length - 1 && (
                <div className="h-0.5 flex-1 mx-1 mb-6" style={{ background: !isBad && ndx < current ? "var(--grade-a)" : "var(--border)" }} />
              )}
            </div>
          );
        })}
        {isBad && (
          <div className="ml-2 inline-flex items-center gap-1.5 px-2 py-1" style={{ border: "1px solid color-mix(in srgb, var(--chart-4) 35%, transparent)", background: "color-mix(in srgb, var(--chart-4) 8%, transparent)" }}>
            <AlertCircle size={12} style={{ color: "var(--chart-4)" }} />
            <span className="text-xs" style={{ color: "var(--chart-4)", fontFamily: MONO }}>{order.orderStatus === "cancelled" ? "Cancelled" : "Disputed"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
