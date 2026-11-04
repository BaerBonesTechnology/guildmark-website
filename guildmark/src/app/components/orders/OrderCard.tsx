import { Link } from "react-router";
import { ArrowUpRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { orderLifecycleConfig, orderMoney } from "../../services/order.service";
import type { Order } from "../../models/order";

export function OrderCard({
  order,
  base = "/pre",
  queryString = "",
}: {
  order: Order;
  base?: string;
  queryString?: string;
}) {
  const status = orderLifecycleConfig(order.orderStatus);
  const Icon = order.type === "sale" ? ShoppingBag : ShoppingCart;
  return (
    <li className="gm-order-card">
      <div className="gm-order-card-product">
        <span className="gm-order-type-icon">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <span className="gm-order-meta">
            {order.type === "sale" ? "Sale" : "Purchase"} ·{" "}
            {order.transactionId}
          </span>
          <h2>
            <Link
              to={`${base}/orders/${encodeURIComponent(order.id)}${queryString ? `?${queryString}` : ""}`}
            >
              {order.productName}
            </Link>
          </h2>
          <p>
            {order.quantity} {order.quantity === 1 ? "unit" : "units"} ·{" "}
            {order.type === "sale" ? "Buyer" : "Seller"}: {order.counterparty}
          </p>
          {order.specs && <p>{order.specs}</p>}
        </div>
      </div>
      <div className="gm-order-card-status">
        <span
          className="gm-order-status"
          style={{
            color: status.color,
            borderColor: `color-mix(in srgb,${status.color} 28%,transparent)`,
            background: `color-mix(in srgb,${status.color} 7%,var(--card))`,
          }}
        >
          <status.Icon size={13} aria-hidden="true" />
          {status.label}
        </span>
        {order.trackingNumber && <small>Tracking recorded</small>}
      </div>
      <div className="gm-order-card-value">
        <strong>{orderMoney(order.totalValue)}</strong>
        <span>Order amount · USD</span>
      </div>
      <Link
        className="gm-order-view"
        aria-label={`View order ${order.transactionId}`}
        to={`${base}/orders/${encodeURIComponent(order.id)}${queryString ? `?${queryString}` : ""}`}
      >
        <span>View order</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </li>
  );
}
