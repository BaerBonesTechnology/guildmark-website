import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import type { Listing } from "../models/listing";
import { useEditListingViewModel } from "../viewmodels/useEditListingViewModel";
import "../../styles/listings.css";
interface Props {
  listing: Listing | null;
  onOpenChange: (open: boolean) => void;
}
export function EditListingDialog({ listing, onOpenChange }: Props) {
  const opener = useRef<HTMLElement | null>(null);
  const vm = useEditListingViewModel(listing, onOpenChange);
  return (
    <Dialog
      open={!!listing}
      onOpenChange={(open) => {
        if (!vm.updatePrice.isPending) onOpenChange(open);
      }}
    >
      <DialogContent
        className="gm-listing-dialog gm-edit-listing"
        onOpenAutoFocus={() => {
          opener.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (opener.current?.isConnected) opener.current.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (vm.updatePrice.isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit listing price</DialogTitle>
          <DialogDescription>
            {listing?.model_name ?? "Hardware listing"} · Changes apply to the
            unit price only.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            vm.handleSave();
          }}
          noValidate
          aria-busy={vm.updatePrice.isPending}
        >
          <fieldset disabled={vm.updatePrice.isPending}>
            <label htmlFor="edit-listing-price">Price per unit (USD)</label>
            <input
              id="edit-listing-price"
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              value={vm.price}
              onChange={(event) => vm.handlePriceChange(event.target.value)}
              aria-invalid={!!vm.error}
              aria-describedby="edit-price-context edit-price-error"
            />
            <div id="edit-price-context" className="gm-price-context">
              {vm.fmv != null && vm.fmv > 0 ? (
                <p>
                  Estimated fair-market value: $
                  {vm.fmv.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  / unit
                </p>
              ) : (
                <p>Fair-market valuation is unavailable for this listing.</p>
              )}
              {vm.flagHint && (
                <p
                  className={
                    vm.flagHint.startsWith("✓") ? "is-good" : "is-warning"
                  }
                >
                  {vm.flagHint}
                </p>
              )}
              <p>Your asking price is not a guaranteed sale or payout.</p>
            </div>
          </fieldset>
          {vm.error && (
            <p id="edit-price-error" className="gm-field-error" role="alert">
              {vm.error}
            </p>
          )}
          <footer className="gm-listing-dialog-footer">
            <button
              type="button"
              className="gm-text-link"
              disabled={vm.updatePrice.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gm-button gm-button-small"
              disabled={vm.updatePrice.isPending}
            >
              {vm.updatePrice.isPending ? "Saving…" : "Save price"}
            </button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
