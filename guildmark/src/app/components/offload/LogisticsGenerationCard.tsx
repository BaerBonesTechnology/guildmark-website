import { ArrowUpRight, PackageCheck } from "lucide-react";
import { Link } from "react-router";
import type { Order } from "../../models/order";
import { useOffloadShippingViewModel } from "../../viewmodels/useOffloadShippingViewModel";

export function LogisticsGenerationCard({
  funded,
  base,
}: {
  funded: Order[];
  base: string;
}) {
  const vm = useOffloadShippingViewModel(funded);
  return (
    <section className="gm-offload-card gm-dispatch">
      <div className="gm-offload-section-heading">
        <h2>Prepare your next shipment</h2>
        <PackageCheck size={20} aria-hidden="true" />
      </div>
      <p>
        Confirm payment is funded and review the delivery address before
        dispatch. Add tracking once your equipment has shipped.
      </p>
      {vm.notice && (
        <p className="gm-offload-success" role="status">
          {vm.notice}
        </p>
      )}
      {vm.selected ? (
        <>
          <span className="gm-offload-tag">{funded.length} ready to ship</span>
          <form
            className="gm-dispatch-form"
            onSubmit={(event) => {
              event.preventDefault();
              vm.submit();
            }}
            aria-busy={vm.isPending}
          >
            <label className="gm-offload-label" htmlFor="dispatch-order">
              Funded order
            </label>
            <select
              id="dispatch-order"
              disabled={vm.isPending}
              value={vm.selected.id}
              onChange={(event) => vm.select(event.target.value)}
            >
              {funded.map((order) => (
                <option value={order.id} key={order.id}>
                  {order.transactionId} · {order.productName}
                </option>
              ))}
            </select>
            <p className="gm-dispatch-product">
              {vm.selected.productName}
              <br />
              {vm.selected.quantity} units · {vm.selected.transactionId}
            </p>
            <Link
              className="gm-text-link"
              to={`${base}/orders/${encodeURIComponent(vm.selected.id)}`}
            >
              Review order and address{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <label className="gm-offload-label" htmlFor="dispatch-tracking">
              FedEx tracking number
            </label>
            <input
              id="dispatch-tracking"
              aria-describedby="dispatch-help"
              required
              maxLength={120}
              autoComplete="off"
              disabled={vm.isPending}
              value={vm.trackingNumber}
              onChange={(event) => vm.setTrackingNumber(event.target.value)}
            />
            <p id="dispatch-help" className="gm-offload-footnote">
              Recording tracking marks this order as shipped and shares the
              number with the buyer.
            </p>
            {vm.error && (
              <p role="alert" className="gm-offload-form-error">
                {vm.error}
              </p>
            )}
            <button
              type="submit"
              className="gm-button gm-button-small"
              disabled={vm.isPending || !vm.trackingNumber.trim()}
            >
              {vm.isPending ? "Recording shipment…" : "Record shipment"}
            </button>
          </form>
        </>
      ) : (
        <div className="gm-offload-quiet">
          <h3>No shipments to prepare</h3>
          <p>Sales appear here when buyer payment is funded.</p>
          <Link className="gm-text-link" to={`${base}/my-listings`}>
            Review your listings <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
      <p className="gm-offload-footnote">
        Shipping labels and pallet booking are not available here. Arrange
        shipping before recording dispatch.
      </p>
    </section>
  );
}
