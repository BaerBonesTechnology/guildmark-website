import { useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  OFFER_STATUS_COLOR,
  OFFER_STATUS_COPY,
  OFFER_STATUS_LABEL,
} from "../../constants/offer.constants";
import {
  canCreateOfferOrder,
  counterpartyLabel,
  effectiveOfferStatus,
  formatOfferDate,
  isOfferActionable,
  offerMoney,
  offerSubtotal,
  priceDeltaPercent,
  validateOfferTerms,
} from "../../services/offer.service";
import { useOfferClock } from "../../hooks/useOfferClock";
import { useOfferDialogViewModel } from "../../viewmodels/useOfferDialogViewModel";
import type { OfferRole, SellerOffer } from "../../models/offer";
import "../../../styles/offers.css";
interface Props {
  mode: OfferRole;
  offer: SellerOffer | null;
  onOpenChange: (open: boolean) => void;
  stale?: boolean;
  refresh?: () => Promise<boolean>;
  onResolved?: (text: string) => void;
}
export function OfferDialog(props: Props) {
  return props.offer ? (
    <OfferDialogContent
      key={`${props.mode}-${props.offer.id}`}
      {...props}
      offer={props.offer}
    />
  ) : null;
}
function OfferDialogContent({
  offer,
  mode,
  onOpenChange,
  stale = false,
  refresh,
  onResolved,
}: Omit<Props, "offer"> & { offer: SellerOffer }) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const base = useLocation().pathname.startsWith("/pre/") ? "/pre" : "";
  const offers = useMemo(() => [offer], [offer]);
  const now = useOfferClock(offers);
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const counterInput = useRef<HTMLInputElement>(null);
  const fallbackRefresh = async () => {
    const key = mode === "received" ? ["seller-offers"] : ["my-offers"];
    await client.refetchQueries({ queryKey: key, type: "active" });
    return client.getQueryState(key)?.status === "success";
  };
  const vm = useOfferDialogViewModel(
    offer,
    mode,
    stale,
    refresh ?? fallbackRefresh,
    (text) => {
      onResolved?.(text);
      onOpenChange(false);
    },
    (id) => {
      onOpenChange(false);
      navigate(`${base}/orders/${encodeURIComponent(id)}`);
    },
  );
  const status = effectiveOfferStatus(offer, now);
  const color = OFFER_STATUS_COLOR[status];
  const canRespond = isOfferActionable(offer, mode, now);
  const canOrder = canCreateOfferOrder(offer, mode, now);
  const delta = priceDeltaPercent(offer.offer_price, offer.listed_price);
  const action = vm.action;
  const actionAllowed = action === "order" ? canOrder : canRespond;
  const actionPrice =
    action === "counter"
      ? validateOfferTerms(vm.counterPrice, String(offer.quantity))
        ? NaN
        : Number(vm.counterPrice)
      : offer.offer_price;
  function startCounter() {
    vm.start("counter");
    queueMicrotask(() => counterInput.current?.focus());
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !vm.busy) onOpenChange(false);
      }}
    >
      <DialogContent
        className="gm-offer-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          opener.current = document.activeElement as HTMLElement;
          closeButton.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (
            opener.current?.isConnected &&
            opener.current.matches("button,a,input,select,textarea,[tabindex]")
          )
            opener.current.focus();
          else
            (
              document.querySelector(
                '[aria-label="Search offers"]',
              ) as HTMLElement
            )?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{offer.model_name || "Hardware offer"}</DialogTitle>
          <DialogDescription>
            {counterpartyLabel(offer, mode)} · {offer.quantity}{" "}
            {offer.quantity === 1 ? "unit" : "units"}
          </DialogDescription>
        </DialogHeader>
        <div className="gm-offer-dialog-body">
          <span
            className="gm-offer-badge"
            style={{
              color,
              borderColor: `color-mix(in srgb,${color} 28%,transparent)`,
              background: `color-mix(in srgb,${color} 7%,var(--card))`,
            }}
          >
            {OFFER_STATUS_LABEL[status]}
          </span>
          <dl className="gm-offer-price-grid">
            <div>
              <dt>
                {mode === "received" ? "Buyer’s offer" : "Your offer"} / unit
              </dt>
              <dd>{offerMoney(offer.offer_price)}</dd>
            </div>
            <div>
              <dt>Listed price / unit</dt>
              <dd>{offerMoney(offer.listed_price)}</dd>
            </div>
            <div>
              <dt>Offer total before fees</dt>
              <dd>
                {offerMoney(offerSubtotal(offer.offer_price, offer.quantity))}
              </dd>
            </div>
          </dl>
          {delta != null && (
            <p className="gm-offer-help">
              {Math.abs(delta) < 0.05
                ? "At the listed price"
                : `${Math.abs(delta).toFixed(1)}% ${delta < 0 ? "below" : "above"} the listed unit price`}
              .
            </p>
          )}
          <dl className="gm-offer-dates">
            <div>
              <dt>Placed</dt>
              <dd>{formatOfferDate(offer.created_at)}</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{formatOfferDate(offer.expires_at)}</dd>
            </div>
          </dl>
          {offer.message && (
            <blockquote className="gm-offer-message">
              {offer.message}
            </blockquote>
          )}
          {offer.counter_price != null && (
            <div className="gm-offer-counter-record">
              <strong>
                {mode === "received"
                  ? "Your counteroffer"
                  : "Seller’s counteroffer"}
              </strong>
              <p>
                {offerMoney(offer.counter_price)} / unit ·{" "}
                {offerMoney(offerSubtotal(offer.counter_price, offer.quantity))}{" "}
                before fees
              </p>
            </div>
          )}
          <p className="gm-offer-status-copy">
            {OFFER_STATUS_COPY[status][mode]}
          </p>
          {status === "pending" && !canRespond && mode === "received" && (
            <p className="gm-offer-help">
              Current expiry, price, or quantity could not be verified. Refresh
              before responding.
            </p>
          )}
          {stale && (
            <p className="gm-offer-feedback" role="status">
              Checking the latest terms. Actions are available after a
              successful refresh.
            </p>
          )}
          {vm.actionError && (
            <p className="gm-offer-feedback" role="alert">
              {vm.actionError}
            </p>
          )}
          {(vm.needsRefresh || stale) && (
            <button
              className="gm-text-link"
              disabled={vm.refreshing || vm.busy}
              onClick={vm.refreshOffer}
            >
              {vm.refreshing ? "Refreshing…" : "Refresh offer"}
            </button>
          )}
          {action && (
            <section className="gm-offer-action-review">
              <h2>
                {action === "accept"
                  ? "Accept these terms?"
                  : action === "reject"
                    ? "Decline this offer?"
                    : action === "order"
                      ? "Create an order from this quote?"
                      : "Propose a counteroffer"}
              </h2>
              <p>
                {action === "accept"
                  ? "Acceptance does not reserve inventory or confirm payment. Other pending offers on this listing may be declined."
                  : action === "reject"
                    ? "The buyer will see this offer as declined."
                    : action === "order"
                      ? "Creating an order reserves inventory at the accepted price. Review payment and fee records on the order before funding."
                      : "The counter applies to the same quantity. It does not confirm buyer acceptance."}
              </p>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  vm.submit();
                }}
                aria-busy={vm.busy}
              >
                {action === "counter" && (
                  <>
                    <label htmlFor="offer-counter-price">
                      Counter price per unit (USD)
                    </label>
                    <input
                      ref={counterInput}
                      id="offer-counter-price"
                      type="number"
                      min="0.01"
                      max="1000000"
                      step="0.01"
                      value={vm.counterPrice}
                      disabled={vm.busy}
                      onChange={(event) =>
                        vm.setCounterPrice(event.target.value)
                      }
                      aria-invalid={!!vm.fieldError}
                      aria-describedby="offer-counter-error"
                    />
                    {vm.fieldError && (
                      <p
                        id="offer-counter-error"
                        className="gm-offer-field-error"
                        role="alert"
                      >
                        {vm.fieldError}
                      </p>
                    )}
                  </>
                )}
                {action !== "reject" && (
                  <p className="gm-offer-action-total">
                    {offer.quantity} {offer.quantity === 1 ? "unit" : "units"} ×{" "}
                    {offerMoney(actionPrice)} ={" "}
                    <strong>
                      {offerMoney(offerSubtotal(actionPrice, offer.quantity))}
                    </strong>{" "}
                    before fees
                  </p>
                )}
                {!actionAllowed && (
                  <p className="gm-offer-field-error" role="status">
                    The offer status or expiry changed. Review the latest terms
                    before continuing.
                  </p>
                )}
                <div className="gm-offer-actions">
                  <button
                    type="button"
                    className="gm-text-link"
                    disabled={vm.busy}
                    onClick={vm.back}
                  >
                    Back to offer
                  </button>
                  <button
                    className="gm-button gm-button-small"
                    type="submit"
                    disabled={vm.busy || vm.blocked || !actionAllowed}
                  >
                    {vm.busy
                      ? "Submitting…"
                      : action === "accept"
                        ? "Accept offer"
                        : action === "reject"
                          ? "Decline offer"
                          : action === "order"
                            ? "Create order"
                            : "Send counteroffer"}
                  </button>
                </div>
              </form>
            </section>
          )}
          {!action && canRespond && (
            <div className="gm-offer-actions">
              <button
                className="gm-button gm-button-small"
                disabled={vm.busy || vm.blocked}
                onClick={() => vm.start("accept")}
              >
                Review acceptance
              </button>
              <button
                className="gm-offer-secondary"
                disabled={vm.busy || vm.blocked}
                onClick={startCounter}
              >
                Counteroffer
              </button>
              <button
                className="gm-text-link"
                disabled={vm.busy || vm.blocked}
                onClick={() => vm.start("reject")}
              >
                Decline
              </button>
            </div>
          )}
          {!action && canOrder && (
            <button
              className="gm-button gm-button-small"
              disabled={vm.busy || vm.blocked}
              onClick={() => vm.start("order")}
            >
              Prepare order
            </button>
          )}
          <div className="gm-offer-links">
            <Link
              className="gm-text-link"
              to={`${base}/marketplace/${encodeURIComponent(offer.listing_id)}`}
              onClick={(event) => {
                if (vm.busy) {
                  event.preventDefault();
                  return;
                }
                onOpenChange(false);
              }}
            >
              View listing <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            {status === "accepted" && (
              <Link
                className="gm-text-link"
                to={`${base}/orders`}
                onClick={(event) => {
                  if (vm.busy) event.preventDefault();
                  else onOpenChange(false);
                }}
              >
                View orders <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
        <footer className="gm-offer-dialog-footer">
          <button
            ref={closeButton}
            className="gm-text-link"
            disabled={vm.busy}
            onClick={() => onOpenChange(false)}
          >
            Close offer
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
