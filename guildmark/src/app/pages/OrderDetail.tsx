import { useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock,
  ExternalLink,
  Hash,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { OrderDetailRow } from "../components/orders/OrderDetailRow";
import { OrderPanel } from "../components/orders/OrderPanel";
import { OrderTimeline } from "../components/orders/OrderTimeline";
import {
  formatDateTime,
  orderLifecycleConfig,
  orderMoney,
  orderPaymentLink,
} from "../services/order.service";
import { useOrderDetailViewModel } from "../viewmodels/useOrderDetailViewModel";
import { ApiError } from "../lib/api";
import "../../styles/orders.css";

export function OrderDetail() {
  const { id } = useParams();
  return <OrderDetailContent key={id} />;
}
function OrderDetailContent() {
  const vm = useOrderDetailViewModel();
  const location = useLocation();
  const base = location.pathname.startsWith("/pre/") ? "/pre" : "";
  const opener = useRef<HTMLElement | null>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const order = vm.order;
  const back = (
    <Link className="gm-order-back" to={`${base}/orders${location.search}`}>
      <ArrowLeft size={15} aria-hidden="true" />
      Back to orders
    </Link>
  );
  if (vm.isLoading)
    return (
      <div className="gm-order-detail gm-container">
        {back}
        <div className="gm-order-loading" aria-busy="true">
          <p role="status">Loading order records…</p>
          {[1, 2, 3].map((i) => (
            <div key={i} aria-hidden="true" />
          ))}
        </div>
      </div>
    );
  if (!order)
    return (
      <div className="gm-order-detail gm-container">
        {back}
        <section className="gm-order-panel gm-order-empty" role="alert">
          <h1>
            {vm.error instanceof ApiError && vm.error.status === 404
              ? "Order not found"
              : "Order records unavailable"}
          </h1>
          <p>We couldn’t load this order. Check the link or try again.</p>
          <button
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={vm.refresh}
          >
            {vm.isFetching ? "Retrying…" : "Try again"}
          </button>
        </section>
      </div>
    );
  const status = orderLifecycleConfig(order.orderStatus);
  const paymentLink =
    !vm.isError && !vm.isFetching ? orderPaymentLink(order) : null;
  return (
    <div className="gm-order-detail gm-container">
      {back}
      <header className="gm-order-detail-heading">
        <div>
          <span className="gm-order-meta">
            {vm.isBuyer ? "Purchase" : "Sale"} · {order.transactionId}
          </span>
          <h1>{order.productName}</h1>
          <p>
            {order.specs ?? "Business hardware"} · {order.quantity}{" "}
            {order.quantity === 1 ? "unit" : "units"}
          </p>
        </div>
        <span
          className="gm-order-status"
          style={{
            color: status.color,
            borderColor: `color-mix(in srgb,${status.color} 28%,transparent)`,
            background: `color-mix(in srgb,${status.color} 7%,var(--card))`,
          }}
        >
          <status.Icon size={14} aria-hidden="true" />
          {status.label}
        </span>
      </header>
      {vm.isError && (
        <div className="gm-order-notice" role="alert">
          <div>
            <strong>These records may be out of date.</strong>
            <p>Refresh the order before taking an action.</p>
          </div>
          <button
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={vm.refresh}
          >
            Refresh order
          </button>
        </div>
      )}
      {vm.actionError && (
        <div className="gm-order-notice" role="alert">
          <p>{vm.actionError}</p>
          <button
            data-order-refresh
            className="gm-button gm-button-small"
            disabled={vm.isFetching}
            onClick={vm.refresh}
          >
            {vm.isFetching ? "Refreshing…" : "Refresh order"}
          </button>
        </div>
      )}
      {vm.notice && (
        <p className="gm-order-notice is-success" role="status">
          {vm.notice}
        </p>
      )}
      {vm.canAct && (
        <section className="gm-order-inspection">
          <div>
            <h2>Inspect your delivery</h2>
            <p>
              Check the equipment before confirming receipt. Confirmation
              requests release of payment to the seller. If there’s an issue,
              open a dispute instead.
            </p>
            {order.inspectionEndsAt && (
              <p className="gm-order-deadline">
                <CalendarClock size={15} aria-hidden="true" />
                Inspection ends {formatDateTime(order.inspectionEndsAt)}
              </p>
            )}
          </div>
          <div className="gm-order-inspection-actions">
            <button
              className="gm-button gm-button-small"
              disabled={vm.busy}
              onClick={() => vm.setReview("confirm")}
            >
              Review receipt confirmation
            </button>
            <button
              className="gm-text-link"
              disabled={vm.busy}
              onClick={() => vm.setReview("dispute")}
            >
              Review dispute
            </button>
          </div>
        </section>
      )}
      <OrderTimeline order={order} />
      <div className="gm-order-detail-grid">
        <div>
          <OrderPanel title="Order records">
            <dl>
              <OrderDetailRow
                icon={Hash}
                label="Transaction"
                value={order.transactionId}
              />
              <OrderDetailRow
                icon={User}
                label={vm.isBuyer ? "Seller" : "Buyer"}
                value={order.counterparty || "Not provided"}
              />
              <OrderDetailRow
                icon={Package}
                label="Quantity"
                value={`${order.quantity} ${order.quantity === 1 ? "unit" : "units"}`}
              />
              <OrderDetailRow
                icon={MapPin}
                label="Destination"
                value={order.destination || "Not provided"}
              />
              <OrderDetailRow
                icon={Clock}
                label="Created"
                value={formatDateTime(order.createdAt)}
              />
            </dl>
          </OrderPanel>
          <OrderPanel title="Shipment">
            <dl>
              <OrderDetailRow
                icon={Truck}
                label="Carrier"
                value={order.carrier || "Not provided"}
              />
              <OrderDetailRow
                icon={Hash}
                label="Tracking"
                value={order.trackingNumber || "No tracking recorded"}
              />
              <OrderDetailRow
                icon={CalendarClock}
                label="Shipped"
                value={formatDateTime(order.shippedAt)}
              />
              <OrderDetailRow
                icon={CheckCircle2}
                label="Delivered"
                value={formatDateTime(order.deliveredAt)}
              />
            </dl>
            {!vm.isBuyer && (
              <Link
                className="gm-text-link"
                to={`${base}/offload?order=${encodeURIComponent(order.id)}`}
              >
                Seller shipping workspace{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            )}
          </OrderPanel>
        </div>
        <div>
          <OrderPanel title="Recorded amounts">
            <div className="gm-order-amount">
              <span>Order amount · USD</span>
              <strong>{orderMoney(order.totalValue)}</strong>
            </div>
            <dl className="gm-order-fees">
              <div>
                <dt>{vm.isBuyer ? "Buyer fee" : "Seller fee"}</dt>
                <dd>
                  {orderMoney(vm.isBuyer ? order.buyerFee : order.sellerFee)}
                </dd>
              </div>
              {vm.isBuyer && (
                <div>
                  <dt>Deferred payment fee</dt>
                  <dd>{orderMoney(order.deferralFee)}</dd>
                </div>
              )}
              {!vm.isBuyer && (
                <div>
                  <dt>Recorded seller proceeds</dt>
                  <dd>{orderMoney(order.escrowAmount)}</dd>
                </div>
              )}
            </dl>
            <p className="gm-order-help">
              Order amounts and fee snapshots are not confirmation of
              settlement. Unavailable fees are not assumed to be zero.
            </p>
          </OrderPanel>
          <OrderPanel title="Payment & inspection">
            <dl>
              <OrderDetailRow
                icon={ShieldCheck}
                label="Escrow record"
                value={
                  order.escrowTransactionId || "No escrow reference recorded"
                }
              />
              <OrderDetailRow
                icon={CircleDot}
                label="Escrow status"
                value={order.escrowStatus || "Not available"}
              />
              <OrderDetailRow
                icon={CalendarClock}
                label="Inspection ends"
                value={formatDateTime(order.inspectionEndsAt)}
              />
              <OrderDetailRow
                icon={CheckCircle2}
                label="Completed"
                value={formatDateTime(order.completedAt)}
              />
            </dl>
            {paymentLink && (
              <a
                className="gm-text-link"
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue to payment{" "}
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {vm.isBuyer &&
              order.orderStatus === "awaiting_payment" &&
              !paymentLink && (
                <p className="gm-order-help">
                  A payment link is not currently available. Refresh the order
                  to check for updates.
                </p>
              )}
          </OrderPanel>
        </div>
      </div>
      <div className="gm-order-record-footer">
        <p>Review the latest order records before acting.</p>
        <button
          data-order-refresh
          className="gm-text-link"
          disabled={vm.isFetching || vm.busy}
          onClick={vm.refresh}
        >
          {vm.isFetching ? "Refreshing…" : "Refresh order records"}
        </button>
      </div>
      <Dialog
        open={!!vm.review}
        onOpenChange={(open) => {
          if (!open && !vm.busy) vm.setReview(null);
        }}
      >
        <DialogContent
          className="gm-order-action-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            opener.current = document.activeElement as HTMLElement;
            cancel.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (
              opener.current?.isConnected &&
              !opener.current.hasAttribute("disabled")
            )
              opener.current.focus();
            else
              (
                document.querySelector("[data-order-refresh]") as HTMLElement
              )?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {vm.review === "confirm"
                ? "Confirm receipt and release payment?"
                : "Open a dispute for this order?"}
            </DialogTitle>
            <DialogDescription>
              {vm.review === "confirm"
                ? "Confirm only after inspecting the delivered equipment. This requests payment release to the seller and marks the order complete."
                : "Use a dispute when there is an issue with the delivered equipment. This marks the order disputed for review."}
            </DialogDescription>
          </DialogHeader>
          <div className="gm-order-action-summary">
            <strong>{order.productName}</strong>
            <p>
              {order.transactionId} · {order.quantity}{" "}
              {order.quantity === 1 ? "unit" : "units"}
            </p>
            <p>{orderMoney(order.totalValue)} order amount</p>
          </div>
          <div className="gm-order-action-footer">
            <button
              ref={cancel}
              className="gm-text-link"
              disabled={vm.busy}
              onClick={() => vm.setReview(null)}
            >
              Keep reviewing
            </button>
            <button
              className="gm-button gm-button-small"
              disabled={vm.busy || !vm.canAct}
              onClick={vm.submit}
            >
              {vm.busy
                ? "Submitting…"
                : vm.review === "confirm"
                  ? "Confirm and release payment"
                  : "Open dispute"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
