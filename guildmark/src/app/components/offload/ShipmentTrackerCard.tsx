import { Link } from "react-router";
import { Truck } from "lucide-react";
import { TrackingPanel } from "./TrackingPanel";
import { lifecycleLabel } from "../../services/order.service";
import type { Order } from "../../models/order";

export function ShipmentTrackerCard({
  orders,
  onSelect,
  trackedOrder,
  base,
}: {
  orders: Order[];
  onSelect: (id: string) => void;
  trackedOrder: Order | null;
  base: string;
}) {
  return (
    <section className="gm-offload-card" id="shipment-tracker" tabIndex={-1}>
      <div className="gm-offload-section-heading">
        <h2>Follow your sale</h2>
        <Truck size={20} aria-hidden="true" />
      </div>
      {trackedOrder ? (
        <>
          <label className="gm-offload-label" htmlFor="offload-shipment">
            Order
          </label>
          <select
            id="offload-shipment"
            value={trackedOrder.id}
            onChange={(e) => onSelect(e.target.value)}
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.transactionId} · {order.productName}
              </option>
            ))}
          </select>
          <div className="gm-offload-tracked">
            <Link to={`${base}/orders/${encodeURIComponent(trackedOrder.id)}`}>
              {trackedOrder.transactionId}
            </Link>
            <span>{lifecycleLabel(trackedOrder.orderStatus)}</span>
          </div>
          <TrackingPanel
            key={trackedOrder.id}
            orderId={trackedOrder.id}
            order={trackedOrder}
          />
        </>
      ) : (
        <div className="gm-offload-quiet">
          <h3>Every sale, in one place</h3>
          <p>
            Once you have an order, follow its payment, shipment, and inspection
            milestones here.
          </p>
        </div>
      )}
    </section>
  );
}
