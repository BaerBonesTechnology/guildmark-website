/**
 * EditListingDialog — edit a listing's price (View).
 * Price state, validation, and the FMV flag hint live in
 * useEditListingViewModel. Presentation only.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Listing } from "../models/listing";
import { useEditListingViewModel } from "../viewmodels/useEditListingViewModel";

interface Props {
  listing: Listing | null;
  onOpenChange: (open: boolean) => void;
}

export function EditListingDialog({ listing, onOpenChange }: Props) {
  const { error, flagHint, fmv, handlePriceChange, handleSave, price, updatePrice } = useEditListingViewModel(listing, onOpenChange);

  return (
    <Dialog open={!!listing} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm ">
        <DialogHeader>
          <DialogTitle className="">Edit Listing Price</DialogTitle>
          <DialogDescription className=" text-xs truncate">
            {listing?.model_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className=" text-xs uppercase tracking-wide">Listed Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                className="pl-6 "
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
            {fmv && (
              <p className="text-xs text-muted-foreground ">
                FMV: ${fmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {flagHint && (
              <p className={`text-xs  ${
                flagHint.startsWith("✓") ? "text-primary" : "text-warning"
              }`}>
                {flagHint}
              </p>
            )}
            {error && <p className="text-xs text-red-500 ">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className=""
              onClick={() => onOpenChange(false)}
              disabled={updatePrice.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white "
              onClick={handleSave}
              disabled={updatePrice.isPending}
            >
              {updatePrice.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
