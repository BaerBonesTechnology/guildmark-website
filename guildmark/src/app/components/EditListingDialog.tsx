import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useUpdateListingPrice } from "../lib/apiHooks";
import type { Listing } from "../models/listing";

interface Props {
  listing:      Listing | null;
  onOpenChange: (open: boolean) => void;
}

export function EditListingDialog({ listing, onOpenChange }: Props) {
  const [price, setPrice]     = useState("");
  const [error, setError]     = useState<string | null>(null);
  const updatePrice            = useUpdateListingPrice();

  useEffect(() => {
    if (listing) setPrice(String(listing.listed_price ?? ""));
    setError(null);
  }, [listing]);

  function handleSave() {
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid price greater than 0");
      return;
    }
    updatePrice.mutate(
      { listingId: listing!.id, listed_price: parsed },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const fmv       = listing?.fair_market_value;
  const parsedNum = parseFloat(price);
  const ratio     = fmv && fmv > 0 && !isNaN(parsedNum) ? parsedNum / fmv : null;
  const flagHint  = ratio == null
    ? null
    : ratio >= 1.20 ? "⚠ Above FMV — may be flagged as overpriced"
    : ratio <= 0.60 ? "⚠ Well below FMV — may be flagged as distressed"
    : "✓ Within fair market range";

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
                onChange={(e) => { setPrice(e.target.value); setError(null); }}
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
