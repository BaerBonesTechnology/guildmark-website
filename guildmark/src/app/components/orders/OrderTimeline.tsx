import { Check, Circle } from "lucide-react";
import {
  LIFECYCLE_STEPS,
  lifecycleLabel,
  lifecycleStepIndex,
} from "../../services/order.service";
import type { Order } from "../../models/order";
export function OrderTimeline({ order }: { order: Order }) {
  const current = lifecycleStepIndex(order.orderStatus);
  const stopped = ["cancelled", "disputed"].includes(order.orderStatus);
  return (
    <section className="gm-order-panel gm-order-timeline">
      <h2>Order progress</h2>
      {stopped ? (
        <p className="gm-order-timeline-stopped">
          {order.orderStatus === "disputed"
            ? "This order is disputed. Check its payment and shipment records while the issue is reviewed."
            : "This order was cancelled. Its status does not confirm a refund or payment settlement."}
        </p>
      ) : (
        <ol aria-label="Order milestones">
          {LIFECYCLE_STEPS.map((step, index) => (
            <li
              className={
                index < current
                  ? "is-done"
                  : index === current
                    ? "is-current"
                    : "is-pending"
              }
              aria-current={index === current ? "step" : undefined}
              key={step}
            >
              <span className="gm-order-milestone-icon">
                {index < current ||
                (order.orderStatus === "complete" && index === current) ? (
                  <Check size={15} aria-hidden="true" />
                ) : (
                  <Circle size={12} aria-hidden="true" />
                )}
              </span>
              <span>
                {lifecycleLabel(step)}
                <small>
                  {index === current
                    ? "Current status"
                    : index < current
                      ? "Reached"
                      : "Pending"}
                </small>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="gm-order-help">
        Progress reflects order records. Delivery and completion do not
        establish certified data erasure or bank settlement.
      </p>
    </section>
  );
}
