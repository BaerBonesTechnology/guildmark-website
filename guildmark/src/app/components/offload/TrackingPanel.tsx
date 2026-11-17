import { RefreshCw } from "lucide-react";
import { useOrderTracking } from "../../lib/apiHooks";
import type { Order } from "../../models/order";
import { buildSteps, fmtDateTime } from "../../services/offload.service";

export function TrackingPanel({
  orderId,
  order,
}: {
  orderId: string;
  order: Order;
}) {
  const canTrack =
    Boolean(order.trackingNumber) &&
    ["shipped", "delivered"].includes(order.orderStatus);
  const {
    data: tracking,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrderTracking(orderId, canTrack);
  const steps = buildSteps(order);
  return (
    <div className="gm-offload-tracking">
      <ol className="gm-offload-pipeline" aria-label="Order milestones">
        {steps.map(({ id, label, Icon, status }) => (
          <li
            key={id}
            className={`is-${status}`}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="gm-offload-step-icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span>
              {label}
              <small>
                {status === "complete"
                  ? "Confirmed"
                  : status === "active"
                    ? "Next milestone"
                    : "Pending"}
              </small>
            </span>
          </li>
        ))}
      </ol>
      <p className="gm-offload-footnote">
        Milestones reflect order records. Delivery does not confirm data erasure
        or bank settlement.
      </p>
      {canTrack && (
        <div className="gm-offload-carrier">
          <div>
            <strong>{order.carrier || "Carrier"} tracking</strong>
            <button
              className="gm-text-link"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              <RefreshCw size={13} aria-hidden="true" />
              {isFetching ? "Refreshing…" : "Refresh tracking"}
            </button>
          </div>
          <p className="gm-tracking-number">{order.trackingNumber}</p>
          {isLoading && <p role="status">Loading carrier updates…</p>}
          {error && (
            <p role="alert">
              Carrier updates couldn’t be loaded. Try refreshing tracking.
            </p>
          )}
          {!isLoading && !tracking && !error && (
            <p>
              Carrier updates are temporarily unavailable. Your order milestones
              are shown above.
            </p>
          )}
          {tracking && (
            <>
              <p className="gm-carrier-status">{tracking.status}</p>
              {tracking.actual_delivery ? (
                <p>Delivered {fmtDateTime(tracking.actual_delivery)}</p>
              ) : (
                tracking.estimated_delivery && (
                  <p>
                    Estimated delivery{" "}
                    {fmtDateTime(tracking.estimated_delivery)}
                  </p>
                )
              )}
              {tracking.events.length > 0 && (
                <ul className="gm-offload-events">
                  {tracking.events.slice(0, 6).map((event, index) => (
                    <li key={`${event.timestamp}-${index}`}>
                      <time>{fmtDateTime(event.timestamp)}</time>
                      <div>
                        <p>{event.event_description}</p>
                        <small>
                          {[event.city, event.state, event.country]
                            .filter(Boolean)
                            .join(", ")}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
      {!order.trackingNumber && (
        <p className="gm-offload-footnote">
          No tracking number has been added to this order.
        </p>
      )}
    </div>
  );
}
