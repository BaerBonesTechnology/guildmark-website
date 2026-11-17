import { Pencil, ArrowUpRight, Archive } from "lucide-react";
import type { Listing } from "../../models/listing";
import { listingTotalValue } from "../../services/listing.service";

interface Props {
  listing: Listing;
  isBusy: boolean;
  busyAction: string | null;
  isActing: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onWithdraw: () => void;
}
export function ListingRow({
  listing,
  isBusy,
  busyAction,
  isActing,
  onEdit,
  onPublish,
  onWithdraw,
}: Props) {
  const name = listing.model_name ?? "Untitled hardware";
  return (
    <tr>
      <td data-label="Equipment">
        <strong>{name}</strong>
        <small>
          {listing.asset_type ?? "Hardware"}
          {listing.condition_grade && (
            <>
              {" "}
              ·{" "}
              <span
                className={`gm-inventory-grade grade-${listing.condition_grade.toLowerCase()}`}
              >
                Grade {listing.condition_grade}
              </span>
            </>
          )}
        </small>
        {listing.valuation_flag === "seller_overpriced" && (
          <span className="gm-inventory-warning">Above fair-market range</span>
        )}
        {listing.valuation_flag === "distressed" && (
          <span className="gm-inventory-warning">Below fair-market range</span>
        )}
        {(!listing.valuation_flag ||
          listing.valuation_flag === "insufficient_data") && (
          <small>Valuation unavailable</small>
        )}
      </td>
      <td data-label="Units">{listing.quantity ?? 1}</td>
      <td data-label="Price / unit">
        {listing.listed_price == null
          ? "Not priced"
          : `$${listing.listed_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </td>
      <td data-label="Gross value">
        {listing.listed_price == null
          ? "—"
          : `$${listingTotalValue(listing).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </td>
      <td data-label="Status">
        <span className={`gm-inventory-status status-${listing.status}`}>
          {listing.status}
        </span>
      </td>
      <td data-label="Actions">
        <div className="gm-inventory-actions">
          {listing.status === "draft" && (
            <button
              disabled={isActing}
              onClick={onPublish}
              aria-label={`Publish ${name}`}
            >
              <ArrowUpRight size={14} aria-hidden="true" />
              {isBusy && busyAction === "publish" ? "Publishing…" : "Publish"}
            </button>
          )}
          {["draft", "active"].includes(listing.status) && (
            <>
              <button
                disabled={isActing}
                onClick={onEdit}
                aria-label={`Edit price for ${name}`}
              >
                <Pencil size={14} aria-hidden="true" />
                Edit price
              </button>
              <button
                disabled={isActing}
                onClick={onWithdraw}
                aria-label={`Withdraw ${name}`}
              >
                <Archive size={14} aria-hidden="true" />
                {isBusy && busyAction === "withdraw"
                  ? "Withdrawing…"
                  : "Withdraw"}
              </button>
            </>
          )}
          {!["draft", "active"].includes(listing.status) && (
            <span className="gm-inventory-muted">No actions available</span>
          )}
        </div>
      </td>
    </tr>
  );
}
